/**
 * POST /api/github/codex-review
 *
 * GitHub organization webhook for automatic PR code review.
 * Model: gpt-5.4
 *
 * Flow: GitHub webhook → verify HMAC → fetch diff via API → GPT-5.4 review → post PR comment
 *
 * Env vars: GITHUB_WEBHOOK_SECRET, GITHUB_TOKEN, OPENAI_API_KEY
 */

import { createHmac } from "crypto"
import { NextRequest, NextResponse } from "next/server"

export const maxDuration = 60

const REVIEW_MODEL = "gpt-5.4"
const MAX_DIFF_CHARS = 14000

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return result === 0
}

function verifySignature(body: string, header: string, secret: string): boolean {
  const expected =
    "sha256=" + createHmac("sha256", secret).update(body).digest("hex")
  return timingSafeEqual(expected, header)
}

async function fetchDiff(
  owner: string,
  repo: string,
  pullNumber: number,
  githubToken: string
): Promise<string> {
  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/pulls/${pullNumber}`,
    {
      headers: {
        Authorization: `token ${githubToken}`,
        Accept: "application/vnd.github.v3.diff",
        "User-Agent": "Rumi-Codex-Review-Bot",
      },
    }
  )
  if (!res.ok) throw new Error(`Diff fetch failed: ${res.status}`)
  return res.text()
}

async function generateReview(
  diff: string,
  prTitle: string,
  prBody: string,
  repoName: string
): Promise<string> {
  const truncated =
    diff.length > MAX_DIFF_CHARS
      ? diff.slice(0, MAX_DIFF_CHARS) + "\n\n[... diff truncated ...]"
      : diff

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: REVIEW_MODEL,
      messages: [
        {
          role: "system",
          content: `You are a senior software engineer reviewing a PR in ${repoName}.

Review for:
- **Bugs & logic errors** — incorrect conditions, race conditions
- **Security vulnerabilities** — injection, XSS, hardcoded secrets
- **Performance issues** — N+1 queries, blocking ops, memory leaks
- **Error handling gaps** — unhandled exceptions, missing validation

Severity levels:
🔴 **Critical** — must fix before merge
🟡 **Warning** — should fix
🟢 **Suggestion** — optional

Be specific: cite filenames and line context. Skip style nitpicks.
If the code looks clean, say so briefly.`,
        },
        {
          role: "user",
          content: `**PR: ${prTitle}**\n${prBody ? `**Description:** ${prBody}\n` : ""}\n\`\`\`diff\n${truncated}\n\`\`\``,
        },
      ],
      max_tokens: 1200,
      temperature: 0.1,
    }),
  })

  if (!res.ok) {
    const err = await res.text().catch(() => "")
    throw new Error(`OpenAI error: ${res.status} — ${err}`)
  }
  const data = (await res.json()) as {
    choices: Array<{ message: { content: string } }>
  }
  return data.choices[0].message.content
}

async function postPRReview(
  owner: string,
  repo: string,
  pullNumber: number,
  reviewBody: string,
  githubToken: string
): Promise<void> {
  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/pulls/${pullNumber}/reviews`,
    {
      method: "POST",
      headers: {
        Authorization: `token ${githubToken}`,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
        "User-Agent": "Rumi-Codex-Review-Bot",
      },
      body: JSON.stringify({
        body: `## 🤖 Codex AI Review\n\n${reviewBody}\n\n---\n*Reviewed by ${REVIEW_MODEL}*`,
        event: "COMMENT",
      }),
    }
  )
  if (!res.ok) {
    const err = await res.text().catch(() => "")
    throw new Error(`Post review failed: ${res.status} — ${err}`)
  }
}

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.GITHUB_WEBHOOK_SECRET
  const githubToken = process.env.GITHUB_TOKEN
  const openaiKey = process.env.OPENAI_API_KEY

  if (!webhookSecret || !githubToken || !openaiKey) {
    return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 })
  }

  const body = await req.text()
  const sig = req.headers.get("x-hub-signature-256") ?? ""

  if (!sig || !verifySignature(body, sig, webhookSecret)) {
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 401 })
  }

  const event = req.headers.get("x-github-event")
  if (event !== "pull_request") {
    return NextResponse.json({ skipped: true, reason: `event=${event}` })
  }

  let payload: {
    action: string
    pull_request: {
      number: number
      title: string
      body: string | null
      draft: boolean
    }
    repository: { name: string; full_name: string; owner: { login: string } }
  }

  try {
    payload = JSON.parse(body)
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const { action, pull_request: pr, repository } = payload

  if (!["opened", "synchronize", "reopened"].includes(action)) {
    return NextResponse.json({ skipped: true, reason: `action=${action}` })
  }
  if (pr.draft) {
    return NextResponse.json({ skipped: true, reason: "draft PR" })
  }

  const owner = repository.owner.login
  const repo = repository.name

  try {
    const diff = await fetchDiff(owner, repo, pr.number, githubToken)
    if (!diff.trim()) {
      return NextResponse.json({ skipped: true, reason: "empty diff" })
    }
    const review = await generateReview(diff, pr.title, pr.body ?? "", repository.full_name)
    await postPRReview(owner, repo, pr.number, review, githubToken)
    return NextResponse.json({ success: true, pr: pr.number, repo: repository.full_name })
  } catch (err) {
    console.error(`[codex-review] Error on ${repository.full_name}#${pr.number}:`, err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    )
  }
}
