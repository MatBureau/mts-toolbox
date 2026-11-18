export interface PastedRow {
  name: string
  length: string
  width: string
  height: string
  quantity: string
  weight: string
}

export interface PasteResult {
  rows: PastedRow[]
  lines: number[] // ligne source (à partir de 1) de chaque entrée de rows
  header: number | null // ligne prise pour un en-tête, s'il y en a une
  errors: { line: number; message: string }[]
}

const numeric = (cell: string | undefined): string | null => {
  if (cell === undefined) return null
  const t = cell.replace(/\s/g, '').replace(',', '.')
  return /^\d+(\.\d+)?$/.test(t) ? t : null
}

/**
 * Lignes « nom ; L ; l ; H ; quantité ; poids » (nom facultatif). Séparateur : tabulation,
 * sinon point-virgule, sinon virgule (les décimales doivent alors utiliser le point).
 * Une première ligne illisible est prise pour un en-tête et ignorée.
 */
export function parsePastedReferences(text: string): PasteResult {
  const rows: PastedRow[] = []
  const lines: number[] = []
  const errors: PasteResult['errors'] = []
  let header: number | null = null
  let first = true

  text.split(/\r?\n/).forEach((raw, i) => {
    const line = raw.trim()
    if (!line) return
    const sep = line.includes('\t') ? '\t' : line.includes(';') ? ';' : ','
    const cells = line.split(sep).map(c => c.trim())
    const hasName = numeric(cells[0]) === null
    const values = hasName ? cells.slice(1) : cells
    const nums = values.map(numeric)
    const readable = values.length >= 3 && nums.slice(0, 3).every(v => v !== null)

    if (!readable) {
      if (first) header = i + 1
      else errors.push({ line: i + 1, message: 'trois dimensions numériques attendues (L, l, H en mm)' })
      first = false
      return
    }
    first = false
    lines.push(i + 1)
    rows.push({
      name: hasName ? cells[0].replace(/[\u0000-\u001F\u007F-\u009F]/g, ' ').trim().slice(0, 40) : '',
      length: nums[0] as string,
      width: nums[1] as string,
      height: nums[2] as string,
      quantity: nums[3] ?? '1',
      weight: nums[4] ?? '',
    })
  })
  return { rows, lines, header, errors }
}

/**
 * Texte à laisser dans la zone de collage après un import partiel : l'en-tête éventuel, les lignes
 * en erreur et les lignes lues mais non importées (au-delà de `imported`). Rien de ce qui a été
 * importé n'y reste : un second clic ne peut pas créer de doublon. Les erreurs sont renumérotées.
 */
export function leftoverPaste(text: string, res: PasteResult, imported: number): { text: string; errors: PasteResult['errors'] } {
  const source = text.split(/\r?\n/)
  const errorAt = new Map(res.errors.map(e => [e.line, e.message]))
  const keep = [...res.errors.map(e => e.line), ...res.lines.slice(imported)].sort((a, b) => a - b)
  if (keep.length === 0) return { text: '', errors: [] }
  const kept = res.header !== null ? [res.header, ...keep] : keep
  const errors: PasteResult['errors'] = []
  kept.forEach((line, k) => {
    const message = errorAt.get(line)
    if (message) errors.push({ line: k + 1, message })
  })
  return { text: kept.map(line => source[line - 1]).join('\n'), errors }
}
