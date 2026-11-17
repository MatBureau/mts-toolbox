import { describe, it, expect } from 'vitest'
import { layerPhase } from '@/lib/palette-mixte/layers'
import { checkPlacement, commit, newState } from '@/lib/palette-mixte/state'
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

  it('respecte la charge supportée en empilant les couches', () => {
    const s = newState(settings())
    layerPhase(s, items('a', 100, { maxLoadOnTop: 20, weight: 5 }))
    expect(s.placements).toHaveLength(40) // la 6e couche ferait porter 25 kg à la 1re
  })

  it('essaie l’orientation suivante quand la première couche ne passe pas', () => {
    const s = newState(settings())
    const [base] = items('base', 1, { length: 1200, width: 800, height: 100, maxLoadOnTop: 50 })
    const c = { x: 0, y: 0, z: 0, l: 1200, w: 800, h: 100 }
    commit(s, base, c, checkPlacement(s, base, c)!, null)
    // Couché : 12 par couche (60 kg, refusé par la base), puis 9 par couche (45 kg)
    layerPhase(s, items('a', 12, { upright: false, weight: 5 }))
    expect(s.placements).toHaveLength(10)
    expect(s.placements[1].h).toBe(300)
  })

  it('choisit l’orientation qui pose le plus de colis compte tenu de la charge maximale', () => {
    const s = newState(settings({ maxLoad: 80, maxHeight: 1344 }))
    // 16 colis au plus : 2 couches de 8 valent mieux qu’une couche de 9 ou de 12
    layerPhase(s, items('a', 100, { upright: false, weight: 5 }))
    expect(s.placements).toHaveLength(16)
  })

  it('numérote les couches à la suite des couches existantes', () => {
    const s = newState(settings())
    const [base] = items('base', 1, { length: 1200, width: 800, height: 100 })
    const c = { x: 0, y: 0, z: 0, l: 1200, w: 800, h: 100 }
    commit(s, base, c, checkPlacement(s, base, c)!, 0)
    layerPhase(s, items('a', 8))
    expect(s.placements.slice(1).every(p => p.layer === 1)).toBe(true)
  })
})
