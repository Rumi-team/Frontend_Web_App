/**
 * POST /api/github/codex-review
 *
 * GitHub organization webhook receiver for automatic PR code review + auto-fix.
 * Model: gpt-5.4 — review + auto-fix critical issues
 *
 * Flow:
 *   1. Validate HMAC-SHA256 signature → return 200 immediately
 *   2. (background via after()) Fetch diff → GPT-5.4 review → post PR comment
 *   3. (background) Fetch changed files → GPT-5.4 fix generation → commit fixes to PR branch
 *   4. Post fix summary comment
 *
 * Required env vars:
 *   GITHUB_WEBHOOK_SECRET  — secret configured in the GitHub org webhook
 *   GITHUB_TOKEN           — PAT with repo scope
 *   OPENAI_API_KEY         — OpenAI API key
 */

import { createHmac } from "crypto"
import { after } from "next/server"
import { NextRequest, NextResponse } from "next/server"

const REVIEW_MODEL = "gpt-5.4"
const MAX_DIFF_CHARS = 14000
const MAX_FILE_CHARS = 20000 // max chars per file sent to fix model
const MAX_FILES_TO_FIX = 8   // limit number of files fetched for auto-fix

// ─── Signature verification ───────────────────────────────────────────────────

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

// ─── GitHub API helpers ───────────────────────────────────────────────────────

async function ghFetch(path: string, githubToken: string, opts: RequestInit = {}) {
  const res = await fetch(`https://api.github.com${path}`, {
    ...opts,
    headers: {
      Authorization: `token ${githubToken}`,
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "Rumi-Codex-Review-Bot",
      "Content-Type": "application/json",
      ...(opts.headers ?? {}),
    },
  })
  if (!res.ok) {
    const err = await res.text().catch(() => "")
    throw new Error(`GitHub API ${path} → ${res.status}: ${err}`)
  }
  return res
}

async function fetchPRDiff(diffUrl: string, githubToken: string): Promise<string> {
  const res = await fetch(diffUrl, {
    headers: {
      Authorization: `token ${githubToken}`,
      Accept: "application/vnd.github.v3.diff",
      "User-Agent": "Rumi-Codex-Review-Bot",
    },
  })
  if (!res.ok) throw new Error(`Diff fetch failed: ${res.status}`)
  return res.text()
}

interface PRFile {
  filename: string
  status: string // added, modified, removed, renamed
  patch?: string
}

async function fetchPRFiles(
  owner: string,
  repo: string,
  pullNumber: number,
  githubToken: string
): Promise<PRFile[]> {
  const res = await ghFetch(
    `/repos/${owner}/${repo}/pulls/${pullNumber}/files?per_page=100`,
    githubToken
  )
  return res.json()
}

interface FileContent {
  path: string
  content: string
  sha: string
}

async function fetchFileContent(
  owner: string,
  repo: string,
  path: string,
  ref: string,
  githubToken: string
): Promise<FileContent | null> {
  try {
    const res = await ghFetch(
      `/repos/${owner}/${repo}/contents/${path}?ref=${ref}`,
      githubToken
    )
    const data = await res.json()
    const content = Buffer.from(data.content, "base64").toString("utf-8")
    return { path, content, sha: data.sha }
  } catch {
    return null
  }
}

async function updateFileOnBranch(
  owner: string,
  repo: string,
  path: string,
  content: string,
  sha: string,
  message: string,
  branch: string,
  githubToken: string
): Promise<void> {
  await ghFetch(`/repos/${owner}/${repo}/contents/${path}`, githubToken, {
    method: "PUT",
    body: JSON.stringify({
      message,
      content: Buffer.from(content).toString("base64"),
      sha,
      branch,
    }),
  })
}

async function postPRComment(
  owner: string,
  repo: string,
  pullNumber: number,
  body: string,
  githubToken: string
): Promise<void> {
  await ghFetch(`/repos/${owner}/${repo}/pulls/${pullNumber}/reviews`, githubToken, {
    method: "POST",
    body: JSON.stringify({ body, event: "COMMENT" }),
  })
}

// ─── OpenAI helpers ───────────────────────────────────────────────────────────

async function callOpenAI(
  messages: Array<{ role: string; content: string }>,
  opts: { json?: boolean; maxTokens?: number } = {}
): Promise<string> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: REVIEW_MODEL,
      messages,
      max_tokens: opts.maxTokens ?? 1200,
      temperature: 0.1,
      ...(opts.json ? { response_format: { type: "json_object" } } : {}),
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

// ─── Review step ─────────────────────────────────────────────────────────────

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

  return callOpenAI(
    [
      {
        role: "system",
        content: `You are a senior software engineer reviewing a PR in the ${repoName} repository.

Review the diff for:
- **Bugs & logic errors** — incorrect conditions, race conditions, off-by-one errors
- **Security vulnerabilities** — injection, XSS, SSRF, hardcoded secrets, insecure auth
- **Performance issues** — N+1 queries, blocking ops, memory leaks
- **Error handling gaps** — unhandled exceptions, missing validation, silent failures

Format using severity levels:
🔴 **Critical** — must fix before merge
🟡 **Warning** — should fix
🟢 **Suggestion** — optional improvement

Be specific: cite filenames and line context. Skip style nitpicks.
If the code looks clean, say so briefly.`,
      },
      {
        role: "user",
        content: `**PR: ${prTitle}**\n${prBody ? `**Description:** ${prBody}\n` : ""}\n\`\`\`diff\n${truncated}\n\`\`\``,
      },
    ],
    { maxTokens: 1200 }
  )
}

// ─── Auto-fix step ───────────────────────────────────────────────────────────

interface Fix {
  path: string
  content: string
  description: string
}

interface FixResult {
  fixes: Fix[]
  summary: string
}

async function generateFixes(
  review: string,
  files: FileContent[]
): Promise<FixResult> {
  if (files.length === 0) return { fixes: [], summary: "No files to fix" }

  const fileBlocks = files
    .map((f) => {
      const truncated =
        f.content.length > MAX_FILE_CHARS
          ? f.content.slice(0, MAX_FILE_CHARS) + "\n// [file truncated]"
          : f.content
      return `### ${f.path}\n\`\`\`\n${truncated}\n\`\`\``
    })
    .join("\n\n")

  const raw = await callOpenAI(
    [
      {
        role: "system",
        content: `You are an expert software engineer. An AI reviewer flagged 🔴 Critical issues in a PR.
Your job: fix ONLY the 🔴 Critical issues by making minimal, precise code changes.

Return a JSON object with this exact shape:
{
  "fixes": [
    {
      "path": "relative/path/to/file.ts",
      "content": "<complete modified file content>",
      "description": "one-line description of what was fixed"
    }
  ],
  "summary": "one-line summary of all fixes"
}

Rules:
- Only address 🔴 Critical issues
- Return the COMPLETE file content (not a diff) — we will replace the file entirely
- If a file has no critical issues, omit it from fixes
- If you cannot safely fix an issue, omit it
- Return { "fixes": [], "summary": "No safe auto-fixes available" } if nothing can be fixed safely`,
      },
      {
        role: "user",
        content: `## Review\n${review}\n\n## Changed Files\n${fileBlocks}`,
      },
    ],
    { json: true, maxTokens: 4000 }
  )

  try {
    return JSON.parse(raw) as FixResult
  } catch {
    return { fixes: [], summary: "Fix generation parse error" }
  }
}

// ─── Main processing pipeline ─────────────────────────────────────────────────

async function processReviewAndFix(params: {
  owner: string
  repo: string
  repoFullName: string
  pullNumber: number
  prTitle: string
  prBody: string
  diffUrl: string
  headRef: string
  githubToken: string
}) {
  const { owner, repo, repoFullName, pullNumber, prTitle, prBody, diffUrl, headRef, githubToken } =
    params

  // 1. Fetch diff
  const diff = await fetchPRDiff(diffUrl, githubToken)
  if (!diff.trim()) {
    console.log(`[codex-review] PR #${pullNumber} has empty diff — skipping`)
    return
  }

  // 2. Generate review
  const review = await generateReview(diff, prTitle, prBody, repoFullName)

  // 3. Post review comment
  await postPRComment(
    owner,
    repo,
    pullNumber,
    `## 🤖 Codex AI Review\n\n${review}\n\n---\n*Reviewed by ${REVIEW_MODEL} · Applying auto-fixes for critical issues…*`,
    githubToken
  )
  console.log(`[codex-review] Posted review on PR #${pullNumber}`)

  // 4. Skip auto-fix if no critical issues
  if (!review.includes("🔴")) {
    console.log(`[codex-review] No critical issues — skipping auto-fix`)
    return
  }

  // 5. Fetch changed files (skip removed files, limit count)
  const prFiles = await fetchPRFiles(owner, repo, pullNumber, githubToken)
  const fixableFiles = prFiles
    .filter((f) => f.status !== "removed")
    .filter((f) => /\.(ts|tsx|js|jsx|py|go|rs|java|rb|php|swift|kt)$/.test(f.filename))
    .slice(0, MAX_FILES_TO_FIX)

  const fileContents = (
    await Promise.all(
      fixableFiles.map((f) =>
        fetchFileContent(owner, repo, f.filename, headRef, githubToken)
      )
    )
  ).filter((f): f is FileContent => f !== null)

  // 6. Generate fixes
  const fixResult = await generateFixes(review, fileContents)
  if (fixResult.fixes.length === 0) {
    // Update the review comment to remove "Applying auto-fixes…"
    await postPRComment(
      owner,
      repo,
      pullNumber,
      `## 🔧 Auto-fix Result\n\nNo safe auto-fixes were applicable for the critical issues. Please review and fix manually.`,
      githubToken
    )
    return
  }

  // 7. Apply fixes — commit each changed file back to the PR branch
  const applied: string[] = []
  for (const fix of fixResult.fixes) {
    const existing = fileContents.find((f) => f.path === fix.path)
    if (!existing) continue
    // Skip if content unchanged
    if (existing.content === fix.content) continue
    try {
      await updateFileOnBranch(
        owner,
        repo,
        fix.path,
        fix.content,
        existing.sha,
        `fix(codex): ${fix.description}`,
        headRef,
        githubToken
      )
      applied.push(`- \`${fix.path}\`: ${fix.description}`)
      console.log(`[codex-review] Applied fix to ${fix.path}`)
    } catch (err) {
      console.error(`[codex-review] Failed to apply fix to ${fix.path}:`, err)
    }
  }

  // 8. Post fix summary
  if (applied.length > 0) {
    await postPRComment(
      owner,
      repo,
      pullNumber,
      `## 🔧 Auto-fix Applied\n\n${fixResult.summary}\n\n**Changes committed to \`${headRef}\`:**\n${applied.join("\n")}\n\n---\n*Auto-fixed by ${REVIEW_MODEL} · Please review the commits above*`,
      githubToken
    )
    console.log(`[codex-review] Applied ${applied.length} fix(es) to PR #${pullNumber}`)
  } else {
    await postPRComment(
      owner,
      repo,
      pullNumber,
      `## 🔧 Auto-fix Result\n\nFixes were generated but could not be applied cleanly. Please address the 🔴 Critical issues manually.`,
      githubToken
    )
  }
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.GITHUB_WEBHOOK_SECRET
  const githubToken = process.env.GITHUB_TOKEN
  const openaiKey = process.env.OPENAI_API_KEY

  if (!webhookSecret || !githubToken || !openaiKey) {
    return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 })
  }

  const body = await req.text()

  const signatureHeader = req.headers.get("x-hub-signature-256") ?? ""
  if (!signatureHeader || !verifySignature(body, signatureHeader, webhookSecret)) {
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
      diff_url: string
      draft: boolean
      head: { ref: string; sha: string }
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

  const params = {
    owner: repository.owner.login,
    repo: repository.name,
    repoFullName: repository.full_name,
    pullNumber: pr.number,
    prTitle: pr.title,
    prBody: pr.body ?? "",
    diffUrl: pr.diff_url,
    headRef: pr.head.ref,
    githubToken,
  }

  // Return 200 immediately — GitHub doesn't need to wait for the review
  after(async () => {
    try {
      await processReviewAndFix(params)
    } catch (err) {
      console.error(`[codex-review] Pipeline failed for PR #${pr.number}:`, err)
    }
  })

  return NextResponse.json({ accepted: true, pr: pr.number, repo: repository.full_name })
}
