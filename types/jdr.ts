// Types pour le JDR The Walking Dead - Year Zero Engine

// ============ ATTRIBUTS & COMPÉTENCES ============

export type AttributeName = 'vigueur' | 'agilite' | 'esprit' | 'empathie'

export type SkillName =
  // Vigueur
  | 'combatRapproche'
  | 'endurance'
  | 'force'
  // Agilité
  | 'combatDistance'
  | 'discretion'
  | 'mobilite'
  // Esprit
  | 'reconnaissance'
  | 'survie'
  | 'technique'
  // Empathie
  | 'commandement'
  | 'manipulation'
  | 'medecine'

export const SKILL_TO_ATTRIBUTE: Record<SkillName, AttributeName> = {
  combatRapproche: 'vigueur',
  endurance: 'vigueur',
  force: 'vigueur',
  combatDistance: 'agilite',
  discretion: 'agilite',
  mobilite: 'agilite',
  reconnaissance: 'esprit',
  survie: 'esprit',
  technique: 'esprit',
  commandement: 'empathie',
  manipulation: 'empathie',
  medecine: 'empathie',
}

export const SKILL_LABELS: Record<SkillName, string> = {
  combatRapproche: 'Combat rapproché',
  endurance: 'Endurance',
  force: 'Force',
  combatDistance: 'Combat à distance',
  discretion: 'Discrétion',
  mobilite: 'Mobilité',
  reconnaissance: 'Reconnaissance',
  survie: 'Survie',
  technique: 'Technique',
  commandement: 'Commandement',
  manipulation: 'Manipulation',
  medecine: 'Médecine',
}

export const ATTRIBUTE_LABELS: Record<AttributeName, string> = {
  vigueur: 'Vigueur',
  agilite: 'Agilité',
  esprit: 'Esprit',
  empathie: 'Empathie',
}

// ============ SANTÉ ============

export type HealthLevel = 3 | 2 | 1 | 0 // 3=Indemne, 2=Contusionné, 1=Malmené, 0=Brisé

export const HEALTH_LABELS: Record<HealthLevel, string> = {
  3: 'Indemne',
  2: 'Contusionné',
  1: 'Malmené',
  0: 'Brisé',
}

// ============ ÉQUIPEMENT ============

export interface Weapon {
  name: string
  damage: number
  bonus: number
  range: 'courte' | 'moyenne' | 'longue' | 'extreme' | '-'
}

export interface Protection {
  name: string
  value: number
  malus: number
}

export interface Equipment {
  name: string
  bonus?: number
}

// ============ FICHE PERSONNAGE ============

export interface CharacterSheet {
  id: string

  // Identité
  name: string
  archetype: string
  description: string

  // Attaches & Motivation
  pjAttache: string
  pnjAttache: string
  motivation: string
  problemes: string
  notes: string

  // Attributs (2-5)
  attributes: Record<AttributeName, number>

  // Compétences (0-5)
  skills: Record<SkillName, number>

  // Talents
  talents: string[]

  // Santé
  health: HealthLevel
  criticalWounds: string[]

  // Stress & XP
  stress: number
  experience: number

  // Encombrement
  maxEncumbrance: number

  // Équipement
  equipment: Equipment[]
  weapons: Weapon[]
  protection: Protection | null
  reserveEquipment: string[]
  tinyObjects: string[]

  // Secret (visible seulement par le joueur et le MJ)
  secret?: string

  // Avatar/apparence pour le token
  avatar?: string
  color?: string
}

// ============ TOKEN SUR LE PLATEAU ============

export interface Token {
  id: string
  x: number
  y: number
  type: 'player' | 'npc' | 'enemy' | 'object'
  name: string
  avatar?: string
  color?: string
  characterId?: string // Lien vers la fiche
  size?: 'small' | 'medium' | 'large'
  visible?: boolean // Pour les tokens cachés (MJ only)
  status?: string[] // Liste des statuts (ex: ['blessé', 'paniqué'])
}

// ============ JOUEUR ============

export interface Player {
  id: string
  name: string
  isGM: boolean
  characterId?: string
  color: string
  lastSeen: number
  isOnline?: boolean
}

// ============ LANCÉ DE DÉS ============

export type DiceType = 'd6' | 'd6Stress'

export interface DiceRoll {
  id: string
  playerId: string
  playerName: string
  timestamp: number

  // Configuration du jet
  attribute?: AttributeName
  skill?: SkillName
  baseDice: number // Nombre de dés de base
  stressDice: number // Nombre de dés de stress
  modifier: number

  // Résultats
  baseResults: number[] // Résultats des dés de base
  stressResults: number[] // Résultats des dés de stress

  // Résumé
  successes: number // Nombre de 6
  traumas: number // Nombre de 1 sur les dés de stress (trauma/panique)
  pushed?: boolean // Si le jet a été poussé

  // Contexte
  description?: string
}

// ============ SCÈNE ============

export interface Scene {
  name: string
  imageUrl: string
  gridEnabled: boolean
  gridSize: number
  zoom: number
  offsetX: number
  offsetY: number
  id?: string // Identifiant interne pour la bibliothèque
}

// ============ PNJ (Panel gauche) ============

export interface NPC {
  id: string
  name: string
  description: string
  stats?: string // Résumé rapide des stats
  threat?: 'low' | 'medium' | 'high' | 'boss'
  imageUrl?: string
  notes?: string
  sheet?: CharacterSheet
}

// ============ DESSINS ============

export interface DrawingPath {
  id: string
  userId: string
  color: string
  width: number
  points: { x: number; y: number }[]
  timestamp: number
}

// ============ ÉTAT DU JEU COMPLET ============

export interface GameState {
  id: string
  createdAt: number
  lastUpdated: number

  // Métadonnées
  title: string
  gmId: string

  // Joueurs & Personnages
  players: Player[]
  characters: CharacterSheet[]

  // Plateau de jeu
  scene: Scene
  tokens: Token[]

  // PNJ du MJ
  npcs: NPC[]

  // Historique des dés
  diceRolls: DiceRoll[]

  // Musique/Ambiance
  currentTrack?: {
    url: string
    name: string
    volume: number
    playing: boolean
  }

  // Chat/Notes partagées (optionnel)
  sharedNotes?: string

  // Bibliothèque de scènes
  sceneLibrary: Scene[]

  // Dessins
  drawings: DrawingPath[]
}

// ============ ACTIONS API ============

export type GameAction =
  | { action: 'UPDATE_TOKENS'; payload: Token[] }
  | { action: 'ROLL_DICE'; payload: Omit<DiceRoll, 'id' | 'timestamp'> }
  | { action: 'UPDATE_SCENE'; payload: Partial<Scene> }
  | { action: 'JOIN_PLAYER'; payload: Player }
  | { action: 'UPDATE_PLAYER'; payload: Player }
  | { action: 'UPDATE_CHARACTER'; payload: CharacterSheet }
  | { action: 'ADD_CHARACTER'; payload: CharacterSheet }
  | { action: 'ADD_NPC'; payload: NPC }
  | { action: 'UPDATE_NPC'; payload: NPC }
  | { action: 'DELETE_NPC'; payload: { id: string } }
  | { action: 'UPDATE_TITLE'; payload: { title: string } }
  | { action: 'UPDATE_MUSIC'; payload: GameState['currentTrack'] }
  | { action: 'UPDATE_SHARED_NOTES'; payload: { notes: string } }
  | { action: 'UPDATE_DRAWINGS'; payload: DrawingPath[] }
  | { action: 'SAVE_SCENE_TO_LIB'; payload: Scene }
  | { action: 'LOAD_SCENE_FROM_LIB'; payload: { id: string } }
  | { action: 'UPDATE_TOKEN_STATUS'; payload: { tokenId: string; status: string[] } }
  | { action: 'PUSH_ROLL'; payload: { rollId: string } }

// ============ HELPERS ============

export function createEmptyCharacter(): CharacterSheet {
  return {
    id: '',
    name: '',
    archetype: '',
    description: '',
    pjAttache: '',
    pnjAttache: '',
    motivation: '',
    problemes: '',
    notes: '',
    attributes: {
      vigueur: 2,
      agilite: 2,
      esprit: 2,
      empathie: 2,
    },
    skills: {
      combatRapproche: 0,
      endurance: 0,
      force: 0,
      combatDistance: 0,
      discretion: 0,
      mobilite: 0,
      reconnaissance: 0,
      survie: 0,
      technique: 0,
      commandement: 0,
      manipulation: 0,
      medecine: 0,
    },
    talents: [],
    health: 3,
    criticalWounds: [],
    stress: 0,
    experience: 0,
    maxEncumbrance: 4,
    equipment: [],
    weapons: [],
    protection: null,
    reserveEquipment: [],
    tinyObjects: [],
  }
}

export function calculateDicePool(
  character: CharacterSheet,
  attribute: AttributeName,
  skill: SkillName
): { baseDice: number; stressDice: number } {
  const attrValue = character.attributes[attribute]
  const skillValue = character.skills[skill]
  return {
    baseDice: attrValue + skillValue,
    stressDice: character.stress,
  }
}

export function countSuccesses(results: number[]): number {
  return results.filter(r => r === 6).length
}

export function countTraumas(stressResults: number[]): number {
  return stressResults.filter(r => r === 1).length
}
