import { PalletSpec, VehicleSpec } from './packing'

export interface PalletPreset extends PalletSpec {
  id: string
  name: string
}

// Dimensions normalisées (mm) ; tares indicatives des palettes bois courantes
export const PALLET_PRESETS: PalletPreset[] = [
  { id: 'eur', name: 'Europe EUR / EPAL 1', length: 1200, width: 800, height: 144, tare: 25 },
  { id: 'eur2', name: 'Industrielle EUR 2 / EUR 3', length: 1200, width: 1000, height: 144, tare: 33 },
  { id: 'eur6', name: 'Demi-palette EUR 6', length: 800, width: 600, height: 144, tare: 10 },
  { id: 'quart', name: 'Quart de palette', length: 600, width: 400, height: 144, tare: 5 },
  { id: 'us', name: 'US GMA 48 × 40 in', length: 1219, width: 1016, height: 140, tare: 23 },
  { id: 'asie', name: 'Asie 1100 × 1100', length: 1100, width: 1100, height: 150, tare: 25 },
  { id: 'aus', name: 'Australie 1165 × 1165', length: 1165, width: 1165, height: 150, tare: 30 },
]

export const CUSTOM_PALLET_ID = 'custom'

// Surfaces utiles. Semi-remorque : 13,60 m moins 10 cm de jeu de chargement
// (sans jeu, 34 palettes EUR « rentrent » sur le papier mais pas au quai).
// Conteneurs : hauteur de porte, c'est elle qui limite le gerbage.
export const VEHICLE_PRESETS: VehicleSpec[] = [
  { id: 'semi', name: 'Semi-remorque 13,60 m', length: 13500, width: 2460, height: 2700, payload: 24000 },
  { id: 'porteur', name: 'Porteur 19 t (7,20 m)', length: 7150, width: 2460, height: 2500, payload: 9500 },
  { id: 'vl20', name: 'Fourgon 20 m³', length: 4100, width: 2000, height: 2100, payload: 1000 },
  { id: 'c20', name: 'Conteneur 20 pieds', length: 5898, width: 2352, height: 2280, payload: 28200 },
  { id: 'c40', name: 'Conteneur 40 pieds', length: 12032, width: 2352, height: 2280, payload: 26700 },
  { id: 'c40hc', name: 'Conteneur 40 pieds HC', length: 12032, width: 2352, height: 2585, payload: 26500 },
]
