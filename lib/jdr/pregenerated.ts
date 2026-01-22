import { CharacterSheet } from '@/types/jdr'

// Personnages pré-tirés du scénario The Walking Dead
// Basé sur les fiches officielles Free League

export const PREGENERATED_CHARACTERS: CharacterSheet[] = [
  // ============ PJ #1 : CECIL/CECILIA HART ============
  {
    id: 'pregen-cecil',
    name: 'Cecil (M) / Cecilia (F) Hart',
    archetype: 'Leader',
    description:
      'Armoire à glace avec des cheveux mi-longs, bruns et lisses qui encadrent un visage aux yeux étroits et au nez impressionnant. Porte un petit sac à dos et un uniforme militaire usé mais propre, dont la paire de bottes mériterait de nouvelles semelles.',
    pjAttache: 'Blossom (F) / Salomon (M) Singh',
    pnjAttache: '',
    motivation: 'Ne peut pas vivre sans Rebecca',
    problemes: 'À deux doigts de la dépression nerveuse',
    notes: '',
    secret:
      'Tu vas tuer Matthew dès que tu le verras.',
    attributes: {
      vigueur: 4,
      agilite: 4,
      esprit: 2,
      empathie: 3,
    },
    skills: {
      combatRapproche: 2,
      endurance: 0,
      force: 0,
      combatDistance: 3,
      discretion: 1,
      mobilite: 1,
      reconnaissance: 2,
      survie: 1,
      technique: 0,
      commandement: 2,
      manipulation: 0,
      medecine: 0,
    },
    talents: ['Les yeux sur la cible (tu te soulages de 1 point de stress chaque fois qu\'une menace ou un ennemi est vaincu ou surmonté)'],
    health: 3,
    criticalWounds: [],
    stress: 0,
    experience: 0,
    maxEncumbrance: 6,
    equipment: [
      { name: 'Jumelles' },
    ],
    weapons: [
      { name: 'Revolver', damage: 2, bonus: 2, range: 'courte' },
      { name: 'Couteau', damage: 1, bonus: 2, range: '-' },
    ],
    protection: null,
    reserveEquipment: [],
    tinyObjects: ['Médaillon avec photo de ta mère, Mina, enfant'],
    avatar: '🎖️',
    color: '#8B4513',
  },

  // ============ PJ #2 : ALLY/ISAAC IBRAHIM ============
  {
    id: 'pregen-ally',
    name: 'Ally (F) / Isaac (M) Ibrahim',
    archetype: 'Médecin',
    description:
      'Cheveux gominés, courts et grisonnants qui accentuent de grands yeux marron et des pommettes prononcées. Le jean et la chemise ont beau être sales, ce sont des vêtements de marque de qualité, tout comme la veste de sport froissée sous le long manteau de laine.',
    pjAttache: 'Bonnie (F) / Rooster (M) Coates',
    pnjAttache: '',
    motivation: 'Matthew est mon seul ami',
    problemes: 'Ils ne t\'arrivent pas à la cheville',
    notes: '',
    secret:
      'Tu comptes abandonner le groupe de Cecil/Cecilia pour rejoindre Matthew et Rebecca, où qu\'ils aillent.',
    attributes: {
      vigueur: 2,
      agilite: 3,
      esprit: 5,
      empathie: 3,
    },
    skills: {
      combatRapproche: 1,
      endurance: 0,
      force: 0,
      combatDistance: 1,
      discretion: 2,
      mobilite: 0,
      reconnaissance: 1,
      survie: 2,
      technique: 0,
      commandement: 0,
      manipulation: 2,
      medecine: 3,
    },
    talents: ['Blasé (tu ne subis pas de stress lorsque tu vois quelqu\'un se faire blesser, tourmenter ou même Briser)'],
    health: 3,
    criticalWounds: [],
    stress: 0,
    experience: 0,
    maxEncumbrance: 4,
    equipment: [
      { name: 'Hache' },
    ],
    weapons: [
      { name: 'Hache', damage: 1, bonus: 2, range: '-' },
    ],
    protection: null,
    reserveEquipment: [],
    tinyObjects: [
      'Paquet de cigarettes',
      'Briquet',
      'Lunettes de soleil',
      'Peigne en acier',
      'Gel coiffant',
    ],
    avatar: '🩺',
    color: '#4169E1',
  },

  // ============ PJ #3 : BLOSSOM/SALOMON SINGH ============
  {
    id: 'pregen-blossom',
    name: 'Blossom (F) / Salomon (M) Singh',
    archetype: 'Chasseur',
    description:
      'De petite taille, maigre, crâne rasé et visage de fouine toujours caché par la grande capuche d\'une veste d\'un violet délavé. Baggy au motif de camouflage, baskets rembourrées et petites mitaines en cuir fin… des vêtements qui ne te gênent pas pour chasser.',
    pjAttache: 'Cecil (M) / Cecilia (F) Hart',
    pnjAttache: '',
    motivation: 'Tu n\'abandonnes jamais',
    problemes: 'Tu te sacrifies trop',
    notes: '',
    secret:
      'Tu prévois de récupérer ce qu\'ils t\'ont volé (notamment ton fusil), puis d\'exiger qu\'on les bannisse du groupe.',
    attributes: {
      vigueur: 3,
      agilite: 4,
      esprit: 3,
      empathie: 3,
    },
    skills: {
      combatRapproche: 2,
      endurance: 0,
      force: 1,
      combatDistance: 3,
      discretion: 2,
      mobilite: 1,
      reconnaissance: 2,
      survie: 2,
      technique: 0,
      commandement: 0,
      manipulation: 0,
      medecine: 0,
    },
    talents: ['Récupératrice (lorsque tu effectues un test de Survie pour fouiller une zone, tu trouves +2 rations par réussite excédentaire, au lieu de +1)'],
    health: 3,
    criticalWounds: [],
    stress: 0,
    experience: 0,
    maxEncumbrance: 5,
    equipment: [
      { name: 'Revolver' },
      { name: 'Couteau' },
      { name: 'Deux serviettes propres' },
    ],
    weapons: [
      { name: 'Revolver', damage: 2, bonus: 2, range: 'courte' },
      { name: 'Couteau', damage: 1, bonus: 2, range: '-' },
    ],
    protection: null,
    reserveEquipment: [],
    tinyObjects: [
      'Ouvre-boîte',
      'Cinq paquets de chewing-gum à la fraise',
    ],
    avatar: '🏹',
    color: '#9400D3',
  },

  // ============ PJ #4 : TERRI/TERRY LEE ============
  {
    id: 'pregen-terri',
    name: 'Terri (F) / Terry (M) Lee',
    archetype: 'Éclaireur',
    description:
      'Tu es moins jeune qu\'il n\'y paraît, avec ton visage rond constellé de taches de rousseur et cette chevelure en pagaille que recouvre une casquette de base-ball miteuse. Le cure-dents constamment calé entre tes lèvres, le pantalon de survêt rapiécé et le blouson de football d\'une équipe de fac, trop grand, que tu as trouvé il y a quelques semaines n\'aident sans doute pas.',
    pjAttache: 'Bonnie (F) / Rooster (M) Coates',
    pnjAttache: '',
    motivation: 'Tu aimes ta mère',
    problemes: 'Incapable de s\'asseoir et de la boucler',
    notes: '',
    secret:
      'Tu veux juste voir ta mère heureuse, donc tu prévois de l\'aider, elle et Matthew. Tu sais que Cecil/Cecilia t\'aime comme si tu étais son enfant ; néanmoins, si Cecil/Cecilia s\'en prend à Rebecca ou à Matthew, tu n\'hésiteras pas à l\'arrêter, quoi qu\'il en coûte. Même si ça doit te fendre le cœur.',
    attributes: {
      vigueur: 2,
      agilite: 5,
      esprit: 3,
      empathie: 3,
    },
    skills: {
      combatRapproche: 2,
      endurance: 1,
      force: 0,
      combatDistance: 0,
      discretion: 2,
      mobilite: 3,
      reconnaissance: 2,
      survie: 2,
      technique: 0,
      commandement: 0,
      manipulation: 0,
      medecine: 0,
    },
    talents: ['Un enfant de ce monde (tu ne subis pas de stress quand tu vois quelqu\'un se faire mordre)'],
    health: 3,
    criticalWounds: [],
    stress: 0,
    experience: 0,
    maxEncumbrance: 4,
    equipment: [
      { name: 'Couteau' },
      { name: 'Dix hurleurs (des feux d\'artifice)' },
    ],
    weapons: [
      { name: 'Couteau', damage: 1, bonus: 2, range: '-' },
    ],
    protection: null,
    reserveEquipment: [],
    tinyObjects: ['Harmonica'],
    avatar: '🧢',
    color: '#FF6347',
  },

  // ============ PJ #5 : BONNIE/ROOSTER COATES ============
  {
    id: 'pregen-bonnie',
    name: 'Bonnie (F) / Rooster (M) Coates',
    archetype: 'Mécanicien / Homme de foi',
    description:
      'Tes yeux bleus percent un visage chaque jour plus ridé. Ta chevelure clairsemée est presque blanche, désormais, tandis que ta chemise et ta parka jadis blanches ont jauni. Ton pantalon, lui, est taché. Mais tu as un joli sac à dos, de bonnes bottes et des gants épais, ce qui est une excellente chose, puisque tes mains et tes pieds sont toujours gelés.',
    pjAttache: 'Terri (F) / Terry (M) Lee',
    pnjAttache: '',
    motivation: 'Dieu compte sur moi pour sauver leurs âmes',
    problemes: 'Toute vie humaine est sacrée',
    notes: '',
    secret:
      'Tu as aidé les fugitifs à quitter le refuge en douce, mais seulement parce que Matthew t\'a avoué la grossesse de Rebecca. Maintenant, tu commences à douter de cette version.',
    attributes: {
      vigueur: 3,
      agilite: 3,
      esprit: 3,
      empathie: 4,
    },
    skills: {
      combatRapproche: 1,
      endurance: 2,
      force: 0,
      combatDistance: 2,
      discretion: 0,
      mobilite: 1,
      reconnaissance: 1,
      survie: 1,
      technique: 2,
      commandement: 2,
      manipulation: 0,
      medecine: 0,
    },
    talents: ['Fondue de vitesse (tu obtiens +2 quand tu utilises la Mobilité pour conduire un véhicule)'],
    health: 3,
    criticalWounds: [],
    stress: 0,
    experience: 0,
    maxEncumbrance: 5,
    equipment: [
      { name: 'Revolver' },
      { name: 'Marteau' },
      { name: 'Lampe-torche' },
      { name: 'Outils (dans le sac à dos)' },
      { name: 'Pied-de-biche' },
      { name: 'Bible' },
    ],
    weapons: [
      { name: 'Revolver', damage: 2, bonus: 2, range: 'courte' },
      { name: 'Marteau', damage: 1, bonus: 1, range: '-' },
    ],
    protection: null,
    reserveEquipment: [],
    tinyObjects: [],
    avatar: '✝️',
    color: '#F5F5DC',
  },

  // ============ PNJ : LISA HARLEY ============
  {
    id: 'pregen-lisa',
    name: 'Lisa Harley',
    archetype: 'PNJ - Survivante',
    description:
      'Un joli visage si l\'on fait fi des deux cicatrices qui le parcourent. La première traverse l\'œil gauche, la seconde descend de l\'oreille droite jusqu\'au menton. Le bombers, le jean étroit et élastique et les bottes montantes font autant partie de toi que les cicatrices. Ou la bouteille de bourbon.',
    pjAttache: 'Cecil (M) / Cecilia (F) Hart',
    pnjAttache: '',
    motivation: 'On va mourir si l\'on ne récupère pas ce qu\'ils ont volé',
    problemes: 'Honteuse de son passé',
    notes: '',
    secret: '',
    attributes: {
      vigueur: 4,
      agilite: 4,
      esprit: 3,
      empathie: 2,
    },
    skills: {
      combatRapproche: 2,
      endurance: 1,
      force: 1,
      combatDistance: 1,
      discretion: 2,
      mobilite: 1,
      reconnaissance: 2,
      survie: 1,
      technique: 0,
      commandement: 0,
      manipulation: 1,
      medecine: 0,
    },
    talents: ['Coups bas (tu infliges +1 point de dégâts quand tu te bats à mains nues)'],
    health: 3,
    criticalWounds: [],
    stress: 0,
    experience: 0,
    maxEncumbrance: 6,
    equipment: [
      { name: 'Couteau' },
      { name: 'Petite bouteille de bourbon' },
    ],
    weapons: [
      { name: 'Couteau', damage: 1, bonus: 2, range: '-' },
    ],
    protection: null,
    reserveEquipment: [],
    tinyObjects: ['Lime à ongles'],
    avatar: '🥃',
    color: '#8B0000',
  },
]

// Couleurs disponibles pour les joueurs
export const PLAYER_COLORS = [
  '#E53935', // Rouge
  '#1E88E5', // Bleu
  '#43A047', // Vert
  '#FB8C00', // Orange
  '#8E24AA', // Violet
  '#00ACC1', // Cyan
  '#FFB300', // Jaune
  '#6D4C41', // Marron
  '#546E7A', // Gris bleu
  '#D81B60', // Rose
]

// Avatars disponibles
export const AVATAR_OPTIONS = [
  '👤', '👨', '👩', '🧔', '👴', '👵',
  '🎖️', '🩺', '🏹', '🧢', '✝️', '🥃',
  '🔫', '🗡️', '🛡️', '🎒', '🔦', '🔧',
  '💀', '🧟', '🐕', '🚗', '🏚️', '⛺',
]
