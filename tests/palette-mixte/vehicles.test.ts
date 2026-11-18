import { describe, it, expect } from 'vitest'
import { orderVehicleLoad } from '@/lib/palette-mixte/vehicles'
import { VEHICLE_PRESETS } from '@/lib/palette/presets'

const semi = VEHICLE_PRESETS.find(v => v.id === 'semi')!
const eur = { length: 1200, width: 800 }
const pal = (totalHeight: number, topHasFragile = false, grossWeight = 500) => ({ totalHeight, grossWeight, topHasFragile })

describe('véhicules', () => {
  it('places au sol et nombre de véhicules', () => {
    expect(orderVehicleLoad(semi, eur, [pal(1300), pal(1200), pal(900)], false)).toMatchObject({
      floorCapacity: 33, positions: 3, vehiclesNeeded: 1, tooTall: 0,
    })
  })

  it('gerbe la palette la plus haute avec la plus haute qui tient', () => {
    expect(orderVehicleLoad(semi, eur, [pal(1300), pal(1200), pal(900)], true).positions).toBe(2)
  })

  it('une palette au dessus fragile peut être posée dessus, jamais dessous', () => {
    expect(orderVehicleLoad(semi, eur, [pal(1500, true), pal(1200)], true).positions).toBe(1)
    expect(orderVehicleLoad(semi, eur, [pal(1500, true), pal(1200, true)], true).positions).toBe(2)
  })

  it('signale les palettes trop hautes', () => {
    expect(orderVehicleLoad(semi, eur, [pal(2800), pal(1000)], false)).toMatchObject({ tooTall: 1, positions: 1 })
  })

  it('tient compte de la charge utile', () => {
    const many = Array.from({ length: 30 }, () => pal(1000, false, 1000))
    expect(orderVehicleLoad(semi, eur, many, false).vehiclesNeeded).toBe(2)
  })
})
