import { describe, it, expect } from 'vitest'
import { palletizeOrder } from '@/lib/palette-mixte/engine'
import type { OrderSettings } from '@/lib/palette-mixte/types'
import { palletViolations, randomOrder, rejectedCount } from './helpers'
import { EUR, ref, settings } from './fixtures'

const big = { length: 600, width: 400, height: 400, weight: 15 }

describe('palettisation d’une commande', () => {
  it('respecte toutes les règles sur des commandes aléatoires', () => {
    for (let seed = 1; seed <= 15; seed++) {
      const { refs, settings: s } = randomOrder(seed)
      const r = palletizeOrder(refs, s)
      expect(r.error).toBeNull()
      for (const p of r.pallets) expect(palletViolations(p, s), `graine ${seed}, palette ${p.index + 1}`).toEqual([])
      expect(r.placedBoxes + rejectedCount(r)).toBe(r.totalBoxes)
    }
  }, 120_000)

  it('refuse les colis impossibles avec la bonne raison', () => {
    const r = palletizeOrder(
      [
        ref({ id: 'grand', length: 1300, width: 900, height: 100 }),
        ref({ id: 'haut', length: 500, width: 500, height: 2000, upright: false }),
        ref({ id: 'lourd', weight: 1200 }),
        ref({ id: 'minuscule', length: 5 }),
        ref({ id: 'ok', quantity: 3 }),
      ],
      settings({ maxLoad: 1000 })
    )
    expect(r.rejected).toEqual(
      expect.arrayContaining([
        { refId: 'grand', count: 1, reason: 'trop-grand' },
        { refId: 'haut', count: 1, reason: 'trop-haut' },
        { refId: 'lourd', count: 1, reason: 'trop-lourd' },
        { refId: 'minuscule', count: 1, reason: 'invalide' },
      ])
    )
    expect(r.placedBoxes).toBe(3)
    expect(r.totalBoxes).toBe(7)
  })

  it('applique les limites de saisie', () => {
    expect(palletizeOrder(Array.from({ length: 31 }, (_, i) => ref({ id: `r${i}` })), settings()).error).toMatch(/30 références/)
    expect(palletizeOrder([ref({ id: 'a', quantity: 3001 })], settings()).error).toMatch(/colis au maximum/)
  })

  it('refuse les dimensions démesurées (lien piégé) sans calculer', () => {
    const a = [ref({ id: 'a' })]
    const huge = (over: Partial<OrderSettings>) => palletizeOrder(a, settings(over))
    // \s : le séparateur de milliers fr-FR est une espace insécable fine
    expect(huge({ pallet: { ...EUR, length: 20_001 } }).error).toMatch(/palette ne peuvent dépasser 20\s000 mm/)
    expect(huge({ pallet: { ...EUR, width: 999_999 } }).error).toMatch(/palette ne peuvent dépasser 20\s000 mm/)
    expect(huge({ overhang: 80_000 }).error).toMatch(/débord ne peut dépasser 500 mm/)
    expect(huge({ maxHeight: 10_001 }).error).toMatch(/hauteur maximale ne peut dépasser 10\s000 mm/)
    expect(huge({ pallet: { ...EUR, height: 2_001 }, maxHeight: 5_000 }).error).toMatch(/hauteur de la palette ne peut dépasser 2\s000 mm/)
    const r = huge({ pallet: { length: 999_999, width: 999_999, height: 0, tare: 0 }, maxHeight: 999_999, overhang: 999_999 })
    expect(r.error).not.toBeNull()
    expect(r.pallets).toEqual([])
    // Aux bornes : accepté
    expect(huge({ pallet: { ...EUR, length: 20_000, width: 20_000, height: 2_000 }, maxHeight: 10_000, overhang: 500 }).error).toBeNull()
  })

  it('sépare les clients et regroupe les fins de commande, dernier livré en bas', () => {
    const r = palletizeOrder(
      [ref({ id: 'a', ...big, quantity: 40, stop: 1 }), ref({ id: 'b', ...big, quantity: 40, stop: 2 })],
      settings()
    )
    expect(r.pallets).toHaveLength(5)
    const mixed = r.pallets.filter(p => p.stops.length > 1)
    expect(mixed).toHaveLength(1)
    const zA = mixed[0].placements.filter(p => p.refId === 'a').map(p => p.z)
    const zB = mixed[0].placements.filter(p => p.refId === 'b').map(p => p.z)
    expect(Math.max(...zB)).toBeLessThan(Math.min(...zA))
  })

  it('fusionne deux fins de client sans poser le dernier livré sur le premier', () => {
    const r = palletizeOrder([ref({ id: 'a', ...big, quantity: 6, stop: 1 }), ref({ id: 'b', ...big, quantity: 6, stop: 2 })], settings())
    expect(r.pallets).toHaveLength(1)
    expect(r.pallets[0].placements).toHaveLength(12)
    expect(palletViolations(r.pallets[0], settings())).toEqual([])
  })

  it('monte la couche du premier livré sur le chapeau du suivant, dans l’ordre', () => {
    const r = palletizeOrder(
      [ref({ id: 'a', ...big, quantity: 4, stop: 1 }), ref({ id: 'b', ...big, quantity: 2, stop: 2 }), ref({ id: 'c', ...big, quantity: 2, stop: 2 })],
      settings()
    )
    expect(r.pallets).toHaveLength(1)
    const p = r.pallets[0]
    expect(p.placements.filter(q => q.refId === 'a').every(q => q.z === 400 && q.layer !== null)).toBe(true)
    expect(palletViolations(p, settings())).toEqual([])
  })

  it('garde une référence ensemble quand elle tient sur une palette', () => {
    const order = (keepTogether: boolean) =>
      palletizeOrder(
        [ref({ id: 'a', ...big, quantity: 12 }), ref({ id: 'k', length: 600, width: 400, height: 300, weight: 10, quantity: 8, keepTogether })],
        settings()
      )
    const together = order(true)
    expect(together.pallets[0].placements.every(p => p.refId === 'a')).toBe(true)
    expect(together.pallets[1].placements.filter(p => p.refId === 'k')).toHaveLength(8)
    const split = order(false)
    expect(split.pallets[0].placements.filter(p => p.refId === 'k')).toHaveLength(4)
  })

  it('reporte une seule des références « ensemble » coupées à la fois', () => {
    const r = palletizeOrder(
      [
        ref({ id: 'A', ...big, quantity: 10, keepTogether: true }),
        ref({ id: 'B', length: 500, width: 400, height: 300, weight: 10, quantity: 10, keepTogether: true }),
      ],
      settings()
    )
    const spread = (refId: string) => r.pallets.filter(p => p.placements.some(q => q.refId === refId)).length
    expect(spread('A')).toBe(1)
    expect(spread('B')).toBe(1)
    expect(r.placedBoxes).toBe(20)
  })

  it('regarde de nouveau si le reste d’une référence « ensemble » tient sur une palette', () => {
    const r = palletizeOrder(
      [
        ref({ id: 'F', ...big, weight: 20, quantity: 15 }),
        ref({ id: 'K', ...big, quantity: 18, keepTogether: true }),
      ],
      settings()
    )
    const spread = r.pallets.filter(p => p.placements.some(q => q.refId === 'K')).length
    expect(spread).toBeLessThanOrEqual(2)
    expect(r.placedBoxes).toBe(33)
  })

  it('signale les poids manquants', () => {
    expect(palletizeOrder([ref({ id: 'a', weight: null })], settings()).missingWeight).toBe(true)
    expect(palletizeOrder([ref({ id: 'a' })], settings()).missingWeight).toBe(false)
  })

  it('reste rapide sur une grosse commande (30 références, 3 000 colis)', () => {
    const refs = Array.from({ length: 30 }, (_, i) =>
      ref({ id: `r${i}`, length: 200 + (i % 6) * 60, width: 150 + (i % 5) * 50, height: 120 + (i % 4) * 70, weight: 2 + (i % 7), quantity: 100 })
    )
    const start = Date.now()
    const r = palletizeOrder(refs, settings({ maxLoad: 1000 }))
    expect(r.placedBoxes).toBe(3000)
    expect(Date.now() - start).toBeLessThan(8000)
  }, 30_000)
})
