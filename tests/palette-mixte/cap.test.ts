import { describe, it, expect } from 'vitest'
import { capPhase, sortForCap } from '@/lib/palette-mixte/cap'
import { checkPlacement, commit, newState } from '@/lib/palette-mixte/state'
import { items, settings } from './fixtures'

describe('chapeau', () => {
  it('pose le premier colis au fond à gauche sur la palette', () => {
    const s = newState(settings())
    capPhase(s, items('a', 1, { height: 200 }), 'volume')
    expect(s.placements[0]).toMatchObject({ x: 0, y: 0, z: 0, layer: null })
  })

  it('remplit le plancher avant de monter', () => {
    const s = newState(settings())
    capPhase(s, items('a', 7, { height: 200 }), 'volume')
    expect(s.placements.filter(p => p.z === 0)).toHaveLength(6)
    expect(s.placements[6]).toMatchObject({ x: 0, y: 0, z: 200 })
  })

  it('tourne le colis quand le sens d’origine ne passe pas', () => {
    const s = newState(settings())
    capPhase(s, items('a', 1, { length: 500, width: 900, height: 200 }), 'volume')
    expect(s.placements[0]).toMatchObject({ l: 900, w: 500 })
  })

  it('ne pose rien sur un fragile', () => {
    const s = newState(settings())
    const [fragile] = items('f', 1, { length: 1200, width: 800, height: 200, fragile: true })
    const c = { x: 0, y: 0, z: 0, l: 1200, w: 800, h: 200 }
    commit(s, fragile, c, checkPlacement(s, fragile, c)!, null)
    capPhase(s, items('a', 3), 'volume')
    expect(s.placements).toHaveLength(1)
  })

  it('respecte la charge maximale', () => {
    const s = newState(settings({ maxLoad: 25 }))
    capPhase(s, items('a', 5, { weight: 10 }), 'volume')
    expect(s.placements).toHaveLength(2)
  })

  it('trie : dernier client, puis non fragiles, puis le critère choisi', () => {
    const list = [
      ...items('petit', 1, { length: 100, width: 100, height: 100 }),
      ...items('fragile', 1, { length: 600, width: 400, height: 400, fragile: true }),
      ...items('grand', 1, { length: 600, width: 400, height: 400 }),
      ...items('client2', 1, { length: 100, width: 100, height: 100, stop: 2 }),
    ]
    expect(sortForCap(list, 'volume').map(i => i.refId)).toEqual(['client2', 'grand', 'petit', 'fragile'])
  })
})
