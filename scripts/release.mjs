#!/usr/bin/env node
/* eslint-disable no-console */

/**
 * One-command release flow with auto-retry on failed builds.
 *
 * Usage:
 *   npm run release           # patch bump (1.0.0 -> 1.0.1)
 *   npm run release:minor     # minor bump (1.0.0 -> 1.1.0)
 *   npm run release:major     # major bump (1.0.0 -> 2.0.0)
 *   node scripts/release.mjs 4.2.0   # explicit version
 *
 * Smart retry: before bumping, the script asks the GitHub `gh` CLI about
 * the last `release.yml` workflow run.
 *   - last run is queued / in_progress  ->  abort (don't pile up runs)
 *   - last run failed AND its tag matches the current package.json version
 *     ->  RETRY the same tag (delete + repush so CI rebuilds against HEAD)
 *   - last run succeeded, or no runs yet, or gh CLI missing
 *     ->  normal bump + tag + push flow
 *
 * Why: an aborted release leaves a tag (e.g. `v0.0.1`) pointing at a broken
 * commit. Without retry, the user has to manually delete the tag or burn
 * version numbers (v0.0.2, v0.0.3, ...) on each retry. With retry, the same
 * tag gets re-tested against the latest fix until it builds.
 *
 * The actual build, signing and GitHub Release creation happens in CI — see
 * `.github/workflows/release.yml`.
 */

import { execSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(__dirname, '..')

const PKG_PATH = resolve(repoRoot, 'package.json')
const TAURI_PATH = resolve(repoRoot, 'src-tauri', 'tauri.conf.json')
const CARGO_PATH = resolve(repoRoot, 'src-tauri', 'Cargo.toml')

const run = (cmd, opts = {}) =>
  execSync(cmd, { stdio: 'pipe', cwd: repoRoot, ...opts }).toString().trim()

const runInherit = (cmd) => {
  console.log(`> ${cmd}`)
  execSync(cmd, { stdio: 'inherit', cwd: repoRoot })
}

const tryRun = (cmd) => {
  try {
    return run(cmd)
  } catch {
    return null
  }
}

const readJson = (path) => JSON.parse(readFileSync(path, 'utf8'))
const writeJson = (path, value) => writeFileSync(path, JSON.stringify(value, null, 2) + '\n')

const bumpKind = process.argv[2] ?? 'patch'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const parseSemver = (v) => {
  const m = /^(\d+)\.(\d+)\.(\d+)$/.exec(v)
  if (!m) throw new Error(`Invalid semver: ${v}`)
  return { major: +m[1], minor: +m[2], patch: +m[3] }
}

const bump = (current, kind) => {
  if (/^\d+\.\d+\.\d+$/.test(kind)) return kind
  const { major, minor, patch } = parseSemver(current)
  if (kind === 'major') return `${major + 1}.0.0`
  if (kind === 'minor') return `${major}.${minor + 1}.0`
  if (kind === 'patch') return `${major}.${minor}.${patch + 1}`
  throw new Error(`Unknown bump kind: ${kind}`)
}

const hasGh = () => tryRun('gh --version') !== null

/**
 * Asks `gh` about the latest run of `release.yml`. Returns one of:
 *   { kind: 'in_progress', tag }
 *   { kind: 'failed', tag }
 *   { kind: 'succeeded', tag }
 *   { kind: 'none' }            no previous runs
 *   { kind: 'unknown', reason } gh missing / not authed / parse error
 */
const lastReleaseRun = () => {
  if (!hasGh()) return { kind: 'unknown', reason: 'gh-not-installed' }
  const json = tryRun(
    'gh run list --workflow=release.yml --limit=1 --json status,conclusion,headBranch',
  )
  if (json == null) return { kind: 'unknown', reason: 'gh-call-failed' }
  let arr
  try {
    arr = JSON.parse(json)
  } catch {
    return { kind: 'unknown', reason: 'parse-failed' }
  }
  if (arr.length === 0) return { kind: 'none' }
  const r = arr[0]
  const tag = r.headBranch
  if (r.status === 'queued' || r.status === 'in_progress') return { kind: 'in_progress', tag }
  if (r.status === 'completed' && r.conclusion === 'success') return { kind: 'succeeded', tag }
  return { kind: 'failed', tag }
}

const writeAllVersions = (version) => {
  const pkg = readJson(PKG_PATH)
  const tauri = readJson(TAURI_PATH)
  pkg.version = version
  tauri.version = version
  writeJson(PKG_PATH, pkg)
  writeJson(TAURI_PATH, tauri)

  // Cargo.toml: replace only the first `version = "x.y.z"` line at the top
  // of the `[package]` table. No full TOML parser to keep the script slim.
  const cargoSrc = readFileSync(CARGO_PATH, 'utf8')
  const cargoUpdated = cargoSrc.replace(/^version = "\d+\.\d+\.\d+"$/m, `version = "${version}"`)
  if (cargoUpdated === cargoSrc) {
    console.error('Failed to locate `version = "..."` line in src-tauri/Cargo.toml')
    process.exit(1)
  }
  writeFileSync(CARGO_PATH, cargoUpdated)
}

// ---------------------------------------------------------------------------
// 0. Safety: working tree must be clean.
// ---------------------------------------------------------------------------
const status = run('git status --porcelain')
if (status) {
  console.error('\nWorking tree is dirty. Commit or stash before releasing:\n')
  console.error(status)
  process.exit(1)
}

// ---------------------------------------------------------------------------
// 1. Decide: retry the last failed tag, or bump to a new one?
// ---------------------------------------------------------------------------
const pkg = readJson(PKG_PATH)
const currentVersion = pkg.version

const previous = lastReleaseRun()
let mode = 'bump'
let nextVersion = bump(currentVersion, bumpKind)

if (previous.kind === 'in_progress') {
  console.error(
    `\nThe release workflow for ${previous.tag} is still running. ` +
      `Wait for it to finish (see https://github.com/<owner>/<repo>/actions) before triggering another release.`,
  )
  process.exit(1)
}

if (previous.kind === 'failed') {
  const expectedTag = `v${currentVersion}`
  if (previous.tag === expectedTag) {
    mode = 'retry'
    nextVersion = currentVersion
    console.log(
      `Last release ${previous.tag} failed. Retrying the same tag against HEAD ` +
        `(no version bump, no extra commit).`,
    )
  } else {
    console.warn(
      `Last release (${previous.tag}) failed but package.json is at ${currentVersion}, ` +
        `which doesn't match. Falling back to a normal bump — fix the version drift manually if needed.`,
    )
  }
}

if (previous.kind === 'unknown') {
  console.warn(`gh status check skipped (${previous.reason}). Proceeding with a normal bump.`)
}

// ---------------------------------------------------------------------------
// 2. Bump path: edit files + commit.
// ---------------------------------------------------------------------------
if (mode === 'bump') {
  console.log(`Releasing v${currentVersion} -> v${nextVersion}`)
  writeAllVersions(nextVersion)
  runInherit('git add package.json src-tauri/tauri.conf.json src-tauri/Cargo.toml')
  runInherit(`git commit -m "chore: release v${nextVersion}"`)
}

// ---------------------------------------------------------------------------
// 3. Tag + push.
// ---------------------------------------------------------------------------
const tagName = `v${nextVersion}`

if (mode === 'retry') {
  // Delete the failed tag locally + remotely so the new push re-triggers CI
  // against HEAD (which has the build fixes). tauri-action will update the
  // existing GitHub Release in place — no manual cleanup needed.
  console.log(`Deleting old tag ${tagName} (local + remote) to retrigger CI...`)
  tryRun(`git tag -d ${tagName}`)
  tryRun(`git push origin :refs/tags/${tagName}`)
}

runInherit(`git tag -a ${tagName} -m "${tagName}"`)
if (mode === 'bump') runInherit('git push')
runInherit(`git push origin ${tagName}`)

console.log(
  `\nDone. ${tagName} pushed. The release.yml workflow will build, sign, and publish.`,
)
