// Types pour le calculateur maçonnerie

export type ElementType = 'dalle' | 'mur' | 'semelle' | 'poteau' | 'ouverture'
export type FormePoteau = 'rectangulaire' | 'rond'
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
  largeur: number     // mètres
  hauteur: number     // mètres (v1 : centimètres, voir migrateProject)
}

// Ouverture (à déduire)
export interface OuvertureElement extends BaseElement {
  type: 'ouverture'
  largeur: number     // mètres
  hauteur: number     // mètres
  epaisseur: number   // centimètres (épaisseur du mur)
  quantite: number    // nombre d'ouvertures identiques
}

// Poteau (rectangulaire ou rond)
export interface PoteauElement extends BaseElement {
  type: 'poteau'
  forme: FormePoteau
  cote1: number       // centimètres (diamètre si rond)
  cote2: number       // centimètres (ignoré si rond)
  hauteur: number     // mètres
  quantite: number    // nombre de poteaux identiques
}

export type MaconnerieElement = DalleElement | MurElement | SemelleElement | PoteauElement | OuvertureElement

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
  schemaVersion?: number  // absent = v1
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
  forme: FormePoteau
  cote1: string
  cote2: string
}
