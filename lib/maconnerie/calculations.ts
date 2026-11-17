import {
  MaconnerieElement,
  MaconnerieProject,
  ElementResult,
  ProjectTotals,
  DosageConfig,
} from './types'
import { DOSAGE_PRESETS, DENSITE_BETON_FRAIS, SCHEMA_VERSION } from './constants'

/**
 * Parse une valeur décimale (gère les virgules françaises)
 */
export function parseDecimal(value: string): number {
  if (!value || value.trim() === '') return 0
  const normalized = value.replace(',', '.').trim()
  const parsed = parseFloat(normalized)
  return isNaN(parsed) ? 0 : parsed
}

/**
 * Formate un nombre pour l'affichage (locale française)
 */
export function formatNumber(value: number, decimals: number = 2): string {
  return value.toLocaleString('fr-FR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

/**
 * Génère un ID unique
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

/**
 * Calcule le volume d'un élément (en m³)
 */
export function calculateElementVolume(element: MaconnerieElement): number {
  switch (element.type) {
    case 'dalle':
      // Longueur × Largeur × Épaisseur (cm → m)
      return element.longueur * element.largeur * (element.epaisseur / 100)

    case 'mur':
      // Longueur × Hauteur × Épaisseur (cm → m)
      return element.longueur * element.hauteur * (element.epaisseur / 100)

    case 'semelle':
      // Longueur × Largeur × Hauteur (toutes en mètres)
      return element.longueur * element.largeur * element.hauteur

    case 'poteau': {
      // Section (cm → m) × Hauteur × quantité
      const section = element.forme === 'rond'
        ? Math.PI * (element.cote1 / 200) ** 2
        : (element.cote1 / 100) * (element.cote2 / 100)
      return section * element.hauteur * element.quantite
    }

    case 'ouverture':
      // Volume négatif (à soustraire) × quantité
      return -(element.largeur * element.hauteur * (element.epaisseur / 100) * element.quantite)

    default:
      return 0
  }
}

/**
 * Calcule la surface d'un élément (pour les murs)
 */
export function calculateElementSurface(element: MaconnerieElement): number | undefined {
  if (element.type === 'mur') {
    return element.longueur * element.hauteur
  }
  if (element.type === 'ouverture') {
    return element.largeur * element.hauteur * element.quantite
  }
  return undefined
}

/**
 * Obtient la configuration de dosage active
 */
export function getDosageConfig(project: MaconnerieProject): DosageConfig {
  if (project.dosageType === 'custom') {
    return project.dosageCustom
  }
  return DOSAGE_PRESETS[project.dosageType]
}

/**
 * Calcule les matériaux pour un volume donné.
 * Le volume est signé : une ouverture (volume négatif) déduit aussi ses matériaux.
 *
 * Granulats par bilan de masse : 1 m³ de béton frais pèse ~DENSITE_BETON_FRAIS kg,
 * dont le ciment et l'eau ; le reste est du sable et du gravier, répartis selon
 * les parts en volume (converties en masse via les densités apparentes).
 */
export function calculateMaterials(
  volume: number,
  dosage: DosageConfig,
  pertes: number,
  densiteSable: number,
  densiteGravier: number
): { cimentKg: number; sableM3: number; gravierM3: number; eauLitres: number } {
  const volumeMisEnOeuvre = volume * (1 + pertes / 100)

  const cimentKg = volumeMisEnOeuvre * dosage.cimentKgM3
  const eauLitres = volumeMisEnOeuvre * dosage.eauLitresM3

  // Masse de granulats par m³ (eau : 1 L = 1 kg)
  const granulatsKgM3 = Math.max(0, DENSITE_BETON_FRAIS - dosage.cimentKgM3 - dosage.eauLitresM3)
  const masseSableRel = dosage.sableParts * densiteSable
  const masseGravierRel = dosage.gravierParts * densiteGravier
  const totalRel = masseSableRel + masseGravierRel
  const sableKgM3 = totalRel > 0 ? granulatsKgM3 * masseSableRel / totalRel : 0
  const gravierKgM3 = granulatsKgM3 - sableKgM3

  const sableM3 = volumeMisEnOeuvre * sableKgM3 / densiteSable
  const gravierM3 = volumeMisEnOeuvre * gravierKgM3 / densiteGravier

  return { cimentKg, sableM3, gravierM3, eauLitres }
}

/**
 * Calcule le résultat pour un élément
 */
export function calculateElementResult(
  element: MaconnerieElement,
  dosage: DosageConfig,
  project: Pick<MaconnerieProject, 'pertes' | 'densiteSable' | 'densiteGravier'>
): ElementResult {
  const volume = calculateElementVolume(element)
  const surface = calculateElementSurface(element)
  const materials = calculateMaterials(volume, dosage, project.pertes, project.densiteSable, project.densiteGravier)

  return {
    id: element.id,
    volume,
    surface,
    ...materials,
  }
}

/**
 * Arrondit un volume selon l'option toupie
 */
export function arrondiToupie(volume: number, arrondi: number): number {
  if (arrondi <= 0) return volume
  return Math.ceil(volume / arrondi) * arrondi
}

/**
 * Calcule les totaux du projet
 */
export function calculateProjectTotals(project: MaconnerieProject): ProjectTotals {
  const dosage = getDosageConfig(project)
  const elementsResults: Record<string, ElementResult> = {}

  let volumeTotal = 0
  let cimentTotal = 0
  let sableM3 = 0
  let gravierM3 = 0
  let eauTotal = 0

  // Calculer chaque élément
  for (const element of project.elements) {
    const result = calculateElementResult(element, dosage, project)
    elementsResults[element.id] = result

    volumeTotal += result.volume
    cimentTotal += result.cimentKg
    sableM3 += result.sableM3
    gravierM3 += result.gravierM3
    eauTotal += result.eauLitres
  }

  // Les ouvertures ne peuvent pas rendre un total négatif
  volumeTotal = Math.max(0, volumeTotal)
  cimentTotal = Math.max(0, cimentTotal)
  sableM3 = Math.max(0, sableM3)
  gravierM3 = Math.max(0, gravierM3)
  eauTotal = Math.max(0, eauTotal)

  // Arrondi toupie si activé
  const volumeTotalArrondi = project.arrondiToupie > 0
    ? arrondiToupie(volumeTotal, project.arrondiToupie)
    : undefined

  // Nombre de sacs (recalculé sur le total pour plus de précision)
  const sacsCiment = Math.ceil(cimentTotal / project.poidsSac)

  // Conversion en tonnes
  const sableTonnes = (sableM3 * project.densiteSable) / 1000
  const gravierTonnes = (gravierM3 * project.densiteGravier) / 1000

  return {
    volumeTotal,
    volumeTotalArrondi,
    cimentTotal,
    sacsCiment,
    sableM3,
    sableTonnes,
    gravierM3,
    gravierTonnes,
    eauTotal,
    elements: elementsResults,
  }
}

/**
 * Valide une valeur numérique (positive)
 */
export function validatePositive(value: string): boolean {
  const num = parseDecimal(value)
  return num > 0
}

/**
 * Valide une valeur numérique (positive ou zéro)
 */
export function validateNonNegative(value: string): boolean {
  const num = parseDecimal(value)
  return num >= 0
}

/**
 * Migre un projet sauvegardé ou importé vers le schéma courant.
 * v1 → v2 : la hauteur de semelle était calculée en cm alors que le formulaire
 * la demandait en mètres. Une valeur > 3 est forcément saisie en cm.
 */
export function migrateProject(project: MaconnerieProject): MaconnerieProject {
  if ((project.schemaVersion ?? 1) >= SCHEMA_VERSION) return project
  return {
    ...project,
    schemaVersion: SCHEMA_VERSION,
    elements: project.elements.map(e =>
      e.type === 'semelle' && e.hauteur > 3 ? { ...e, hauteur: e.hauteur / 100 } : e
    ),
  }
}
