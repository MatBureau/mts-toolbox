import type { BoxItem, MixedResult, OrderSettings, PalletPlan, Reference, Rejected, RejectReason } from './types'
import { EPS, LIMITS } from './types'
import { massOf, orientations, zoneOf, type Zone } from './geometry'
import { buildPallet } from './pallet'
import { buildSteps } from './steps'
import type { PalletState } from './state'

// Fin de client regroupable si remplie à moins de la moitié du volume utile
const UNDERFILLED = 0.5

const quantityOf = (r: Reference) => Math.max(1, Math.floor(r.quantity || 1))

function rejectReason(ref: Reference, settings: OrderSettings, zone: Zone): RejectReason | null {
  if (![ref.length, ref.width, ref.height].every(v => Number.isFinite(v) && v >= 10)) return 'invalide'
  if (settings.maxLoad > 0 && (ref.weight ?? 0) > settings.maxLoad) return 'trop-lourd'
  const fits = orientations(ref).filter(o => (o.l <= zone.length && o.w <= zone.width) || (o.w <= zone.length && o.l <= zone.width))
  if (fits.length === 0) return 'trop-grand'
  if (!fits.some(o => o.h <= zone.usableHeight)) return 'trop-haut'
  return null
}

export function prepare(refs: Reference[], settings: OrderSettings): { items: BoxItem[]; rejected: Rejected[]; error: string | null } {
  const fail = (error: string) => ({ items: [], rejected: [], error })
  if (refs.length > LIMITS.maxReferences) return fail(`${LIMITS.maxReferences} références au maximum (${refs.length} saisies).`)
  const total = refs.reduce((sum, r) => sum + quantityOf(r), 0)
  if (total > LIMITS.maxBoxes) {
    return fail(`${LIMITS.maxBoxes.toLocaleString('fr-FR')} colis au maximum (${total.toLocaleString('fr-FR')} saisis).`)
  }
  if (!(settings.pallet.length >= 100 && settings.pallet.width >= 100)) return fail('Les dimensions de la palette doivent être d’au moins 100 mm.')
  if (!(settings.maxHeight > settings.pallet.height)) return fail('La hauteur maximale doit dépasser la hauteur de la palette.')

  const zone = zoneOf(settings)
  const items: BoxItem[] = []
  const rejected: Rejected[] = []
  for (const ref of refs) {
    const quantity = quantityOf(ref)
    const reason = rejectReason(ref, settings, zone)
    if (reason) {
      rejected.push({ refId: ref.id, count: quantity, reason })
      continue
    }
    for (let k = 1; k <= quantity; k++) {
      items.push({
        uid: `${ref.id}#${k}`,
        refId: ref.id,
        index: k,
        length: ref.length,
        width: ref.width,
        height: ref.height,
        weight: ref.weight && ref.weight > 0 ? ref.weight : 0,
        upright: ref.upright,
        fragile: ref.fragile,
        maxLoadOnTop: ref.maxLoadOnTop,
        keepTogether: ref.keepTogether,
        stop: Math.max(1, Math.floor(ref.stop || 1)),
      })
    }
  }
  return { items, rejected, error: null }
}

// Palettes successives d'un même client, avec la règle « garder ensemble »
function buildSeries(items: BoxItem[], settings: OrderSettings): { pallets: PalletState[]; leftover: BoxItem[] } {
  const pallets: PalletState[] = []
  const fitsAloneCache = new Map<string, boolean>()
  const fitsAlone = (refId: string, refItems: BoxItem[]) => {
    let fits = fitsAloneCache.get(refId)
    if (fits === undefined) {
      fits = buildPallet(refItems, settings).placements.length === refItems.length
      fitsAloneCache.set(refId, fits)
    }
    return fits
  }

  let remaining = items
  while (remaining.length > 0) {
    const excluded = new Set<string>()
    let state = buildPallet(remaining, settings)

    // Une référence « ensemble » coupée en deux, qui tiendrait entière sur une palette neuve, est reportée.
    // Une seule à la fois (la moins entamée, puis par identifiant) : reporter les autres libère de la place.
    for (;;) {
      const placed = new Set(state.placements.map(p => p.uid))
      let split: { refId: string; onPallet: number } | null = null
      for (const refId of new Set(remaining.filter(i => i.keepTogether).map(i => i.refId))) {
        if (excluded.has(refId)) continue
        const refItems = remaining.filter(i => i.refId === refId)
        const onPallet = refItems.filter(i => placed.has(i.uid)).length
        if (onPallet === 0 || onPallet === refItems.length || !fitsAlone(refId, refItems)) continue
        if (!split || onPallet < split.onPallet || (onPallet === split.onPallet && refId < split.refId)) split = { refId, onPallet }
      }
      if (!split) break
      excluded.add(split.refId)
      const candidates = remaining.filter(i => !excluded.has(i.refId))
      if (candidates.length === 0) break
      const next = buildPallet(candidates, settings)
      if (next.placements.length === 0) break
      state = next
    }

    if (state.placements.length === 0) break // ne doit pas arriver après prepare : garde-fou
    pallets.push(state)
    const placed = new Set(state.placements.map(p => p.uid))
    remaining = remaining.filter(i => !placed.has(i.uid))
  }
  return { pallets, leftover: remaining }
}

function volumeRatio(s: PalletState): number {
  const volume = s.placements.reduce((sum, p) => sum + p.l * p.w * p.h, 0)
  return volume / (s.zone.palletLength * s.zone.palletWidth * s.zone.usableHeight)
}

function finalize(s: PalletState, index: number, settings: OrderSettings, names: Map<string, string>): PalletPlan {
  const z = s.zone
  const top = s.placements.reduce((m, p) => Math.max(m, p.z + p.h), 0)
  let mass = 0
  let mx = 0
  let my = 0
  for (const p of s.placements) {
    const m = massOf(p.weight, p.l * p.w * p.h)
    mass += m
    mx += m * (p.x + p.l / 2)
    my += m * (p.y + p.w / 2)
  }
  const cx = z.offset + z.palletLength / 2
  const cy = z.offset + z.palletWidth / 2
  return {
    index,
    placements: s.placements,
    steps: buildSteps(s.placements, names, z),
    loadWeight: s.loadWeight,
    grossWeight: s.loadWeight + settings.pallet.tare,
    totalHeight: settings.pallet.height + top,
    volumeUsage: volumeRatio(s) * 100,
    stops: [...new Set(s.placements.map(p => p.stop))].sort((a, b) => a - b),
    cogWarning: mass > 0 && (Math.abs(mx / mass - cx) > 0.1 * z.palletLength || Math.abs(my / mass - cy) > 0.1 * z.palletWidth),
    topHasFragile: s.placements.some(p => p.fragile && Math.abs(p.z + p.h - top) <= EPS),
  }
}

export function palletizeOrder(refs: Reference[], settings: OrderSettings): MixedResult {
  const totalBoxes = refs.reduce((sum, r) => sum + quantityOf(r), 0)
  const prep = prepare(refs, settings)
  if (prep.error) {
    return { error: prep.error, pallets: [], rejected: [], totalBoxes, placedBoxes: 0, totalWeight: 0, missingWeight: false }
  }

  const itemByUid = new Map(prep.items.map(i => [i.uid, i]))
  const stops = [...new Set(prep.items.map(i => i.stop))].sort((a, b) => a - b)
  const full: PalletState[] = []
  const partial: PalletState[] = []
  const leftover: BoxItem[] = []

  for (const stop of stops) {
    const series = buildSeries(prep.items.filter(i => i.stop === stop), settings)
    leftover.push(...series.leftover)
    series.pallets.forEach((p, k) => {
      const isLast = k === series.pallets.length - 1
      if (isLast && stops.length > 1 && volumeRatio(p) < UNDERFILLED) partial.push(p)
      else full.push(p)
    })
  }

  // Fusion gloutonne des fins de client, dans l'ordre des arrêts (buildPallet met le dernier livré en bas)
  const merged: PalletState[] = []
  let current: PalletState | null = null
  for (const p of partial) {
    if (!current) {
      current = p
      continue
    }
    const union = [...current.placements, ...p.placements].map(pl => itemByUid.get(pl.uid)).filter((i): i is BoxItem => !!i)
    const trial = buildPallet(union, settings)
    if (trial.placements.length === union.length) {
      current = trial
    } else {
      merged.push(current)
      current = p
    }
  }
  if (current) merged.push(current)

  const minStop = (s: PalletState) => Math.min(...s.placements.map(p => p.stop))
  const states = [...full, ...merged].sort((a, b) => minStop(a) - minStop(b))
  const names = new Map(refs.map(r => [r.id, r.name]))
  const pallets = states.map((s, i) => finalize(s, i, settings, names))

  const leftoverByRef = new Map<string, number>()
  for (const i of leftover) leftoverByRef.set(i.refId, (leftoverByRef.get(i.refId) ?? 0) + 1)
  const rejected: Rejected[] = [
    ...prep.rejected,
    ...[...leftoverByRef].map(([refId, count]): Rejected => ({ refId, count, reason: 'trop-grand' })),
  ]

  return {
    error: null,
    pallets,
    rejected,
    totalBoxes,
    placedBoxes: pallets.reduce((sum, p) => sum + p.placements.length, 0),
    totalWeight: pallets.reduce((sum, p) => sum + p.grossWeight, 0),
    missingWeight: prep.items.some(i => i.weight === 0),
  }
}
