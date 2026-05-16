/**
 * One-shot converter: <div class="scroll-area" v-overlayscrollbars ...>...</div>
 * → <OverlayScrollbar ...>...</OverlayScrollbar>
 *
 * Tracks div nesting to pair each opener with the right closer (regex alone
 * can't do this once any divs are nested inside the scroll-area).
 *
 * Usage:  node scripts/convert-scroll-area.mjs <files...>
 */
import { readFileSync, writeFileSync } from 'node:fs'

const args = process.argv.slice(2)
if (args.length === 0) {
  console.error('No files provided.')
  process.exit(1)
}

const TOKEN_RE = /<div\b[^>]*>|<\/div>/g

const transformOpener = (raw) => {
  // raw is the full <div ...> token.
  let inner = raw.slice(4, -1).trim()
  inner = inner.replace(/\s*class="scroll-area"/, ' ').trim()
  inner = inner.replace(/\s*v-overlayscrollbars(?:="[^"]*")?/, ' ').trim()
  // Collapse any double spaces left over.
  inner = inner.replace(/\s+/g, ' ').trim()
  return inner ? `<OverlayScrollbar ${inner}>` : '<OverlayScrollbar>'
}

const transformFile = (path) => {
  const original = readFileSync(path, 'utf8')

  const tokens = []
  let match
  while ((match = TOKEN_RE.exec(original)) !== null) {
    tokens.push({ start: match.index, end: match.index + match[0].length, text: match[0] })
  }

  const replacements = []
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i]
    if (!t.text.startsWith('<div')) continue
    if (!t.text.includes('class="scroll-area"')) continue
    if (!t.text.includes('v-overlayscrollbars')) continue

    replacements.push({ start: t.start, end: t.end, text: transformOpener(t.text) })

    let depth = 1
    for (let j = i + 1; j < tokens.length; j++) {
      depth += tokens[j].text.startsWith('<div') ? 1 : -1
      if (depth === 0) {
        replacements.push({ start: tokens[j].start, end: tokens[j].end, text: '</OverlayScrollbar>' })
        break
      }
    }
  }

  if (replacements.length === 0) return false

  replacements.sort((a, b) => b.start - a.start)
  let text = original
  for (const r of replacements) {
    text = text.slice(0, r.start) + r.text + text.slice(r.end)
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
