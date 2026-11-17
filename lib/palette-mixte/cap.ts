import type { BoxItem, Placement } from './types'
import { EPS, SUPPORT_RATIO } from './types'
import { footprintOverlap, orientations, type Box3 } from './geometry'
import { Grid } from './grid'
import { byDeliveryThen, KEYS } from './sort'
import { checkPlacement, commit, type PalletState } from './state'

export { heaviness } from './sort'

export type CapOrder = keyof typeof KEYS
export const CAP_ORDERS: CapOrder[] = ['volume', 'base', 'height', 'weight']

// Dernier client d'abord (en bas), fragiles en dernier, puis le critère, puis un ordre stable
export function sortForCap(items: BoxItem[], order: CapOrder): BoxItem[] {
  return [...items].sort(byDeliveryThen(KEYS[order]))
}

interface Point {
  x: number
  y: number
  z: number
  born: number // numéro de création, pour savoir si un colis précédent l'a déjà essayé
}

type Corner = Omit<Point, 'born'>

const cmp = (a: Corner, b: Corner) => a.z - b.z || a.y - b.y || a.x - b.x
// Clé arrondie au demi-millimètre : deux points quasi confondus n'en font qu'un
const keyOf = (p: Corner) => `${Math.round(p.x * 2)}|${Math.round(p.y * 2)}|${Math.round(p.z * 2)}`

function inside(p: Corner, b: Box3): boolean {
  return (
    p.x >= b.x - EPS && p.x < b.x + b.l - EPS &&
    p.y >= b.y - EPS && p.y < b.y + b.w - EPS &&
    p.z >= b.z - EPS && p.z < b.z + b.h - EPS
  )
}

function pointsOf(p: Box3): Corner[] {
  return [
    { x: p.x + p.l, y: p.y, z: p.z },
    { x: p.x, y: p.y + p.w, z: p.z },
    { x: p.x, y: p.y, z: p.z + p.h },
  ]
}

// Appui maximal possible à la cote du candidat, d'après les seuls dessus de colis voisins.
// Majore l'appui retenu par checkPlacement : un refus ici est toujours un refus là-bas.
function mayBeSupported(c: Box3, near: readonly Placement[]): boolean {
  let support = 0
  for (const p of near) if (Math.abs(p.z + p.h - c.z) <= EPS) support += footprintOverlap(p, c)
  return support >= SUPPORT_RATIO * c.l * c.w - 1e-6
}

/**
 * Points candidats (méthode des points extrêmes), triés par cote, puis y, puis x.
 * Un nouveau point est projeté vers le bas sur le plus haut dessus de colis (ou le plancher)
 * situé sous lui : aucun point ne flotte dans le vide.
 */
class Points {
  list: Point[] = []
  private keys = new Set<string>()
  private count = 0

  constructor(private state: PalletState, private grid: Grid<Placement>) {}

  get clock(): number {
    return this.count
  }

  private drop(p: Corner): Corner {
    if (p.z <= EPS) return p
    let floor = 0
    for (const b of this.grid.query({ x: p.x - EPS, y: p.y - EPS, l: 2 * EPS, w: 2 * EPS })) {
      const top = b.z + b.h
      if (top > p.z + EPS || top <= floor) continue
      if (p.x >= b.x - EPS && p.x < b.x + b.l - EPS && p.y >= b.y - EPS && p.y < b.y + b.w - EPS) floor = top
    }
    return floor < p.z - EPS ? { x: p.x, y: p.y, z: floor } : p
  }

  add(fresh: Corner[]): void {
    const { zone } = this.state
    for (const raw of fresh) {
      if (raw.x >= zone.length - EPS || raw.y >= zone.width - EPS || raw.z >= zone.usableHeight - EPS) continue
      const p = this.drop(raw)
      const key = keyOf(p)
      if (this.keys.has(key)) continue
      if (this.grid.query({ x: p.x - EPS, y: p.y - EPS, l: 2 * EPS, w: 2 * EPS }).some(b => inside(p, b))) continue
      this.keys.add(key)
      const point = { ...p, born: ++this.count }
      // Insertion à sa place dans la liste triée
      let lo = 0
      let hi = this.list.length
      while (lo < hi) {
        const mid = (lo + hi) >> 1
        if (cmp(this.list[mid], point) <= 0) lo = mid + 1
        else hi = mid
      }
      this.list.splice(lo, 0, point)
    }
  }

  // Retire les points recouverts par un colis qui vient d'être posé
  cover(b: Box3): void {
    this.list = this.list.filter(p => {
      if (!inside(p, b)) return true
      this.keys.delete(keyOf(p))
      return false
    })
  }
}

const NEVER: Corner = { x: Infinity, y: Infinity, z: Infinity }

/**
 * Pose les colis un à un au point candidat le plus bas, puis le plus au fond, puis le plus
 * à gauche, dans l'ordre de tri demandé.
 * Quand un colis ne trouve aucune place, le reste de sa référence est abandonné pour cette
 * palette. C'est exact : dans l'ordre de `sortForCap`, les colis d'une référence sont
 * consécutifs (clés identiques), donc aucune pose n'a lieu entre deux d'entre eux, et le
 * colis suivant, identique, retrouverait exactement le même état et le même refus.
 */
export function capPhase(state: PalletState, items: BoxItem[], order: CapOrder): void {
  const grid = new Grid<Placement>(state.zone.length, state.zone.width)
  for (const p of state.placements) grid.add(p)
  const pts = new Points(state, grid)
  // Le coin de la zone et celui de la palette (distincts avec un débord)
  const { offset } = state.zone
  pts.add([{ x: 0, y: 0, z: 0 }, { x: offset, y: offset, z: 0 }, ...state.placements.flatMap(pointsOf)])
  const failed = new Set<string>()

  // Mémoire des échecs du colis précédent de la même référence (mêmes dimensions, même poids).
  // Pour chaque orientation, les points créés avant `clock` et situés avant `frontier` ont été
  // refusés. Un refus reste un refus : l'état ne fait que se remplir, et un colis posé ensuite
  // ne crée d'appui qu'à la cote de son dessus (voir la mise à jour après chaque pose).
  let memo: { refId: string; clock: number; frontier: Corner[] } | null = null

  for (const item of sortForCap(items, order)) {
    if (failed.has(item.refId)) continue
    if (state.maxLoad > 0 && state.loadWeight + item.weight > state.maxLoad + 1e-9) {
      failed.add(item.refId)
      continue
    }

    const known = memo && memo.refId === item.refId ? memo : null
    const clock = pts.clock
    const frontier: Corner[] = []
    let best: { pt: Point; c: Box3; below: Placement[] } | null = null
    orientations(item).forEach((o, k) => {
      const skipBefore = known ? known.frontier[k] : null
      let stop: Corner = NEVER
      for (const pt of pts.list) {
        if (best && cmp(pt, best.pt) >= 0) {
          stop = pt
          break
        }
        if (pt.z + o.h > state.zone.usableHeight + EPS) {
          stop = pt
          break
        }
        if (skipBefore && pt.born <= known!.clock && cmp(pt, skipBefore) < 0) continue
        const c = { x: pt.x, y: pt.y, z: pt.z, l: o.l, w: o.w, h: o.h }
        const near = grid.query(c)
        if (c.z > EPS && !mayBeSupported(c, near)) continue
        const below = checkPlacement(state, item, c, near)
        if (below) {
          best = { pt, c, below }
          stop = pt
          break
        }
      }
      frontier.push(stop)
    })

    if (!best) {
      failed.add(item.refId)
      continue
    }
    const { c, below } = best as { pt: Point; c: Box3; below: Placement[] }
    const placed = commit(state, item, c, below, null)
    grid.add(placed)
    pts.cover(placed)
    pts.add(pointsOf(placed))
    // Le nouveau dessus peut porter les points de sa cote et au-delà : ils seront réessayés
    const top: Corner = { x: -Infinity, y: -Infinity, z: placed.z + placed.h - EPS }
    memo = { refId: item.refId, clock, frontier: frontier.map(f => (cmp(f, top) < 0 ? f : top)) }
  }
}
