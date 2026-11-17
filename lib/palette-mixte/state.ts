import type { BoxItem, OrderSettings, Placement } from './types'
import { EPS, SUPPORT_RATIO } from './types'
import { boxesIntersect, footprintOverlap, zoneOf, type Box3, type Zone } from './geometry'

export interface PalletState {
  zone: Zone
  maxLoad: number
  placements: Placement[]
  loadWeight: number
}

export function newState(settings: OrderSettings): PalletState {
  return { zone: zoneOf(settings), maxLoad: Math.max(0, settings.maxLoad || 0), placements: [], loadWeight: 0 }
}

export function cloneState(s: PalletState): PalletState {
  return { zone: s.zone, maxLoad: s.maxLoad, placements: s.placements.map(p => ({ ...p })), loadWeight: s.loadWeight }
}

export function topOf(s: PalletState): number {
  return s.placements.reduce((m, p) => Math.max(m, p.z + p.h), 0)
}

/**
 * Contrôle un placement. Renvoie les colis situés dessous (qui porteront son poids),
 * ou null si une règle est violée : zone, hauteur, charge de palette, chevauchement,
 * pose sous un colis existant, fragile dessous, charge supportée, appui < 75 %.
 */
export function checkPlacement(state: PalletState, item: BoxItem, c: Box3): Placement[] | null {
  const { zone } = state
  if (c.x < -EPS || c.y < -EPS || c.x + c.l > zone.length + EPS || c.y + c.w > zone.width + EPS) return null
  if (c.z < -EPS || c.z + c.h > zone.usableHeight + EPS) return null
  // Un poids inconnu compte pour 0 : il n'entre pas dans les contrôles de charge (choix de la spec).
  if (state.maxLoad > 0 &&state.loadWeight + item.weight > state.maxLoad + 1e-9) return null

  let support = 0
  const below: Placement[] = []
  for (const p of state.placements) {
    const overlap = footprintOverlap(p, c)
    if (overlap <= 0) continue
    if (boxesIntersect(p, c)) return null
    // Même emprise sans chevauchement : p est entièrement au-dessus ou au-dessous
    if (p.z >= c.z + c.h - EPS) return null
    if (p.z + p.h > c.z + EPS) continue // voisin latéral (recouvrement sous la tolérance) : ni dessus ni dessous
    if (p.fragile) return null
    if (p.maxLoadOnTop !== null && p.loadAbove + item.weight > p.maxLoadOnTop + 1e-9) return null
    below.push(p)
    if (Math.abs(p.z + p.h - c.z) <= EPS) support += overlap
  }
  if (c.z <= EPS) {
    // Sur le plancher : seule la palette porte, pas le débord
    support = footprintOverlap({ x: zone.offset, y: zone.offset, l: zone.palletLength, w: zone.palletWidth }, c)
  }
  if (support < SUPPORT_RATIO * c.l * c.w - 1e-6) return null
  return below
}

// Les colis de `below` doivent provenir de ce même état (pas d'une copie) : leur charge supportée est mise à jour ici.
export function commit(state: PalletState, item: BoxItem, c: Box3, below: Placement[], layer: number | null): Placement {
  for (const p of below) p.loadAbove += item.weight
  const placement: Placement = {
    uid: item.uid,
    refId: item.refId,
    index: item.index,
    x: c.x,
    y: c.y,
    z: c.z,
    l: c.l,
    w: c.w,
    h: c.h,
    weight: item.weight,
    fragile: item.fragile,
    maxLoadOnTop: item.maxLoadOnTop,
    loadAbove: 0,
    stop: item.stop,
    layer,
  }
  state.placements.push(placement)
  state.loadWeight += item.weight
  return placement
}
