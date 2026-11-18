import { bestLayer, type VehicleSpec } from '@/lib/palette/packing'

export interface PalletForVehicle {
  totalHeight: number
  grossWeight: number
  topHasFragile: boolean
}

export interface OrderVehicleLoad {
  vehicle: VehicleSpec
  floorCapacity: number // palettes au sol par véhicule
  positions: number // emplacements au sol utilisés par la commande
  vehiclesNeeded: number | null // null : la palette ne rentre pas au sol
  tooTall: number // palettes plus hautes que le véhicule
  totalWeight: number
}

/**
 * Gerbage glouton : chaque palette porteuse (sans fragile au sommet), de la plus haute
 * à la plus basse, reçoit la plus haute palette restante dont la hauteur cumulée tient.
 */
export function orderVehicleLoad(
  vehicle: VehicleSpec,
  footprint: { length: number; width: number },
  pallets: PalletForVehicle[],
  stackable: boolean
): OrderVehicleLoad {
  const floorCapacity = bestLayer(vehicle.length, vehicle.width, footprint.length, footprint.width).count
  const fit = pallets.filter(p => p.totalHeight <= vehicle.height)
  const tooTall = pallets.length - fit.length

  let pairs = 0
  if (stackable) {
    const byHeight = [...fit].sort((a, b) => b.totalHeight - a.totalHeight)
    const used = new Set<number>()
    byHeight.forEach((bottom, i) => {
      if (used.has(i) || bottom.topHasFragile) return
      used.add(i)
      const j = byHeight.findIndex((top, k) => !used.has(k) && bottom.totalHeight + top.totalHeight <= vehicle.height)
      if (j >= 0) {
        used.add(j)
        pairs += 1
      }
    })
  }

  const positions = fit.length - pairs
  const totalWeight = fit.reduce((sum, p) => sum + p.grossWeight, 0)
  const byFloor = floorCapacity > 0 ? Math.ceil(positions / floorCapacity) : null
  const byWeight = Math.ceil(totalWeight / vehicle.payload)
  return {
    vehicle,
    floorCapacity,
    positions,
    vehiclesNeeded: positions === 0 ? 0 : byFloor === null ? null : Math.max(byFloor, byWeight),
    tooTall,
    totalWeight,
  }
}
