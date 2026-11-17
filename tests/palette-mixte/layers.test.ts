import { describe, it, expect } from 'vitest'
import { layerPhase } from '@/lib/palette-mixte/layers'
import { newState } from '@/lib/palette-mixte/state'
import { items, settings } from './fixtures'

describe('couches pleines', () => {
  it('empile des couches jusqu’à la hauteur maximale', () => {
    const s = newState(settings())
    layerPhase(s, items('a', 100))
    expect(s.placements).toHaveLength(48)
    expect(new Set(s.placements.map(p => p.layer)).size).toBe(6)
  })

  it('ne forme jamais de couche incomplète', () => {
    const s = newState(settings())
    layerPhase(s, items('a', 12))
    expect(s.placements).toHaveLength(8)
  })

  it('laisse les fragiles au chapeau', () => {
    const s = newState(settings())
    layerPhase(s, items('f', 20, { fragile: true }))
    expect(s.placements).toHaveLength(0)
  })

  it('s’arrête avant de dépasser la charge maximale', () => {
    const s = newState(settings({ maxLoad: 1000 }))
    layerPhase(s, items('a', 100, { weight: 30 }))
    expect(s.placements).toHaveLength(32)
  })

  it('enchaîne deux références dans l’ordre reçu', () => {
    const s = newState(settings())
    layerPhase(s, [...items('a', 8, { length: 600, width: 400, height: 400, weight: 15 }), ...items('b', 8)])
    const b = s.placements.filter(p => p.refId === 'b')
    expect(b).toHaveLength(8)
    expect(b.every(p => p.z === 800)).toBe(true)
  })

  it('pose des couches avec débord', () => {
    const s = newState(settings({ overhang: 50 }))
    layerPhase(s, items('a', 100, { length: 300, width: 200, height: 200 }))
    expect(s.placements).toHaveLength(95) // 19 par couche, 5 couches
  })
})
