import type { BoxItem, OrderSettings } from './types'
import { massOf } from './geometry'
import { layerPhase } from './layers'
import { CAP_ORDERS, capPhase, sortForCap } from './cap'
import { byDeliveryThen, heaviness } from './sort'
import { cloneState, newState, type PalletState } from './state'

// Dernier client d'abord (en bas), non fragiles avant fragiles, lourds avant légers
export function sortItems(items: BoxItem[]): BoxItem[] {
  return [...items].sort(byDeliveryThen(heaviness))
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
 * Chapeau d'un arrêt sur l'état courant. Quatre ordres sont essayés, chacun sur une copie ;
 * on garde celui qui pose le plus de colis, puis le centre de gravité le plus bas.
 */
function bestCap(base: PalletState, rest: BoxItem[]): PalletState {
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

/**
 * Une palette, arrêt par arrêt du dernier livré au premier : couches pleines, puis chapeau.
 * Un colis n'est jamais posé sous un colis déjà en place : rien d'un arrêt livré plus tard
 * ne peut donc recouvrir un colis d'un arrêt livré plus tôt.
 */
export function buildPallet(items: BoxItem[], settings: OrderSettings): PalletState {
  const sorted = sortItems(items)
  let state = newState(settings)
  // Le tri range les arrêts par numéro décroissant
  for (const stop of new Set(sorted.map(i => i.stop))) {
    const group = sorted.filter(i => i.stop === stop)
    layerPhase(state, group)
    const placed = new Set(state.placements.map(p => p.uid))
    const rest = group.filter(i => !placed.has(i.uid))
    if (rest.length > 0) state = bestCap(state, rest)
  }
  return state
}
