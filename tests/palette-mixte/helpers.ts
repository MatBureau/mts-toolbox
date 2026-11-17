import type { MixedResult, OrderSettings, PalletPlan, Reference } from '@/lib/palette-mixte/types'
import { EPS, SUPPORT_RATIO } from '@/lib/palette-mixte/types'
import { boxesIntersect, footprintOverlap, zoneOf } from '@/lib/palette-mixte/geometry'

// Générateur pseudo-aléatoire à graine fixe (mulberry32)
export function mulberry32(seed: number): () => number {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function randomOrder(seed: number): { refs: Reference[]; settings: OrderSettings } {
  const rnd = mulberry32(seed)
  const pick = (a: number, b: number, step = 10) => a + Math.floor(rnd() * ((b - a) / step + 1)) * step
  const n = 1 + Math.floor(rnd() * 8)
  const refs: Reference[] = Array.from({ length: n }, (_, i) => ({
    id: `r${i}`,
    name: `Colis ${i + 1}`,
    length: pick(150, 700),
    width: pick(150, 600),
    height: pick(100, 500),
    quantity: 1 + Math.floor(rnd() * 30),
    weight: rnd() < 0.2 ? null : pick(1, 25, 1),
    upright: rnd() < 0.8,
    fragile: rnd() < 0.15,
    maxLoadOnTop: rnd() < 0.2 ? pick(20, 150) : null,
    keepTogether: rnd() < 0.2,
    stop: 1 + Math.floor(rnd() * 3),
  }))
  const settings: OrderSettings = {
    pallet: { length: 1200, width: 800, height: 144, tare: 25 },
    maxHeight: 1800,
    maxLoad: rnd() < 0.5 ? 1000 : 0,
    overhang: rnd() < 0.3 ? 20 : 0,
  }
  return { refs, settings }
}

// Recalcule toutes les règles depuis les placements finaux, sans réutiliser le code du moteur
export function palletViolations(plan: PalletPlan, settings: OrderSettings): string[] {
  const zone = zoneOf(settings)
  const ps = plan.placements
  const errors: string[] = []
  const deck = { x: zone.offset, y: zone.offset, l: zone.palletLength, w: zone.palletWidth }

  ps.forEach((p, i) => {
    if (p.x < -EPS || p.y < -EPS || p.x + p.l > zone.length + EPS || p.y + p.w > zone.width + EPS) errors.push(`${p.uid} hors zone`)
    if (p.z + p.h > zone.usableHeight + EPS) errors.push(`${p.uid} trop haut`)
    for (let j = i + 1; j < ps.length; j++) if (boxesIntersect(p, ps[j])) errors.push(`${p.uid} chevauche ${ps[j].uid}`)

    if (p.z <= EPS) {
      // Plancher : le centre de la base doit être au-dessus de la palette (le débord autorisé est accepté)
      const cx = p.x + p.l / 2
      const cy = p.y + p.w / 2
      if (cx < deck.x - EPS || cx > deck.x + deck.l + EPS || cy < deck.y - EPS || cy > deck.y + deck.w + EPS) errors.push(`${p.uid} centre hors palette`)
    } else {
      const support = ps.filter(q => Math.abs(q.z + q.h - p.z) <= EPS).reduce((sum, q) => sum + footprintOverlap(q, p), 0)
      if (support < SUPPORT_RATIO * p.l * p.w - 1e-6) errors.push(`${p.uid} appui ${Math.round((support / (p.l * p.w)) * 100)} %`)
    }

    const above = ps.filter(q => q !== p && q.z >= p.z + p.h - EPS && footprintOverlap(q, p) > 0)
    if (p.fragile && above.length > 0) errors.push(`${p.uid} fragile recouvert`)
    if (p.maxLoadOnTop !== null) {
      const load = above.reduce((sum, q) => sum + q.weight, 0)
      if (load > p.maxLoadOnTop + 1e-6) errors.push(`${p.uid} écrasé (${load} kg)`)
    }
  })

  if (settings.maxLoad > 0 && plan.loadWeight > settings.maxLoad + 1e-6) errors.push('charge maximale dépassée')

  const stepOf = new Map<string, number>()
  for (const s of plan.steps) for (const uid of s.kind === 'layer' ? s.uids : [s.uid]) stepOf.set(uid, s.number)
  if (stepOf.size !== ps.length) errors.push('étapes incomplètes')
  for (const p of ps) {
    if (p.z <= EPS) continue
    for (const q of ps) {
      if (Math.abs(q.z + q.h - p.z) <= EPS && footprintOverlap(q, p) > 0 && (stepOf.get(q.uid) ?? 0) >= (stepOf.get(p.uid) ?? 0)) {
        errors.push(`${p.uid} posé avant son support ${q.uid}`)
      }
    }
  }
  return errors
}

export const rejectedCount = (r: MixedResult) => r.rejected.reduce((sum, x) => sum + x.count, 0)
