import { DosageType, DosageConfig, ElementType } from './types'

// Configurations de dosage prédéfinies
export const DOSAGE_PRESETS: Record<Exclude<DosageType, 'custom'>, DosageConfig> = {
  maigre: {
    cimentKgM3: 250,
    sableParts: 3,
    gravierParts: 4,
    eauLitresM3: 150,
  },
  standard: {
    cimentKgM3: 350,
    sableParts: 2,
    gravierParts: 3,
    eauLitresM3: 175,
  },
  riche: {
    cimentKgM3: 400,
    sableParts: 1.5,
    gravierParts: 2.5,
    eauLitresM3: 180,
  },
}

// Labels des types de dosage
export const DOSAGE_LABELS: Record<DosageType, string> = {
  maigre: 'Maigre (250 kg/m³)',
  standard: 'Standard (350 kg/m³)',
  riche: 'Riche (400 kg/m³)',
  custom: 'Personnalisé',
}

// Labels des types d'éléments
export const ELEMENT_LABELS: Record<ElementType, string> = {
  dalle: 'Dalle / Radier',
  mur: 'Mur',
  semelle: 'Semelle filante',
  ouverture: 'Ouverture (à déduire)',
}

// Icônes des types d'éléments
export const ELEMENT_ICONS: Record<ElementType, string> = {
  dalle: '⬜',
  mur: '🧱',
  semelle: '➖',
  ouverture: '🚪',
}

// Épaisseurs par défaut (cm)
export const DEFAULT_EPAISSEURS: Record<ElementType, number> = {
  dalle: 10,
  mur: 20,
  semelle: 30,
  ouverture: 20,
}

// Presets d'épaisseur rapides (cm)
export const EPAISSEUR_PRESETS = {
  dalle: [10, 12, 15, 20],
  mur: [15, 20, 25, 30],
  semelle: [20, 25, 30, 40],
  ouverture: [15, 20, 25],
}

// Densités par défaut (kg/m³)
export const DEFAULT_DENSITES = {
  sable: 1500,
  gravier: 1600,
}

// Poids de sac par défaut (kg)
export const DEFAULT_POIDS_SAC = 35
export const POIDS_SAC_OPTIONS = [25, 35]

// Pertes par défaut (%)
export const DEFAULT_PERTES = 7

// Options d'arrondi toupie
export const ARRONDI_TOUPIE_OPTIONS = [
  { value: 0, label: 'Pas d\'arrondi' },
  { value: 0.25, label: 'Arrondi au 0,25 m³' },
  { value: 0.5, label: 'Arrondi au 0,5 m³' },
]

// Masse volumique du béton frais ordinaire (kg/m³), base du bilan de masse des granulats
export const DENSITE_BETON_FRAIS = 2350

// Version du schéma de projet (v2 : hauteur de semelle en mètres)
export const SCHEMA_VERSION = 2

// Clé localStorage (inchangée : les projets v1 sont migrés au chargement)
export const STORAGE_KEY = 'mts-toolbox:metiers:maconnerie:v1'

// Délai debounce auto-save (ms)
export const DEBOUNCE_MS = 1000

// Projet par défaut
export const DEFAULT_PROJECT = {
  schemaVersion: SCHEMA_VERSION,
  nom: 'Nouveau projet',
  elements: [],
  dosageType: 'standard' as DosageType,
  dosageCustom: DOSAGE_PRESETS.standard,
  pertes: DEFAULT_PERTES,
  poidsSac: DEFAULT_POIDS_SAC,
  arrondiToupie: 0,
  densiteSable: DEFAULT_DENSITES.sable,
  densiteGravier: DEFAULT_DENSITES.gravier,
}
