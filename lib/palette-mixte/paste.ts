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
  const errors: PasteResult['errors'] = []
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
      if (!first) errors.push({ line: i + 1, message: 'trois dimensions numériques attendues (L, l, H en mm)' })
      first = false
      return
    }
    first = false
    rows.push({
      name: hasName ? cells[0].slice(0, 40) : '',
      length: nums[0] as string,
      width: nums[1] as string,
      height: nums[2] as string,
      quantity: nums[3] ?? '1',
      weight: nums[4] ?? '',
    })
  })
  return { rows, errors }
}
