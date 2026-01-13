import {
  MaconnerieElement,
  MaconnerieProject,
  ElementResult,
  ProjectTotals,
  DosageConfig,
} from './types'
import { DOSAGE_PRESETS } from './constants'

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
      // Longueur × Largeur × Hauteur (cm → m)
      return element.longueur * element.largeur * (element.hauteur / 100)

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
 * Calcule les matériaux pour un volume donné
 */
export function calculateMaterials(
  volume: number,
  dosage: DosageConfig,
  pertes: number
): { cimentKg: number; sableM3: number; gravierM3: number; eauLitres: number } {
  const absVolume = Math.abs(volume)
  const facteurPertes = 1 + pertes / 100

  // Ciment
  const cimentKg = absVolume * dosage.cimentKgM3 * facteurPertes

  // Granulats calculés par "parts"
  // Environ 70% du volume de béton est composé de granulats
  const totalParts = dosage.sableParts + dosage.gravierParts
  const volumeGranulats = absVolume * 0.7 * facteurPertes

  const sableM3 = (dosage.sableParts / totalParts) * volumeGranulats
  const gravierM3 = (dosage.gravierParts / totalParts) * volumeGranulats

  // Eau
  const eauLitres = absVolume * dosage.eauLitresM3 * facteurPertes

  return { cimentKg, sableM3, gravierM3, eauLitres }
}

/**
 * Calcule le résultat pour un élément
 */
export function calculateElementResult(
  element: MaconnerieElement,
  dosage: DosageConfig,
  pertes: number
): ElementResult {
  const volume = calculateElementVolume(element)
  const surface = calculateElementSurface(element)
  const materials = calculateMaterials(volume, dosage, pertes)

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
    const result = calculateElementResult(element, dosage, project.pertes)
    elementsResults[element.id] = result

    volumeTotal += result.volume
    cimentTotal += result.cimentKg
    sableM3 += result.sableM3
    gravierM3 += result.gravierM3
    eauTotal += result.eauLitres
  }

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
