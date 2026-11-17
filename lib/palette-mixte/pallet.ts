import type { BoxItem, OrderSettings } from './types'
import { massOf } from './geometry'
import { layerPhase } from './layers'
import { CAP_ORDERS, capPhase, heaviness, sortForCap } from './cap'
import { cloneState, newState, type PalletState } from './state'

// Dernier client d'abord (en bas), non fragiles avant fragiles, lourds avant légers
export function sortItems(items: BoxItem[]): BoxItem[] {
  return [...items].sort(
    (a, b) =>
      b.stop - a.stop ||
      Number(a.fragile) - Number(b.fragile) ||
      heaviness(b) - heaviness(a) ||
      (a.refId < b.refId ? -1 : a.refId > b.refId ? 1 : 0) ||
      a.index - b.index
  )
}

function centerOfMassZ(s: PalletState): number {
  let mass = 0
  let moment = 0
  for (const p of s.placements) {
    const m = massOf(p.weight, p.l * p.w * p.h)
    mass += m
    moment += m * (p.z + p.h / 2)
  }
  return mass > 0 ? moment / mass : 0
}

/**
 * Une palette : couches pleines, puis chapeau. Quatre ordres de chapeau sont essayés ;
 * on garde celui qui pose le plus de colis, puis le centre de gravité le plus bas.
 */
export function buildPallet(items: BoxItem[], settings: OrderSettings): PalletState {
  const base = newState(settings)
  const sorted = sortItems(items)
  layerPhase(base, sorted)

  const placed = new Set(base.placements.map(p => p.uid))
  const rest = sorted.filter(i => !placed.has(i.uid))
  if (rest.length === 0) return base

  let best: PalletState | null = null
  const tried = new Set<string>()
  for (const order of CAP_ORDERS) {
    // Deux critères qui donnent la même suite de colis donnent le même chapeau
    const sequence = JSON.stringify(sortForCap(rest, order).map(i => i.uid))
    if (tried.has(sequence)) continue
    tried.add(sequence)
    const trial = cloneState(base)
    capPhase(trial, rest, order)
    if (
      !best ||
      trial.placements.length > best.placements.length ||
      (trial.placements.length === best.placements.length && centerOfMassZ(trial) < centerOfMassZ(best))
    ) {
      best = trial
    }
  }
  return best ?? base
}
