/**
 * POST /api/github/codex-review
 *
 * GitHub organization webhook receiver for automatic PR code review.
 * Triggered by pull_request events (opened, synchronize, reopened).
 *
 * Flow: GitHub webhook → verify HMAC-SHA256 → fetch diff → OpenAI review → post PR comment
 *
 * Required env vars:
 *   GITHUB_WEBHOOK_SECRET  — secret set when creating the GitHub webhook
 *   GITHUB_TOKEN           — PAT with repo/pull_requests write scope (or fine-grained token)
 *   OPENAI_API_KEY         — OpenAI API key for code review
 */

import { createHmac } from "crypto"
import { NextRequest, NextResponse } from "next/server"

const MAX_DIFF_CHARS = 14000 // ~3.5k tokens; leaves room for system prompt + response

// Constant-time HMAC comparison to prevent timing attacks
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return result === 0
}

async function verifyGitHubSignature(
  body: string,
  signatureHeader: string,
  secret: string
): Promise<boolean> {
  const expected =
    "sha256=" + createHmac("sha256", secret).update(body).digest("hex")
  return timingSafeEqual(expected, signatureHeader)
}

async function fetchPRDiff(diffUrl: string, githubToken: string): Promise<string> {
  const res = await fetch(diffUrl, {
    headers: {
      Authorization: `token ${githubToken}`,
      Accept: "application/vnd.github.v3.diff",
      "User-Agent": "Rumi-Codex-Review-Bot",
    },
  })
  if (!res.ok) {
    throw new Error(`Failed to fetch PR diff: ${res.status} ${res.statusText}`)
  }
  return res.text()
}

async function reviewWithOpenAI(
  diff: string,
  prTitle: string,
  prBody: string,
  repoName: string
): Promise<string> {
  const truncatedDiff =
    diff.length > MAX_DIFF_CHARS
      ? diff.slice(0, MAX_DIFF_CHARS) +
        "\n\n[... diff truncated due to size — review partial changes above ...]"
      : diff

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-5.4",
      messages: [
        {
          role: "system",
          content: `You are a senior software engineer conducting a thorough PR code review for the ${repoName} repository.

Review the diff for:
- **Bugs & logic errors** — incorrect conditions, off-by-one errors, race conditions
- **Security vulnerabilities** — SQL injection, XSS, SSRF, hardcoded secrets, insecure auth
- **Performance issues** — N+1 queries, missing indexes, blocking operations, memory leaks
- **Error handling gaps** — unhandled exceptions, missing validation, silent failures
- **Breaking changes** — API contract changes, database migration risks, backward compatibility

Format your review using these severity levels:
🔴 **Critical** — must fix before merge (security, data loss, crashes)
🟡 **Warning** — should fix (bugs, performance, reliability)
🟢 **Suggestion** — optional improvements (readability, minor optimizations)

Be specific: cite file names and line context from the diff. Skip style/formatting nitpicks.
If the changes look solid with no issues, say so concisely.`,
        },
        {
          role: "user",
          content: `**PR: ${prTitle}**\n${prBody ? `**Description:** ${prBody}\n` : ""}\n\`\`\`diff\n${truncatedDiff}\n\`\`\``,
        },
      ],
      max_tokens: 1200,
      temperature: 0.1,
    }),
  })

  if (!res.ok) {
    const errText = await res.text().catch(() => "")
    throw new Error(`OpenAI API error: ${res.status} — ${errText}`)
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
        body: `## 🤖 Codex AI Review\n\n${reviewBody}\n\n---\n*Automated review by [OpenAI GPT-4o](https://openai.com) · [Configure](https://github.com/Rumi-team)*`,
        event: "COMMENT",
      }),
    }
  )

  if (!res.ok) {
    const errText = await res.text().catch(() => "")
    throw new Error(`Failed to post PR review: ${res.status} — ${errText}`)
  }
}

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.GITHUB_WEBHOOK_SECRET
  const githubToken = process.env.GITHUB_TOKEN
  const openaiKey = process.env.OPENAI_API_KEY

  if (!webhookSecret || !githubToken || !openaiKey) {
    console.error("Missing env vars: GITHUB_WEBHOOK_SECRET, GITHUB_TOKEN, or OPENAI_API_KEY")
    return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 })
  }

  // Read raw body for signature verification
  const body = await req.text()

  // Verify GitHub webhook HMAC-SHA256 signature
  const signatureHeader = req.headers.get("x-hub-signature-256") ?? ""
  if (!signatureHeader) {
    return NextResponse.json({ error: "Missing signature" }, { status: 401 })
  }
  if (!(await verifyGitHubSignature(body, signatureHeader, webhookSecret))) {
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 401 })
  }

  // Only process pull_request events
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
      diff_url: string
      draft: boolean
    }
    repository: {
      name: string
      full_name: string
      owner: { login: string }
    }
  }

  try {
    payload = JSON.parse(body)
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 })
  }

  const { action, pull_request: pr, repository } = payload

  // Only review on open/update — skip close, label, assign, etc.
  if (!["opened", "synchronize", "reopened"].includes(action)) {
    return NextResponse.json({ skipped: true, reason: `action=${action}` })
  }

  // Skip draft PRs
  if (pr.draft) {
    return NextResponse.json({ skipped: true, reason: "draft PR" })
  }

  const owner = repository.owner.login
  const repo = repository.name
  const repoFullName = repository.full_name

  console.log(`[codex-review] Reviewing PR #${pr.number} in ${repoFullName} (${action})`)

  try {
    const diff = await fetchPRDiff(pr.diff_url, githubToken)

    if (!diff.trim()) {
      return NextResponse.json({ skipped: true, reason: "empty diff" })
    }

    const review = await reviewWithOpenAI(diff, pr.title, pr.body ?? "", repoFullName)
    await postPRReview(owner, repo, pr.number, review, githubToken)

    console.log(`[codex-review] Posted review on PR #${pr.number} in ${repoFullName}`)
    return NextResponse.json({ success: true, pr: pr.number, repo: repoFullName })
  } catch (err) {
    console.error(`[codex-review] Error on PR #${pr.number} in ${repoFullName}:`, err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
