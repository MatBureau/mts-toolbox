// Types pour le calculateur maçonnerie

export type ElementType = 'dalle' | 'mur' | 'semelle' | 'ouverture'
export type DosageType = 'maigre' | 'standard' | 'riche' | 'custom'

// Élément de base
export interface BaseElement {
  id: string
  type: ElementType
  nom: string
  createdAt: string
}

// Dalle / Radier
export interface DalleElement extends BaseElement {
  type: 'dalle'
  longueur: number    // mètres
  largeur: number     // mètres
  epaisseur: number   // centimètres
}

// Mur
export interface MurElement extends BaseElement {
  type: 'mur'
  longueur: number    // mètres
  hauteur: number     // mètres
  epaisseur: number   // centimètres
}

// Semelle filante / Longrine
export interface SemelleElement extends BaseElement {
  type: 'semelle'
  longueur: number    // mètres
  largeur: number     // mètres (ou centimètres selon usage)
  hauteur: number     // centimètres
}

// Ouverture (à déduire)
export interface OuvertureElement extends BaseElement {
  type: 'ouverture'
  largeur: number     // mètres
  hauteur: number     // mètres
  epaisseur: number   // centimètres (épaisseur du mur)
  quantite: number    // nombre d'ouvertures identiques
}

export type MaconnerieElement = DalleElement | MurElement | SemelleElement | OuvertureElement

// Configuration dosage
export interface DosageConfig {
  cimentKgM3: number      // kg de ciment par m³ de béton
  sableParts: number      // parts de sable
  gravierParts: number    // parts de gravier
  eauLitresM3: number     // litres d'eau par m³
}

// Résultat de calcul pour un élément
export interface ElementResult {
  id: string
  volume: number          // m³
  surface?: number        // m² (pour murs)
  cimentKg: number
  sableM3: number
  gravierM3: number
  eauLitres: number
}

// Totaux projet
export interface ProjectTotals {
  volumeTotal: number
  volumeTotalArrondi?: number  // arrondi toupie
  cimentTotal: number
  sacsCiment: number
  sableM3: number
  sableTonnes: number
  gravierM3: number
  gravierTonnes: number
  eauTotal: number
  elements: Record<string, ElementResult>
}

// Projet complet
export interface MaconnerieProject {
  id: string
  nom: string
  elements: MaconnerieElement[]
  // Paramètres dosage
  dosageType: DosageType
  dosageCustom: DosageConfig
  // Paramètres généraux
  pertes: number          // % de pertes (ex: 7)
  poidsSac: number        // kg par sac (25 ou 35)
  arrondiToupie: number   // 0 = pas d'arrondi, 0.25 ou 0.5
  // Densités (modifiables)
  densiteSable: number    // kg/m³
  densiteGravier: number  // kg/m³
  // Timestamps
  createdAt: string
  updatedAt: string
}

// État du formulaire d'ajout
export interface ElementFormState {
  type: ElementType
  nom: string
  longueur: string
  largeur: string
  hauteur: string
  epaisseur: string
  quantite: string
}
