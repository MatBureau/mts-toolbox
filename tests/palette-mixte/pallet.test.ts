import { describe, it, expect } from 'vitest'
import { computePalletization } from '@/lib/palette/packing'
import { buildPallet, sortItems } from '@/lib/palette-mixte/pallet'
import { CAP_ORDERS, capPhase } from '@/lib/palette-mixte/cap'
import { layerPhase } from '@/lib/palette-mixte/layers'
import { checkPlacement, cloneState, commit, newState } from '@/lib/palette-mixte/state'
import type { BoxItem, OrderSettings } from '@/lib/palette-mixte/types'
import { EUR, items, settings } from './fixtures'

const simple = (weight: number, maxLoad: number, box = { length: 400, width: 300, height: 250 }, overhang = 0) =>
  computePalletization({
    box: { ...box, weight },
    pallet: EUR,
    maxHeight: 1800,
    maxLoad,
    overhang,
    allowTipping: false,
  }).totalBoxes

describe('construction d’une palette', () => {
  it('trie : dernier client, non fragiles, lourds d’abord', () => {
    const list = [
      ...items('a', 1, { weight: 5 }),
      ...items('b', 1, { weight: 20 }),
      ...items('c', 1, { weight: 50, fragile: true }),
      ...items('d', 1, { weight: 1, stop: 2 }),
    ]
    expect(sortItems(list).map(i => i.refId)).toEqual(['d', 'b', 'a', 'c'])
  })

  it('égale la palettisation simple, limite de hauteur', () => {
    const s = buildPallet(items('a', 200), settings())
    expect(s.placements).toHaveLength(simple(5, 0))
  })

  it('égale la palettisation simple, limite de poids (couche incomplète)', () => {
    const s = buildPallet(items('a', 200, { weight: 30 }), settings({ maxLoad: 1000 }))
    expect(simple(30, 1000)).toBe(33)
    expect(s.placements).toHaveLength(33)
  })

  it('pose le reste en chapeau au-dessus des couches', () => {
    const s = buildPallet(
      [...items('a', 8, { length: 600, width: 400, height: 400, weight: 15 }), ...items('b', 3, { length: 300, width: 200, height: 150, weight: 2 })],
      settings()
    )
    const b = s.placements.filter(p => p.refId === 'b')
    expect(b).toHaveLength(3)
    expect(b.every(p => p.z === 800 && p.layer === null)).toBe(true)
  })

  // Équivalence avec débord : vraie tant que chaque côté du colis vaut au moins deux fois le débord
  describe.each([20, 50])('égale la palettisation simple avec %i mm de débord', overhang => {
    it.each([
      [400, 300, 250],
      [300, 200, 150],
      [300, 200, 200],
      [250, 150, 100],
      [350, 250, 180],
    ])('colis %i × %i × %i', (length, width, height) => {
      const box = { length, width, height }
      const expected = simple(5, 0, box, overhang)
      const s = buildPallet(items('a', expected + 50, box), settings({ overhang }))
      expect(expected).toBeGreaterThan(0)
      expect(s.placements).toHaveLength(expected)
    })
  })

  // Rejoue chaque pose dans l'ordre sur un état neuf, sans index spatial : toutes doivent être valides
  const replay = (list: BoxItem[], conf: OrderSettings) => {
    const built = buildPallet(list, conf)
    const byUid = new Map(list.map(i => [i.uid, i]))
    const s = newState(conf)
    for (const p of built.placements) {
      const item = byUid.get(p.uid)!
      const c = { x: p.x, y: p.y, z: p.z, l: p.l, w: p.w, h: p.h }
      const below = checkPlacement(s, item, c)
      expect(below, p.uid).not.toBeNull()
      commit(s, item, c, below!, p.layer)
    }
    return built.placements.length
  }

  it.each([
    ['sans débord', 0],
    ['avec débord', 40],
  ])('commande variée %s : chaque pose respecte les règles', (_, overhang) => {
    const list: BoxItem[] = []
    const dims = [[90, 60, 70], [120, 80, 50], [200, 150, 120], [55, 45, 90], [300, 200, 160], [75, 75, 75]]
    dims.forEach(([length, width, height], k) =>
      list.push(...items(`r${k}`, 60, { length, width, height, weight: 1 + k, upright: k % 2 === 0, maxLoadOnTop: k === 2 ? 40 : null, fragile: k === 5 }))
    )
    expect(replay(list, settings({ overhang, maxHeight: 1200 }))).toBeGreaterThan(0)
  })

  it('garde l’ordre de chapeau qui pose le plus de colis', () => {
    const conf = settings({ maxHeight: 944 })
    const list = [
      ...items('a', 4, { length: 800, width: 100, height: 600, weight: 8 }),
      ...items('b', 3, { length: 600, width: 400, height: 300, weight: 20 }),
    ]
    const base = newState(conf)
    const sorted = sortItems(list)
    layerPhase(base, sorted)
    const rest = sorted.filter(i => !base.placements.some(p => p.uid === i.uid))
    const counts = CAP_ORDERS.map(order => {
      const trial = cloneState(base)
      capPhase(trial, rest, order)
      return trial.placements.length
    })
    expect(new Set(counts).size).toBeGreaterThan(1) // les ordres ne se valent pas ici
    expect(buildPallet(list, conf).placements).toHaveLength(Math.max(...counts))
  })
})
