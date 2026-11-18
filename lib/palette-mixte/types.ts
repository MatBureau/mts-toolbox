import type { PalletSpec } from '@/lib/palette/packing'

// Une référence de la commande (« Colis 1 », « Colis 2 »…)
export interface Reference {
  id: string
  name: string
  length: number // mm
  width: number // mm
  height: number // mm
  quantity: number
  weight: number | null // kg par colis, null = inconnu
  upright: boolean // ce côté vers le haut
  fragile: boolean // rien dessus
  maxLoadOnTop: number | null // kg admissibles au-dessus, null = sans limite
  keepTogether: boolean
  stop: number // 1 = livré en premier
}

export interface OrderSettings {
  pallet: PalletSpec
  maxHeight: number // mm, palette comprise
  maxLoad: number // kg de marchandise, 0 = sans limite
  overhang: number // mm de débord par côté
}

// Un colis individuel issu d'une référence
export interface BoxItem {
  uid: string
  refId: string
  index: number // 1..quantité
  length: number
  width: number
  height: number
  weight: number // 0 si inconnu
  upright: boolean
  fragile: boolean
  maxLoadOnTop: number | null
  keepTogether: boolean
  stop: number
}

export interface Placement {
  uid: string
  refId: string
  index: number
  x: number
  y: number
  z: number
  l: number
  w: number
  h: number
  weight: number
  fragile: boolean
  maxLoadOnTop: number | null
  loadAbove: number // kg posés au-dessus (modèle prudent)
  stop: number
  layer: number | null // indice de couche pleine, null pour le chapeau
}

export type Step =
  | { kind: 'layer'; number: number; layer: number; refId: string; uids: string[]; label: string }
  | { kind: 'box'; number: number; uid: string; refId: string; label: string }

export interface PalletPlan {
  index: number
  placements: Placement[]
  steps: Step[]
  loadWeight: number // kg de marchandise
  grossWeight: number // kg, palette comprise
  totalHeight: number // mm, palette comprise
  volumeUsage: number // % du volume utile
  stops: number[]
  cogWarning: boolean
  topHasFragile: boolean
}

export type RejectReason = 'invalide' | 'trop-grand' | 'trop-haut' | 'trop-lourd'

export interface Rejected {
  refId: string
  count: number
  reason: RejectReason
}

export interface MixedResult {
  error: string | null
  pallets: PalletPlan[]
  rejected: Rejected[]
  totalBoxes: number
  placedBoxes: number
  totalWeight: number // kg, palettes comprises
  missingWeight: boolean
}

// Bornes de saisie (mm pour les dimensions) : au-delà, le calcul n'a plus de sens et deviendrait démesuré
export const LIMITS = {
  maxReferences: 30,
  maxBoxes: 3000,
  maxPalletSide: 20_000,
  maxOverhang: 500,
  maxPalletHeight: 2_000,
  maxHeight: 10_000,
}

// Part minimale de la base d'un colis qui doit reposer sur un support
export const SUPPORT_RATIO = 0.75

// Tolérance géométrique (mm)
export const EPS = 0.5

// Densité estimée d'un colis sans poids (kg/m³), pour trier et équilibrer
export const ESTIMATED_DENSITY = 200

export const REJECT_LABELS: Record<RejectReason, string> = {
  invalide: 'dimensions invalides (10 mm minimum)',
  'trop-grand': 'plus grand que la palette',
  'trop-haut': 'plus haut que la hauteur disponible',
  'trop-lourd': 'plus lourd que la charge maximale',
}
