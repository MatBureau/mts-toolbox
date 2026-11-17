import { describe, it, expect } from 'vitest'
import { boxesIntersect, footprintOverlap, massOf, orientations, zoneOf } from '@/lib/palette-mixte/geometry'

describe('géométrie', () => {
  it('colis à plat : deux orientations au sol', () => {
    expect(orientations({ length: 400, width: 300, height: 200, upright: true })).toEqual([
      { l: 400, w: 300, h: 200 },
      { l: 300, w: 400, h: 200 },
    ])
  })

  it('colis couchable : six orientations distinctes', () => {
    expect(orientations({ length: 400, width: 300, height: 200, upright: false })).toHaveLength(6)
  })

  it('cube : une seule orientation', () => {
    expect(orientations({ length: 300, width: 300, height: 300, upright: false })).toEqual([{ l: 300, w: 300, h: 300 }])
  })

  it('recouvrement au sol', () => {
    expect(footprintOverlap({ x: 0, y: 0, l: 100, w: 100 }, { x: 50, y: 50, l: 100, w: 100 })).toBe(2500)
    expect(footprintOverlap({ x: 0, y: 0, l: 100, w: 100 }, { x: 100, y: 0, l: 100, w: 100 })).toBe(0)
  })

  it('deux colis qui se touchent ne se chevauchent pas', () => {
    const a = { x: 0, y: 0, z: 0, l: 100, w: 100, h: 100 }
    expect(boxesIntersect(a, { ...a, x: 100 })).toBe(false)
    expect(boxesIntersect(a, { ...a, z: 100 })).toBe(false)
    expect(boxesIntersect(a, { ...a, x: 50, z: 50 })).toBe(true)
  })

  it('zone utile avec débord', () => {
    expect(zoneOf({ pallet: { length: 1200, width: 800, height: 144, tare: 25 }, maxHeight: 1800, maxLoad: 0, overhang: 20 })).toEqual({
      length: 1240,
      width: 840,
      offset: 20,
      usableHeight: 1656,
      palletLength: 1200,
      palletWidth: 800,
    })
  })

  it('masse estimée sans poids : 200 kg/m³', () => {
    expect(massOf(12, 1e9)).toBe(12)
    expect(massOf(0, 1e9)).toBe(200)
  })
})
