import type { BoxItem } from './types'
import { massOf } from './geometry'

const volume = (i: BoxItem) => i.length * i.width * i.height

// Masse utilisée pour trier : poids saisi, sinon estimation par le volume
export function heaviness(i: BoxItem): number {
  return massOf(i.weight, volume(i))
}

/**
 * Comparateur commun : dernier client d'abord (en bas), fragiles en dernier, puis `key`
 * décroissant, puis la référence et le numéro de colis (ordre stable). Les colis d'une même
 * référence ont la même clé : ils sortent donc consécutifs.
 */
export function byDeliveryThen(key: (i: BoxItem) => number): (a: BoxItem, b: BoxItem) => number {
  return (a, b) =>
    b.stop - a.stop ||
    Number(a.fragile) - Number(b.fragile) ||
    key(b) - key(a) ||
    (a.refId < b.refId ? -1 : a.refId > b.refId ? 1 : 0) ||
    a.index - b.index
}

export const KEYS = {
  volume,
  base: (i: BoxItem) => i.length * i.width,
  height: (i: BoxItem) => i.height,
  weight: heaviness,
}
