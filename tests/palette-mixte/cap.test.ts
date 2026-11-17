import { describe, it, expect } from 'vitest'
import { CAP_ORDERS, capPhase, sortForCap } from '@/lib/palette-mixte/cap'
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

  it('avec débord : pose les colis dont le centre est sur la palette', () => {
    const s = newState(settings({ overhang: 50 }))
    capPhase(s, items('a', 5, { length: 300, width: 200, height: 200 }), 'volume')
    expect(s.placements).toHaveLength(5)
  })

  it('avec débord : un petit colis part du coin de la palette', () => {
    const s = newState(settings({ overhang: 50 }))
    capPhase(s, items('a', 1, { length: 80, width: 80, height: 100 }), 'volume')
    expect(s.placements[0]).toMatchObject({ x: 50, y: 50, z: 0 })
  })

  it('couche le colis seulement s’il est couchable', () => {
    const conf = settings({ maxHeight: 944 }) // 800 mm disponibles
    const upright = newState(conf)
    capPhase(upright, items('a', 1, { length: 700, width: 100, height: 900 }), 'volume')
    expect(upright.placements).toHaveLength(0)
    const tipped = newState(conf)
    capPhase(tipped, items('a', 1, { length: 700, width: 100, height: 900, upright: false }), 'volume')
    expect(tipped.placements).toHaveLength(1)
    expect(tipped.placements[0].h).toBeLessThanOrEqual(800)
  })

  it('respecte la charge supportée par un colis du chapeau', () => {
    const s = newState(settings())
    capPhase(s, [...items('base', 1, { length: 1200, width: 800, height: 100, maxLoadOnTop: 10 }), ...items('a', 5, { weight: 5 })], 'volume')
    expect(s.placements.filter(p => p.refId === 'a')).toHaveLength(2)
  })

  it('refuse une place appuyée à moins de 75 %', () => {
    const s = newState(settings())
    const put = (refId: string, x: number, l: number, h: number) => {
      const [it] = items(refId, 1, { length: l, width: 800, height: h })
      const c = { x, y: 0, z: 0, l, w: 800, h }
      commit(s, it, c, checkPlacement(s, it, c)!, null)
    }
    put('haut', 0, 400, 200)
    put('bas', 400, 800, 100)
    // Seule place : sur le colis haut, 400 mm portés sur 1 000 (40 %)
    capPhase(s, items('a', 1, { length: 1000, width: 800, height: 50 }), 'volume')
    expect(s.placements).toHaveLength(2)
  })

  it('garde consécutifs les colis d’une même référence, pour chaque ordre', () => {
    const list = [
      ...items('a', 3, { length: 300, width: 200, height: 100, weight: 4 }),
      ...items('b', 3, { length: 200, width: 300, height: 100, weight: 4 }),
      ...items('c', 3, { length: 300, width: 200, height: 100, weight: 4, stop: 2 }),
      ...items('d', 3, { length: 600, width: 100, height: 100, weight: 4, fragile: true }),
      ...items('e', 3, { length: 300, width: 200, height: 100, weight: 0 }),
    ].reverse()
    for (const order of CAP_ORDERS) {
      const refs = sortForCap(list, order).map(i => i.refId)
      const runs = refs.filter((r, k) => k === 0 || refs[k - 1] !== r)
      expect(new Set(runs).size, order).toBe(runs.length)
    }
  })
})
