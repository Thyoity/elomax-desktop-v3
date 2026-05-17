#!/usr/bin/env node
/**
 * Copies the installed `ionicons` package's distribution into `public/ionicons/`
 * so it's served as a static asset by Vite (both dev and build). The web
 * component's loader script + lazy chunks + SVG folder all need to live next
 * to each other under the same URL path — putting them in `public/` is the
 * Vite-canonical way to do that for assets we don't want hashed or processed.
 *
 * Wired as `postinstall` in package.json so anyone running `npm install` (or
 * the CI's `npm ci`) lands with the assets ready, without having to commit
 * the synced files to the repo.
 */
import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const src = resolve(root, 'node_modules', 'ionicons', 'dist', 'ionicons')
const dest = resolve(root, 'public', 'ionicons')

if (!existsSync(src)) {
  // npm has hooks ordering quirks (postinstall can run before nested deps are
  // resolved). Exit silently — the next `npm install` settles it.
  console.warn('[sync-ionicons] ionicons not installed yet; skipping.')
  process.exit(0)
}

rmSync(dest, { recursive: true, force: true })
mkdirSync(dest, { recursive: true })
cpSync(src, dest, { recursive: true })
console.log(`[sync-ionicons] Synced ${src} -> ${dest}`)
