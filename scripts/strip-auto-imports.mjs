/**
 * Removes manual imports + `components: { ... }` registrations for components
 * that are now auto-imported by `unplugin-vue-components`. The plugin scans
 * templates and resolves these by filename (or via the legacy-name resolver
 * configured in vite.config.ts).
 *
 * Programmatic imports (used in JS code, not as template tags) are preserved.
 *
 * Usage:  node scripts/strip-auto-imports.mjs <files...>
 */
import { readFileSync, writeFileSync } from 'node:fs'

const args = process.argv.slice(2)
if (args.length === 0) {
  console.error('No files provided.')
  process.exit(1)
}

// Import paths whose default export becomes auto-imported.
const AUTO_PATHS = [
  /^@\/components\/Loading$/,
  /^@\/components\/MiniLoading$/,
  /^@\/components\/Login$/,
  /^@\/components\/Modals$/,
  /^@\/components\/Updates$/,
  /^@\/components\/AppMenuTrigger(\.vue)?$/,
  /^@\/components\/AppMenuDrawer(\.vue)?$/,
  /^@\/components\/ExtraIcon(\.vue)?$/,
  /^@\/components\/GameIcon(\.vue)?$/,
  /^@\/components\/GameButton(\.vue)?$/,
  /^@\/components\/ServicesRealtimeHelper\/[A-Za-z]+$/,
  /\/AcceptServiceButton$/,
  /^\.\/Subpanel(\.vue)?$/,
  /^\.\/components\/(Updates|Login|Modals|Loading|MiniLoading|AppMenuTrigger|AppMenuDrawer)(\.vue)?$/,
]

const transformFile = (path) => {
  let text = readFileSync(path, 'utf8')
  const scriptStart = text.indexOf('<script')
  if (scriptStart < 0) return false
  const scriptOpenEnd = text.indexOf('>', scriptStart) + 1
  const scriptEnd = text.indexOf('</script>', scriptOpenEnd)
  if (scriptEnd < 0) return false

  const before = text.slice(0, scriptOpenEnd)
  let script = text.slice(scriptOpenEnd, scriptEnd)
  const after = text.slice(scriptEnd)

  const removedIdents = new Set()

  // Drop import lines whose path matches one of the auto patterns.
  script = script.replace(
    /^\s*import\s+(\w+)\s+from\s+['"]([^'"]+)['"];?\s*\n/gm,
    (match, ident, source) => {
      if (AUTO_PATHS.some((re) => re.test(source))) {
        removedIdents.add(ident)
        return ''
      }
      return match
    },
  )

  // Drop entries from `components: { ... }` that reference the removed idents.
  // Handles three forms:
  //   "key": Ident,
  //   key: Ident,
  //   Ident,      (ES6 shorthand)
  for (const ident of removedIdents) {
    const keyValRe = new RegExp(
      `\\s*(?:["'][\\w-]+["']|[A-Za-z_$][\\w$]*)\\s*:\\s*${ident}\\s*,?`,
      'g',
    )
    const shorthandRe = new RegExp(`\\s*${ident}\\s*,?(?=\\s*[,}\\n])`, 'g')
    script = script.replace(keyValRe, '').replace(shorthandRe, '')
  }

  // Tidy up: collapse any now-orphan empty/trailing-comma `components: {}` blocks.
  script = script.replace(/components:\s*\{\s*,?\s*\}\s*,?\s*\n/g, '')

  if (removedIdents.size === 0) return false

  writeFileSync(path, before + script + after)
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
console.log(`Cleaned ${changed}/${args.length} file(s).`)
