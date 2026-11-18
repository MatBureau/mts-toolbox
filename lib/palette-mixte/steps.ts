import type { Placement, Step } from './types'
import { EPS } from './types'
import { footprintOverlap, type Rect2, type Zone } from './geometry'

// Position par tiers de la palette, vue de dessus : y faible = fond, x faible = gauche
export function positionLabel(p: Rect2, zone: Zone): string {
  const cx = p.x + p.l / 2 - zone.offset
  const cy = p.y + p.w / 2 - zone.offset
  const side = cx < zone.palletLength / 3 ? 'à gauche' : cx > (2 * zone.palletLength) / 3 ? 'à droite' : null
  const depth = cy < zone.palletWidth / 3 ? 'au fond' : cy > (2 * zone.palletWidth) / 3 ? 'devant' : null
  if (!side && !depth) return 'au centre'
  return [depth, side].filter(Boolean).join(', ')
}

/**
 * Ordre de montage : l'ordre de construction, arrêt par arrêt (couches de bas en haut,
 * puis chapeau trié par hauteur, fond, gauche). Un colis n'est donc jamais posé avant ce
 * qui le porte : une couche peut reposer sur le chapeau d'un arrêt livré plus tard.
 */
export function buildSteps(placements: Placement[], names: Map<string, string>, zone: Zone): Step[] {
  const name = (refId: string) => names.get(refId) ?? 'Colis'
  // Suites consécutives de colis en couches ou de chapeau, dans l'ordre des poses
  const runs: Placement[][] = []
  for (const p of placements) {
    const run = runs[runs.length - 1]
    if (run && (run[0].layer === null) === (p.layer === null)) run.push(p)
    else runs.push([p])
  }

  const steps: Step[] = []
  for (const run of runs) {
    if (run[0].layer !== null) {
      const layers = new Map<number, Placement[]>()
      for (const p of run) {
        const k = p.layer ?? 0 // toujours renseigné dans une suite de couches
        const layer = layers.get(k)
        if (layer) layer.push(p)
        else layers.set(k, [p])
      }
      for (const layer of [...layers.keys()].sort((a, b) => a - b)) {
        const ps = layers.get(layer) ?? []
        steps.push({
          kind: 'layer',
          number: steps.length + 1,
          layer,
          refId: ps[0].refId,
          uids: ps.map(p => p.uid),
          label: `Couche ${layer + 1} : ${ps.length} × ${name(ps[0].refId)}`,
        })
      }
      continue
    }

    const cap = [...run].sort((a, b) => a.z - b.z || a.y - b.y || a.x - b.x)
    for (const p of cap) {
      const supports =
        p.z <= EPS
          ? 'la palette'
          : [...new Set(placements.filter(q => Math.abs(q.z + q.h - p.z) <= EPS && footprintOverlap(q, p) > 0).map(q => name(q.refId)))].join(' et ')
      steps.push({
        kind: 'box',
        number: steps.length + 1,
        uid: p.uid,
        refId: p.refId,
        label: `${name(p.refId)} n° ${p.index} — posé sur ${supports}, ${positionLabel(p, zone)}`,
      })
    }
  }
  return steps
}
