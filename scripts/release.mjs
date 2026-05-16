#!/usr/bin/env node
/* eslint-disable no-console */

/**
 * One-command release flow.
 *
 * Usage:
 *   npm run release           # patch bump (1.0.0 -> 1.0.1)
 *   npm run release:minor     # minor bump (1.0.0 -> 1.1.0)
 *   npm run release:major     # major bump (1.0.0 -> 2.0.0)
 *   node scripts/release.mjs 4.2.0   # explicit version
 *
 * What it does:
 *   1. Refuses if the working tree is dirty (forces clean baseline).
 *   2. Bumps `package.json` AND `src-tauri/tauri.conf.json` to the new version.
 *   3. Commits the bump on the current branch.
 *   4. Creates an annotated tag `v<version>`.
 *   5. Pushes both the commit and the tag.
 *
 * The actual build, signing and GitHub Release creation happens in CI — see
 * `.github/workflows/release.yml`. That workflow triggers on the `v*` tag we
 * push here.
 *
 * Why this lives as a script (not just npm version + manual tag): we need to
 * keep `tauri.conf.json` in sync with `package.json` (Tauri uses its own
 * `version` field for the installer's product version), and we want a single
 * command that does the whole flow.
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

const run = (cmd, opts = {}) => {
  console.log(`> ${cmd}`)
  return execSync(cmd, { stdio: 'pipe', cwd: repoRoot, ...opts }).toString().trim()
}

const runInherit = (cmd) => {
  console.log(`> ${cmd}`)
  execSync(cmd, { stdio: 'inherit', cwd: repoRoot })
}

const readJson = (path) => JSON.parse(readFileSync(path, 'utf8'))
const writeJson = (path, value) => writeFileSync(path, JSON.stringify(value, null, 2) + '\n')

const bumpKind = process.argv[2] ?? 'patch'

const parseSemver = (v) => {
  const m = /^(\d+)\.(\d+)\.(\d+)$/.exec(v)
  if (!m) throw new Error(`Invalid semver: ${v}`)
  return { major: +m[1], minor: +m[2], patch: +m[3] }
}

const bump = (current, kind) => {
  // Explicit version like "4.2.0" — just validate and use it.
  if (/^\d+\.\d+\.\d+$/.test(kind)) return kind
  const { major, minor, patch } = parseSemver(current)
  if (kind === 'major') return `${major + 1}.0.0`
  if (kind === 'minor') return `${major}.${minor + 1}.0`
  if (kind === 'patch') return `${major}.${minor}.${patch + 1}`
  throw new Error(`Unknown bump kind: ${kind}`)
}

// ----- 0. Safety: working tree must be clean. -----------------------------
const status = run('git status --porcelain')
if (status) {
  console.error('\nWorking tree is dirty. Commit or stash before releasing:\n')
  console.error(status)
  process.exit(1)
}

// ----- 1. Compute next version. -------------------------------------------
const pkg = readJson(PKG_PATH)
const tauri = readJson(TAURI_PATH)
const cargoSrc = readFileSync(CARGO_PATH, 'utf8')

const currentVersion = pkg.version
const nextVersion = bump(currentVersion, bumpKind)

if (tauri.version !== currentVersion) {
  console.warn(
    `Warning: tauri.conf.json (${tauri.version}) was out of sync with package.json (${currentVersion}). Both will be set to ${nextVersion}.`,
  )
}

console.log(`Releasing v${currentVersion} -> v${nextVersion}`)

// ----- 2. Write the bumped files. -----------------------------------------
pkg.version = nextVersion
tauri.version = nextVersion
writeJson(PKG_PATH, pkg)
writeJson(TAURI_PATH, tauri)

// Cargo.toml: replace only the first `version = "x.y.z"` line at the top of
// the `[package]` table. We avoid a full TOML parser here because nothing
// else in this script needs one and the format is regular.
const cargoUpdated = cargoSrc.replace(/^version = "\d+\.\d+\.\d+"$/m, `version = "${nextVersion}"`)
if (cargoUpdated === cargoSrc) {
  console.error('Failed to locate `version = "..."` line in src-tauri/Cargo.toml')
  process.exit(1)
}
writeFileSync(CARGO_PATH, cargoUpdated)

// ----- 3. Commit + tag + push. --------------------------------------------
runInherit('git add package.json src-tauri/tauri.conf.json src-tauri/Cargo.toml')
runInherit(`git commit -m "chore: release v${nextVersion}"`)
runInherit(`git tag -a v${nextVersion} -m "v${nextVersion}"`)
runInherit('git push')
runInherit(`git push origin v${nextVersion}`)

console.log(`\nDone. The release.yml workflow will now build, sign, and publish v${nextVersion}.`)
