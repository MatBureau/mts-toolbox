import { CUSTOM_PALLET_ID, PALLET_PRESETS } from '@/lib/palette/presets'
import { defaultOrder, newRefId, type OrderForm } from './form'
import { LIMITS } from './types'

type Flag = 0 | 1
type PackedRef = [string, string, string, string, string, string, Flag, Flag, string, Flag, string]
interface Packed {
  v: 1
  p: [string, string, string, string, string, string, string, string, Flag]
  r: PackedRef[]
}

const flag = (b: boolean): Flag => (b ? 1 : 0)

// Format compact : des tableaux plutôt que des objets, pour un lien court
export function packOrder(f: OrderForm): Packed {
  return {
    v: 1,
    p: [f.palletId, f.palletLength, f.palletWidth, f.palletHeight, f.palletTare, f.maxHeight, f.maxLoad, f.overhang, flag(f.stackable)],
    r: f.refs.map(r => [r.name, r.length, r.width, r.height, r.quantity, r.weight, flag(r.upright), flag(r.fragile), r.maxLoadOnTop, flag(r.keepTogether), r.stop]),
  }
}

const NUM = /^\d{0,6}([.,]\d{0,3})?$/
const num = (v: unknown): string => (typeof v === 'string' && NUM.test(v) ? v : '')

// Un lien vient de n'importe où : chaque valeur est revérifiée
export function unpackOrder(data: unknown): OrderForm | null {
  if (!data || typeof data !== 'object') return null
  const d = data as { v?: unknown; p?: unknown; r?: unknown }
  if (d.v !== 1 || !Array.isArray(d.p) || !Array.isArray(d.r)) return null
  const p = d.p as unknown[]
  const base = defaultOrder()
  const id = typeof p[0] === 'string' && (p[0] === CUSTOM_PALLET_ID || PALLET_PRESETS.some(x => x.id === p[0])) ? p[0] : base.palletId
  const order: OrderForm = {
    palletId: id,
    palletLength: num(p[1]) || base.palletLength,
    palletWidth: num(p[2]) || base.palletWidth,
    palletHeight: num(p[3]) || base.palletHeight,
    palletTare: num(p[4]) || base.palletTare,
    maxHeight: num(p[5]) || base.maxHeight,
    maxLoad: num(p[6]),
    overhang: num(p[7]),
    stackable: p[8] === 1,
    refs: [],
  }
  const preset = PALLET_PRESETS.find(x => x.id === id)
  if (preset) {
    order.palletLength = String(preset.length)
    order.palletWidth = String(preset.width)
    order.palletHeight = String(preset.height)
    order.palletTare = String(preset.tare)
  }
  order.refs = (d.r as unknown[])
    .filter((r): r is unknown[] => Array.isArray(r))
    .slice(0, LIMITS.maxReferences)
    .map((r, i) => ({
      id: newRefId(),
      name: typeof r[0] === 'string' ? r[0].slice(0, 40) : `Colis ${i + 1}`,
      length: num(r[1]),
      width: num(r[2]),
      height: num(r[3]),
      quantity: num(r[4]) || '1',
      weight: num(r[5]),
      upright: r[6] !== 0,
      fragile: r[7] === 1,
      maxLoadOnTop: num(r[8]),
      keepTogether: r[9] === 1,
      stop: num(r[10]) || '1',
    }))
  return order
}

function toBase64Url(bytes: Uint8Array): string {
  let bin = ''
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i])
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fromBase64Url(s: string): Uint8Array<ArrayBuffer> {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4)
  return Uint8Array.from(atob(b64), c => c.charCodeAt(0))
}

/** « z… » : JSON compressé (deflate-raw) ; « j… » : JSON brut si la compression manque. */
export async function encodeOrder(f: OrderForm): Promise<string> {
  const json = new TextEncoder().encode(JSON.stringify(packOrder(f)))
  if (typeof CompressionStream !== 'undefined') {
    try {
      const stream = new Blob([json]).stream().pipeThrough(new CompressionStream('deflate-raw'))
      return 'z' + toBase64Url(new Uint8Array(await new Response(stream).arrayBuffer()))
    } catch {
      // repli sans compression
    }
  }
  return 'j' + toBase64Url(json)
}

export async function decodeOrder(code: string): Promise<OrderForm | null> {
  try {
    let bytes = fromBase64Url(code.slice(1))
    if (code[0] === 'z') {
      const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate-raw'))
      bytes = new Uint8Array(await new Response(stream).arrayBuffer())
    } else if (code[0] !== 'j') {
      return null
    }
    return unpackOrder(JSON.parse(new TextDecoder().decode(bytes)))
  } catch {
    return null
  }
}
