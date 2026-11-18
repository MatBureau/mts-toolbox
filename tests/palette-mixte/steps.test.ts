import { describe, it, expect } from 'vitest'
import { buildPallet } from '@/lib/palette-mixte/pallet'
import { buildSteps, positionLabel } from '@/lib/palette-mixte/steps'
import { zoneOf } from '@/lib/palette-mixte/geometry'
import { items, settings } from './fixtures'

const zone = zoneOf(settings())

describe('étapes', () => {
  it('couches puis colis du chapeau, avec support et position en mots', () => {
    const s = buildPallet(
      [...items('a', 4, { length: 600, width: 400, height: 400, weight: 15 }), ...items('b', 1, { length: 300, width: 200, height: 150, weight: 2 })],
      settings()
    )
    const steps = buildSteps(s.placements, new Map([['a', 'Carton A'], ['b', 'Carton B']]), s.zone)
    expect(steps).toHaveLength(2)
    expect(steps[0]).toMatchObject({ kind: 'layer', number: 1, layer: 0, refId: 'a', label: 'Couche 1 : 4 × Carton A' })
    expect(steps[1]).toMatchObject({ kind: 'box', number: 2, refId: 'b', label: 'Carton B n° 1 — posé sur Carton A, au fond, à gauche' })
  })

  it('nomme « Colis » une référence sans nom', () => {
    const s = buildPallet(items('a', 1), settings())
    expect(buildSteps(s.placements, new Map([['a', '']]), s.zone)[0].label).toBe('Colis n° 1 — posé sur la palette, au fond, à gauche')
  })

  it('positions par tiers de palette', () => {
    expect(positionLabel({ x: 500, y: 300, l: 200, w: 200 }, zone)).toBe('au centre')
    expect(positionLabel({ x: 500, y: 700, l: 200, w: 100 }, zone)).toBe('devant')
    expect(positionLabel({ x: 1000, y: 0, l: 200, w: 100 }, zone)).toBe('au fond, à droite')
  })
})
