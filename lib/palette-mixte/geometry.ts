import type { OrderSettings } from './types'
import { EPS, ESTIMATED_DENSITY } from './types'

export interface Rect2 {
  x: number
  y: number
  l: number
  w: number
}

export interface Box3 extends Rect2 {
  z: number
  h: number
}

export interface Orientation {
  l: number
  w: number
  h: number
}

export interface Zone {
  length: number // zone utile = palette + débord
  width: number
  offset: number // débord par côté
  usableHeight: number // hauteur disponible au-dessus du plancher
  palletLength: number
  palletWidth: number
}

// Orientations distinctes : à plat (deux sens au sol) ou toutes si le colis peut être couché
export function orientations(item: { length: number; width: number; height: number; upright: boolean }): Orientation[] {
  const { length: a, width: b, height: c } = item
  const all: Orientation[] = item.upright
    ? [{ l: a, w: b, h: c }, { l: b, w: a, h: c }]
    : [
        { l: a, w: b, h: c },
        { l: b, w: a, h: c },
        { l: a, w: c, h: b },
        { l: c, w: a, h: b },
        { l: b, w: c, h: a },
        { l: c, w: b, h: a },
      ]
  const seen = new Set<string>()
  return all.filter(o => {
    const key = `${o.l}x${o.w}x${o.h}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

export function zoneOf(settings: OrderSettings): Zone {
  const offset = Math.max(0, settings.overhang || 0)
  return {
    length: settings.pallet.length + 2 * offset,
    width: settings.pallet.width + 2 * offset,
    offset,
    usableHeight: settings.maxHeight - settings.pallet.height,
    palletLength: settings.pallet.length,
    palletWidth: settings.pallet.width,
  }
}

export function overlap1D(a0: number, a1: number, b0: number, b1: number): number {
  return Math.max(0, Math.min(a1, b1) - Math.max(a0, b0))
}

export function footprintOverlap(a: Rect2, b: Rect2): number {
  return overlap1D(a.x, a.x + a.l, b.x, b.x + b.l) * overlap1D(a.y, a.y + a.w, b.y, b.y + b.w)
}

export function boxesIntersect(a: Box3, b: Box3): boolean {
  return (
    a.x < b.x + b.l - EPS && b.x < a.x + a.l - EPS &&
    a.y < b.y + b.w - EPS && b.y < a.y + a.w - EPS &&
    a.z < b.z + b.h - EPS && b.z < a.z + a.h - EPS
  )
}

// Masse utilisée pour trier et équilibrer : poids saisi, sinon estimation par le volume
export function massOf(weight: number, volumeMm3: number): number {
  return weight > 0 ? weight : (volumeMm3 / 1e9) * ESTIMATED_DENSITY
}
