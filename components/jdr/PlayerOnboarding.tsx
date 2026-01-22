'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CharacterSheet as CharacterSheetType } from '@/types/jdr'
import { PREGENERATED_CHARACTERS, PLAYER_COLORS } from '@/data/jdr-pregenerated'
import CharacterSheet from './CharacterSheet'

interface Props {
  onComplete: (data: { playerName: string; character: CharacterSheetType }) => void
  usedCharacterIds?: string[] // IDs des personnages déjà pris
  usedColors?: string[] // Couleurs déjà utilisées
}

type Step = 'name' | 'choice' | 'select-pregen' | 'create-new' | 'confirm'

export default function PlayerOnboarding({ onComplete, usedCharacterIds = [], usedColors = [] }: Props) {
  const [step, setStep] = useState<Step>('name')
  const [playerName, setPlayerName] = useState('')
  const [selectedCharacter, setSelectedCharacter] = useState<CharacterSheetType | null>(null)
  const [playerColor, setPlayerColor] = useState(() => {
    // Sélectionner une couleur non utilisée
    const availableColors = PLAYER_COLORS.filter((c) => !usedColors.includes(c))
    return availableColors[0] || PLAYER_COLORS[0]
  })

  // Filtrer les personnages disponibles (non pris par d'autres joueurs)
  const availableCharacters = PREGENERATED_CHARACTERS.filter(
    (c) => !usedCharacterIds.includes(c.id)
  )

  const handleSelectPregen = (character: CharacterSheetType) => {
    // Créer une copie avec nouvelle ID pour ce joueur
    const copy: CharacterSheetType = {
      ...character,
      id: crypto.randomUUID(),
      color: playerColor,
    }
    setSelectedCharacter(copy)
    setStep('confirm')
  }

  const handleCreateNew = (character: CharacterSheetType) => {
    const withColor: CharacterSheetType = {
      ...character,
      color: playerColor,
    }
    setSelectedCharacter(withColor)
    setStep('confirm')
  }

  const handleConfirm = () => {
    if (selectedCharacter && playerName.trim()) {
      onComplete({
        playerName: playerName.trim(),
        character: selectedCharacter,
      })
    }
  }

  const availableColors = PLAYER_COLORS.filter((c) => !usedColors.includes(c))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-neutral-900 rounded-lg shadow-2xl overflow-hidden max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-red-900 via-red-800 to-neutral-900 p-6 border-b-4 border-red-700">
          <h1 className="text-3xl font-black uppercase tracking-wider text-white">
            The Walking Dead
          </h1>
          <p className="text-red-300 text-sm mt-1">Bienvenue, survivant</p>
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">
            {/* ÉTAPE 1: Nom du joueur */}
            {step === 'name' && (
              <motion.div
                key="name"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-xl font-bold text-white mb-2">Comment t'appelles-tu ?</h2>
                  <p className="text-neutral-400 text-sm">
                    Entre ton nom de joueur (pas le nom de ton personnage)
                  </p>
                </div>

                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && playerName.trim() && setStep('choice')}
                  placeholder="Ton prénom ou pseudo..."
                  className="w-full bg-neutral-800 border-2 border-neutral-700 rounded-lg px-4 py-3 text-xl text-white focus:border-red-500 outline-none"
                  autoFocus
                />

                <div>
                  <label className="block text-sm text-neutral-400 mb-2">Ta couleur</label>
                  <div className="flex gap-2 flex-wrap">
                    {PLAYER_COLORS.map((color) => {
                      const isUsed = usedColors.includes(color)
                      return (
                        <button
                          key={color}
                          disabled={isUsed}
                          onClick={() => setPlayerColor(color)}
                          className={`w-10 h-10 rounded-full border-4 transition-all ${
                            playerColor === color
                              ? 'border-white scale-110'
                              : 'border-transparent hover:border-white/50'
                          } ${isUsed ? 'opacity-30 cursor-not-allowed' : ''}`}
                          style={{ backgroundColor: color }}
                          title={isUsed ? 'Déjà prise' : ''}
                        />
                      )
                    })}
                  </div>
                </div>

                <button
                  onClick={() => setStep('choice')}
                  disabled={!playerName.trim()}
                  className="w-full py-3 bg-red-700 hover:bg-red-600 disabled:bg-neutral-700 disabled:cursor-not-allowed text-white rounded-lg font-bold text-lg transition-colors"
                >
                  Continuer
                </button>
              </motion.div>
            )}

            {/* ÉTAPE 2: Choix - Pré-tiré ou création */}
            {step === 'choice' && (
              <motion.div
                key="choice"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-xl font-bold text-white mb-2">
                    Bienvenue, <span className="text-red-500">{playerName}</span>
                  </h2>
                  <p className="text-neutral-400 text-sm">
                    Tu as le choix : utiliser un personnage pré-tiré ou créer le tien
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setStep('select-pregen')}
                    className="p-6 bg-neutral-800 hover:bg-neutral-700 border-2 border-neutral-700 hover:border-red-500 rounded-lg transition-all text-left group"
                  >
                    <div className="text-4xl mb-3">📜</div>
                    <h3 className="text-lg font-bold text-white group-hover:text-red-400">
                      Personnage pré-tiré
                    </h3>
                    <p className="text-sm text-neutral-400 mt-1">
                      Choisis parmi {availableCharacters.length} survivants prêts à jouer
                    </p>
                  </button>

                  <button
                    onClick={() => setStep('create-new')}
                    className="p-6 bg-neutral-800 hover:bg-neutral-700 border-2 border-neutral-700 hover:border-blue-500 rounded-lg transition-all text-left group"
                  >
                    <div className="text-4xl mb-3">✏️</div>
                    <h3 className="text-lg font-bold text-white group-hover:text-blue-400">
                      Créer mon personnage
                    </h3>
                    <p className="text-sm text-neutral-400 mt-1">
                      Remplis ta fiche de personnage personnalisée
                    </p>
                  </button>
                </div>

                <button
                  onClick={() => setStep('name')}
                  className="text-neutral-500 hover:text-white text-sm"
                >
                  ← Retour
                </button>
              </motion.div>
            )}

            {/* ÉTAPE 3A: Sélection pré-tiré */}
            {step === 'select-pregen' && (
              <motion.div
                key="select-pregen"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-white">Choisis ton survivant</h2>
                    <p className="text-neutral-400 text-sm">
                      {availableCharacters.length} personnages disponibles
                    </p>
                  </div>
                  <button
                    onClick={() => setStep('choice')}
                    className="text-neutral-500 hover:text-white text-sm"
                  >
                    ← Retour
                  </button>
                </div>

                <div className="grid gap-3 max-h-[50vh] overflow-y-auto pr-2">
                  {availableCharacters.map((char) => (
                    <button
                      key={char.id}
                      onClick={() => handleSelectPregen(char)}
                      className="p-4 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 hover:border-red-500 rounded-lg transition-all text-left group"
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className="w-14 h-14 rounded-full flex items-center justify-center text-3xl border-2"
                          style={{ borderColor: char.color, backgroundColor: `${char.color}20` }}
                        >
                          {char.avatar}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-white group-hover:text-red-400 truncate">
                            {char.name}
                          </h3>
                          <p className="text-xs text-neutral-500">{char.archetype}</p>
                          <p className="text-sm text-neutral-400 mt-1 line-clamp-2">
                            {char.description.substring(0, 100)}...
                          </p>
                          <div className="flex gap-4 mt-2 text-xs">
                            <span className="text-red-400">VIG {char.attributes.vigueur}</span>
                            <span className="text-blue-400">AGI {char.attributes.agilite}</span>
                            <span className="text-yellow-400">ESP {char.attributes.esprit}</span>
                            <span className="text-green-400">EMP {char.attributes.empathie}</span>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}

                  {availableCharacters.length === 0 && (
                    <div className="text-center py-8 text-neutral-500">
                      Tous les personnages pré-tirés sont déjà pris.
                      <button
                        onClick={() => setStep('create-new')}
                        className="block mx-auto mt-2 text-red-500 hover:text-red-400"
                      >
                        Créer un personnage →
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* ÉTAPE 3B: Création de personnage */}
            {step === 'create-new' && (
              <motion.div
                key="create-new"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white">Crée ton personnage</h2>
                  <button
                    onClick={() => setStep('choice')}
                    className="text-neutral-500 hover:text-white text-sm"
                  >
                    ← Retour
                  </button>
                </div>

                <CharacterSheet
                  onSave={handleCreateNew}
                  onCancel={() => setStep('choice')}
                />
              </motion.div>
            )}

            {/* ÉTAPE 4: Confirmation */}
            {step === 'confirm' && selectedCharacter && (
              <motion.div
                key="confirm"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <div
                    className="w-24 h-24 mx-auto rounded-full flex items-center justify-center text-5xl border-4 mb-4"
                    style={{
                      borderColor: selectedCharacter.color || playerColor,
                      backgroundColor: `${selectedCharacter.color || playerColor}20`,
                    }}
                  >
                    {selectedCharacter.avatar || '👤'}
                  </div>
                  <h2 className="text-2xl font-bold text-white">{selectedCharacter.name}</h2>
                  <p className="text-neutral-400">{selectedCharacter.archetype}</p>
                  <p className="text-sm text-neutral-500 mt-2">
                    Joué par <span className="text-red-400">{playerName}</span>
                  </p>
                </div>

                <div className="bg-neutral-800 rounded-lg p-4">
                  <h3 className="text-sm font-bold text-neutral-400 uppercase mb-2">Résumé</h3>
                  <div className="grid grid-cols-4 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-black text-red-400">
                        {selectedCharacter.attributes.vigueur}
                      </div>
                      <div className="text-xs text-neutral-500">Vigueur</div>
                    </div>
                    <div>
                      <div className="text-2xl font-black text-blue-400">
                        {selectedCharacter.attributes.agilite}
                      </div>
                      <div className="text-xs text-neutral-500">Agilité</div>
                    </div>
                    <div>
                      <div className="text-2xl font-black text-yellow-400">
                        {selectedCharacter.attributes.esprit}
                      </div>
                      <div className="text-xs text-neutral-500">Esprit</div>
                    </div>
                    <div>
                      <div className="text-2xl font-black text-green-400">
                        {selectedCharacter.attributes.empathie}
                      </div>
                      <div className="text-xs text-neutral-500">Empathie</div>
                    </div>
                  </div>

                  {selectedCharacter.talents.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-neutral-700">
                      <h4 className="text-xs font-bold text-neutral-500 uppercase mb-1">Talent</h4>
                      <p className="text-sm text-neutral-300 italic">
                        {selectedCharacter.talents[0]}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep(selectedCharacter.id.startsWith('pregen') ? 'select-pregen' : 'create-new')}
                    className="flex-1 py-3 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg font-bold transition-colors"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={handleConfirm}
                    className="flex-1 py-3 bg-red-700 hover:bg-red-600 text-white rounded-lg font-bold transition-colors"
                  >
                    Rejoindre la partie
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}
