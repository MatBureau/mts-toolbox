import { describe, it, expect } from 'vitest'
import { bestLayer, computePalletization, computeVehicleLoad } from '@/lib/palette/packing'
import { PALLET_PRESETS, VEHICLE_PRESETS } from '@/lib/palette/presets'

const vehicle = (id: string) => {
  const v = VEHICLE_PRESETS.find(x => x.id === id)
  if (!v) throw new Error(`véhicule ${id} absent`)
  return v
}

describe('moteur de couche (références métier)', () => {
  it.each([
    { name: 'EUR en semi-remorque', id: 'semi', a: 1200, b: 800, expected: 33 },
    { name: 'EUR 2 en semi-remorque', id: 'semi', a: 1200, b: 1000, expected: 26 },
    { name: 'EUR en conteneur 20 pieds', id: 'c20', a: 1200, b: 800, expected: 11 },
    { name: 'EUR en conteneur 40 pieds', id: 'c40', a: 1200, b: 800, expected: 25 },
  ])('$name : $expected', ({ id, a, b, expected }) => {
    const v = vehicle(id)
    expect(bestLayer(v.length, v.width, a, b).count).toBe(expected)
  })

  it('carton 500 × 300 sur palette Europe : 6 par couche (4 en rangement simple)', () => {
    expect(bestLayer(1200, 800, 500, 300).count).toBe(6)
  })

  it('moulinet 50 × 50 / 30 × 20 : 4', () => {
    expect(bestLayer(50, 50, 30, 20).count).toBe(4)
  })

  it('400 × 300 × 250 sur Europe à 1,80 m : 48 colis, 8 par couche', () => {
    const r = computePalletization({
      box: { length: 400, width: 300, height: 250, weight: 5 },
      pallet: PALLET_PRESETS[0],
      maxHeight: 1800,
      maxLoad: 1000,
      overhang: 0,
      allowTipping: false,
    })
    expect(r.totalBoxes).toBe(48)
    expect(r.perLayer).toBe(8)
  })

  it('palettes de 1,35 m gerbables en semi-remorque : 66', () => {
    const load = computeVehicleLoad(vehicle('semi'), { length: 1200, width: 800 }, 1350, 600, 40, true)
    expect(load.pallets).toBe(66)
  })
})
