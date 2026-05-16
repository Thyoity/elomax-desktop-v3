/**
 * Converts Webpack-style `require('@/assets/...')` calls (left over from the
 * legacy code) to Vite-friendly helper calls defined in `src/config/assets.ts`.
 *
 *   require('@/assets/badges/simple/iron.png')         -> badgeUrl('iron')
 *   require('@/assets/badges/iron.png')                -> fullBadgeUrl('iron')
 *   require('./assets/sounds/foo.mp3')                 -> soundUrl('foo')
 *   require('@/assets/sounds/foo.mp3')                 -> soundUrl('foo')
 *   require('@/assets/imgs/foo.png')                   -> imageUrl('foo')
 *
 * Also injects the necessary imports into each modified .vue file.
 *
 * Usage:  node scripts/convert-require.mjs <files...>
 */
import { readFileSync, writeFileSync } from 'node:fs'

const args = process.argv.slice(2)
if (args.length === 0) {
  console.error('No files provided.')
  process.exit(1)
}

// Patterns are matched in order; first match wins. `PATH_PREFIX` matches both
// the alias-based form (`@/assets/...`) and any relative form (`./assets/...`,
// `../assets/...`, `../../../assets/...`, etc.).
const PATH_PREFIX = `(?:@\\/|\\.{1,}\\/(?:\\.\\.\\/)*)assets`

const PATTERNS = [
  // simple/ badges (more specific — must come before the generic /badges/ rule)
  {
    re: new RegExp(
      `require\\(\\s*['"]${PATH_PREFIX}\\/badges\\/simple\\/([\\w-]+)\\.png['"]\\s*\\)`,
      'g',
    ),
    helper: 'badgeUrl',
    replace: (_match, name) => `badgeUrl('${name}')`,
  },
  // full-art badges (parent folder)
  {
    re: new RegExp(
      `require\\(\\s*['"]${PATH_PREFIX}\\/badges\\/([\\w-]+)\\.png['"]\\s*\\)`,
      'g',
    ),
    helper: 'fullBadgeUrl',
    replace: (_match, name) => `fullBadgeUrl('${name}')`,
  },
  // sounds
  {
    re: new RegExp(
      `require\\(\\s*['"]${PATH_PREFIX}\\/sounds\\/([\\w-]+)\\.mp3['"]\\s*\\)`,
      'g',
    ),
    helper: 'soundUrl',
    replace: (_match, name) => `soundUrl('${name}')`,
  },
  // generic images under /imgs/
  {
    re: new RegExp(
      `require\\(\\s*['"]${PATH_PREFIX}\\/imgs\\/([\\w-]+)\\.png['"]\\s*\\)`,
      'g',
    ),
    helper: 'imageUrl',
    replace: (_match, name) => `imageUrl('${name}')`,
  },
  // Valorant ranked badges
  {
    re: new RegExp(
      `require\\(\\s*['"]${PATH_PREFIX}\\/valorant-badges\\/([\\w-]+)\\.png['"]\\s*\\)`,
      'g',
    ),
    helper: 'valorantBadgeUrl',
    replace: (_match, name) => `valorantBadgeUrl('${name}')`,
  },
]

const transformFile = (path) => {
  const original = readFileSync(path, 'utf8')
  let text = original
  const usedHelpers = new Set()

  for (const { re, helper, replace } of PATTERNS) {
    text = text.replace(re, (...captures) => {
      usedHelpers.add(helper)
      return replace(...captures)
    })
  }

  if (usedHelpers.size === 0) return false

  // Inject the import (or extend an existing import from @/config/assets).
  const helpersList = [...usedHelpers].sort().join(', ')
  const existingImportRe = /import \{([^}]+)\} from ['"]@\/config\/assets['"]/
  if (existingImportRe.test(text)) {
    text = text.replace(existingImportRe, (_m, current) => {
      const names = new Set(
        current
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
      )
      for (const h of usedHelpers) names.add(h)
      return `import { ${[...names].sort().join(', ')} } from '@/config/assets'`
    })
  } else if (path.endsWith('.vue')) {
    // Inject right after the first `<script>` opening tag.
    text = text.replace(
      /<script([^>]*)>/,
      `<script$1>\nimport { ${helpersList} } from '@/config/assets'`,
    )
  } else {
    // Plain .ts / .js: prepend to the top of the file.
    text = `import { ${helpersList} } from '@/config/assets'\n${text}`
  }

  writeFileSync(path, text)
  return true
}

let changed = 0
for (const file of args) {
  try {
    if (transformFile(file)) changed += 1
  } catch (err) {
    console.error(`Failed: ${file} — ${err.message}`)
  }
}
console.log(`Converted ${changed}/${args.length} file(s).`)
