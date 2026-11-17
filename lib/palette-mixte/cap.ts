import type { BoxItem, Placement } from './types'
import { EPS } from './types'
import { massOf, orientations, type Box3 } from './geometry'
import { checkPlacement, commit, type PalletState } from './state'

export type CapOrder = 'volume' | 'base' | 'height' | 'weight'
export const CAP_ORDERS: CapOrder[] = ['volume', 'base', 'height', 'weight']

const volume = (i: BoxItem) => i.length * i.width * i.height

export function heaviness(i: BoxItem): number {
  return massOf(i.weight, volume(i))
}

const KEY: Record<CapOrder, (i: BoxItem) => number> = {
  volume,
  base: i => i.length * i.width,
  height: i => i.height,
  weight: heaviness,
}

// Dernier client d'abord (en bas), fragiles en dernier, puis le critère, puis un ordre stable
export function sortForCap(items: BoxItem[], order: CapOrder): BoxItem[] {
  const key = KEY[order]
  return [...items].sort(
    (a, b) =>
      b.stop - a.stop ||
      Number(a.fragile) - Number(b.fragile) ||
      key(b) - key(a) ||
      (a.refId < b.refId ? -1 : a.refId > b.refId ? 1 : 0) ||
      a.index - b.index
  )
}

interface Point {
  x: number
  y: number
  z: number
}

const cmp = (a: Point, b: Point) => a.z - b.z || a.y - b.y || a.x - b.x
const keyOf = (p: Point) => `${p.x}|${p.y}|${p.z}`

function inside(p: Point, b: Box3): boolean {
  return (
    p.x >= b.x - EPS && p.x < b.x + b.l - EPS &&
    p.y >= b.y - EPS && p.y < b.y + b.w - EPS &&
    p.z >= b.z - EPS && p.z < b.z + b.h - EPS
  )
}

function pointsOf(p: Box3): Point[] {
  return [
    { x: p.x + p.l, y: p.y, z: p.z },
    { x: p.x, y: p.y + p.w, z: p.z },
    { x: p.x, y: p.y, z: p.z + p.h },
  ]
}

// Ajoute des points candidats : hors zone et déjà occupés écartés, sans doublon, triés
function addPoints(pts: Point[], fresh: Point[], state: PalletState): Point[] {
  const { zone } = state
  const keys = new Set(pts.map(keyOf))
  const out = [...pts]
  for (const p of fresh) {
    if (p.x >= zone.length - EPS || p.y >= zone.width - EPS || p.z >= zone.usableHeight - EPS) continue
    const key = keyOf(p)
    if (keys.has(key) || state.placements.some(b => inside(p, b))) continue
    keys.add(key)
    out.push(p)
  }
  return out.sort(cmp)
}

/**
 * Pose les colis un à un au point candidat le plus bas, puis le plus au fond, puis le plus
 * à gauche, dans l'ordre de tri demandé. Une référence qui ne passe plus est abandonnée
 * pour cette palette : l'état ne fait que se remplir, ses colis suivants échoueraient aussi.
 */
export function capPhase(state: PalletState, items: BoxItem[], order: CapOrder): void {
  // Le coin de la zone et celui de la palette (distincts avec un débord)
  const { offset } = state.zone
  const start = [{ x: 0, y: 0, z: 0 }, { x: offset, y: offset, z: 0 }]
  let pts = addPoints([], [...start, ...state.placements.flatMap(pointsOf)], state)
  const failed = new Set<string>()

  for (const item of sortForCap(items, order)) {
    if (failed.has(item.refId)) continue
    if (state.maxLoad > 0 && state.loadWeight + item.weight > state.maxLoad + 1e-9) {
      failed.add(item.refId)
      continue
    }

    let best: { pt: Point; c: Box3; below: Placement[] } | null = null
    for (const o of orientations(item)) {
      for (const pt of pts) {
        if (best && cmp(pt, best.pt) >= 0) break
        if (pt.z + o.h > state.zone.usableHeight + EPS) break
        const c = { x: pt.x, y: pt.y, z: pt.z, l: o.l, w: o.w, h: o.h }
        const below = checkPlacement(state, item, c)
        if (below) {
          best = { pt, c, below }
          break
        }
      }
    }

    if (!best) {
      failed.add(item.refId)
      continue
    }
    const placed = commit(state, item, best.c, best.below, null)
    pts = addPoints(pts.filter(p => !inside(p, placed)), pointsOf(placed), state)
  }
}
