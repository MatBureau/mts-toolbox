import { describe, it, expect } from 'vitest'
import { computePalletization } from '@/lib/palette/packing'
import { buildPallet, sortItems } from '@/lib/palette-mixte/pallet'
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
})
