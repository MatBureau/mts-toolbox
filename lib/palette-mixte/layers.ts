import { bestLayer, centerLayer, type LayerPattern } from '@/lib/palette/packing'
import type { BoxItem } from './types'
import { orientations } from './geometry'
import { checkPlacement, cloneState, commit, topOf, type PalletState } from './state'

// Les mêmes dimensions reviennent d'une palette à l'autre : on garde les plans calculés (mémoire bornée)
const patternCache = new Map<string, LayerPattern>()
const PATTERN_CACHE_MAX = 500

function layerPattern(L: number, W: number, l: number, w: number): LayerPattern {
  const key = `${L}x${W}:${l}x${w}`
  let pattern = patternCache.get(key)
  if (!pattern) {
    pattern = centerLayer(bestLayer(L, W, l, w), L, W)
    if (patternCache.size >= PATTERN_CACHE_MAX) patternCache.clear()
    patternCache.set(key, pattern)
  }
  return pattern
}

/**
 * Pose des couches pleines et homogènes, référence par référence, dans l'ordre reçu
 * (déjà trié : dernier client, non fragiles, lourds d'abord). Une couche n'est posée
 * que si tous ses colis respectent les contraintes. Les fragiles sont laissés au chapeau.
 */
export function layerPhase(state: PalletState, items: BoxItem[]): void {
  const groups = new Map<string, BoxItem[]>()
  for (const item of items) {
    if (item.fragile) continue
    const group = groups.get(item.refId)
    if (group) group.push(item)
    else groups.set(item.refId, [item])
  }

  const { zone } = state
  let layerIndex = state.placements.reduce((m, p) => (p.layer === null ? m : Math.max(m, p.layer + 1)), 0)
  for (const group of groups.values()) {
    // Orientations classées : le plus de colis en couches pleines (hauteur et charge de palette), puis la plus basse
    const available = zone.usableHeight - topOf(state)
    const weight = group[0].weight
    const byWeight = state.maxLoad > 0 && weight > 0 ? Math.floor((state.maxLoad - state.loadWeight) / weight + 1e-9) : Infinity
    const candidates: { pattern: LayerPattern; h: number; score: number }[] = []
    const seen = new Set<string>()
    for (const o of orientations(group[0])) {
      const key = `${Math.min(o.l, o.w)}x${Math.max(o.l, o.w)}x${o.h}`
      if (seen.has(key)) continue
      seen.add(key)
      const pattern = layerPattern(zone.length, zone.width, o.l, o.w)
      if (pattern.count === 0) continue
      const layers = Math.min(Math.floor(Math.min(group.length, byWeight) / pattern.count), Math.floor(available / o.h))
      const score = layers * pattern.count
      if (score > 0) candidates.push({ pattern, h: o.h, score })
    }
    candidates.sort((a, b) => b.score - a.score || a.h - b.h)

    // Si la première couche de la meilleure orientation ne passe pas (charge supportée, appui…), on essaie la suivante
    for (const { pattern, h } of candidates) {
      let cursor = 0
      while (group.length - cursor >= pattern.count) {
        const z = topOf(state)
        const trial = cloneState(state)
        let ok = true
        for (let i = 0; i < pattern.count; i++) {
          const r = pattern.rects[i]
          const c = { x: r.x, y: r.y, z, l: r.l, w: r.w, h }
          const below = checkPlacement(trial, group[cursor + i], c)
          if (!below) {
            ok = false
            break
          }
          commit(trial, group[cursor + i], c, below, layerIndex)
        }
        if (!ok) break
        state.placements = trial.placements
        state.loadWeight = trial.loadWeight
        cursor += pattern.count
        layerIndex += 1
      }
      if (cursor > 0) break
    }
  }
}
