'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { DiceRoll, AttributeName, SkillName, ATTRIBUTE_LABELS, SKILL_LABELS, SKILL_TO_ATTRIBUTE } from '@/types/jdr'
import RealisticDice from './RealisticDice'

interface Props {
  isOpen: boolean
  onClose: () => void
  onRoll: (roll: Omit<DiceRoll, 'id' | 'timestamp'>) => void
  playerName: string
  playerId: string
  characterAttributes?: Record<AttributeName, number>
  characterSkills?: Record<SkillName, number>
  stress?: number
}

// Composant 3D Dice avec CSS
function Dice3D({
  result,
  isRolling,
  isStressDie,
  delay = 0,
}: {
  result: number
  isRolling: boolean
  isStressDie?: boolean
  delay?: number
}) {
  const [rotation, setRotation] = useState({ x: 0, y: 0, z: 0 })

  useEffect(() => {
    if (isRolling) {
      // Animation de rotation pendant le lancer
      const interval = setInterval(() => {
        setRotation({
          x: Math.random() * 720 - 360,
          y: Math.random() * 720 - 360,
          z: Math.random() * 360,
        })
      }, 100)
      return () => clearInterval(interval)
    } else {
      // Rotation finale basée sur le résultat
      const finalRotations: Record<number, { x: number; y: number }> = {
        1: { x: 0, y: 0 },
        2: { x: 0, y: 90 },
        3: { x: -90, y: 0 },
        4: { x: 90, y: 0 },
        5: { x: 0, y: -90 },
        6: { x: 180, y: 0 },
      }
      const final = finalRotations[result] || { x: 0, y: 0 }
      setRotation({ x: final.x, y: final.y, z: 0 })
    }
  }, [isRolling, result])

  const faceContent = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅']

  return (
    <motion.div
      initial={{ scale: 0, rotateZ: -180 }}
      animate={{ scale: 1, rotateZ: 0 }}
      transition={{ delay, type: 'spring', stiffness: 200 }}
      className="relative w-16 h-16 perspective-[600px]"
      style={{ transformStyle: 'preserve-3d' }}
    >
      <div
        className={`w-full h-full transition-transform duration-500 ${
          isRolling ? 'duration-100' : 'duration-700'
        }`}
        style={{
          transformStyle: 'preserve-3d',
          transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) rotateZ(${rotation.z}deg)`,
        }}
      >
        {/* Face 1 - Front */}
        <div
          className={`absolute inset-0 flex items-center justify-center text-4xl font-bold rounded-lg border-2 ${
            isStressDie
              ? 'bg-gradient-to-br from-yellow-600 to-yellow-800 border-yellow-500 text-black'
              : 'bg-gradient-to-br from-neutral-700 to-neutral-900 border-neutral-500 text-white'
          }`}
          style={{ transform: 'translateZ(32px)' }}
        >
          {faceContent[0]}
        </div>
        {/* Face 6 - Back */}
        <div
          className={`absolute inset-0 flex items-center justify-center text-4xl font-bold rounded-lg border-2 ${
            isStressDie
              ? 'bg-gradient-to-br from-yellow-600 to-yellow-800 border-yellow-500 text-black'
              : 'bg-gradient-to-br from-neutral-700 to-neutral-900 border-neutral-500 text-white'
          }`}
          style={{ transform: 'translateZ(-32px) rotateY(180deg)' }}
        >
          {faceContent[5]}
        </div>
        {/* Face 2 - Right */}
        <div
          className={`absolute inset-0 flex items-center justify-center text-4xl font-bold rounded-lg border-2 ${
            isStressDie
              ? 'bg-gradient-to-br from-yellow-600 to-yellow-800 border-yellow-500 text-black'
              : 'bg-gradient-to-br from-neutral-700 to-neutral-900 border-neutral-500 text-white'
          }`}
          style={{ transform: 'rotateY(90deg) translateZ(32px)' }}
        >
          {faceContent[1]}
        </div>
        {/* Face 5 - Left */}
        <div
          className={`absolute inset-0 flex items-center justify-center text-4xl font-bold rounded-lg border-2 ${
            isStressDie
              ? 'bg-gradient-to-br from-yellow-600 to-yellow-800 border-yellow-500 text-black'
              : 'bg-gradient-to-br from-neutral-700 to-neutral-900 border-neutral-500 text-white'
          }`}
          style={{ transform: 'rotateY(-90deg) translateZ(32px)' }}
        >
          {faceContent[4]}
        </div>
        {/* Face 3 - Top */}
        <div
          className={`absolute inset-0 flex items-center justify-center text-4xl font-bold rounded-lg border-2 ${
            isStressDie
              ? 'bg-gradient-to-br from-yellow-600 to-yellow-800 border-yellow-500 text-black'
              : 'bg-gradient-to-br from-neutral-700 to-neutral-900 border-neutral-500 text-white'
          }`}
          style={{ transform: 'rotateX(90deg) translateZ(32px)' }}
        >
          {faceContent[2]}
        </div>
        {/* Face 4 - Bottom */}
        <div
          className={`absolute inset-0 flex items-center justify-center text-4xl font-bold rounded-lg border-2 ${
            isStressDie
              ? 'bg-gradient-to-br from-yellow-600 to-yellow-800 border-yellow-500 text-black'
              : 'bg-gradient-to-br from-neutral-700 to-neutral-900 border-neutral-500 text-white'
          }`}
          style={{ transform: 'rotateX(-90deg) translateZ(32px)' }}
        >
          {faceContent[3]}
        </div>
      </div>

      {/* Résultat overlay */}
      {!isRolling && (
        <motion.div
          initial={{ opacity: 0, scale: 1.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className={`absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-sm font-black border-2 ${
            result === 6
              ? 'bg-green-500 border-green-300 text-white'
              : result === 1 && isStressDie
              ? 'bg-red-500 border-red-300 text-white'
              : 'bg-neutral-600 border-neutral-400 text-white'
          }`}
        >
          {result}
        </motion.div>
      )}
    </motion.div>
  )
}

export default function DiceRoller({
  isOpen,
  onClose,
  onRoll,
  playerName,
  playerId,
  characterAttributes,
  characterSkills,
  stress = 0,
}: Props) {
  const [mode, setMode] = useState<'quick' | 'skill'>('quick')
  const [baseDice, setBaseDice] = useState(1)
  const [stressDice, setStressDice] = useState(0)
  const [modifier, setModifier] = useState(0)
  const [selectedAttribute, setSelectedAttribute] = useState<AttributeName | null>(null)
  const [selectedSkill, setSelectedSkill] = useState<SkillName | null>(null)
  const [description, setDescription] = useState('')

  const [isRolling, setIsRolling] = useState(false)
  const [results, setResults] = useState<{ base: number[]; stress: number[] } | null>(null)
  const [pendingRoll, setPendingRoll] = useState<Omit<DiceRoll, 'id' | 'timestamp'> | null>(null)

  // Calcul auto des dés basé sur attribut + compétence
  useEffect(() => {
    if (mode === 'skill' && selectedSkill && characterAttributes && characterSkills) {
      const attr = SKILL_TO_ATTRIBUTE[selectedSkill]
      const attrValue = characterAttributes[attr] || 2
      const skillValue = characterSkills[selectedSkill] || 0
      setBaseDice(attrValue + skillValue)
      setSelectedAttribute(attr)
    }
  }, [selectedSkill, mode, characterAttributes, characterSkills])

  // Utiliser le stress du personnage
  useEffect(() => {
    setStressDice(stress)
  }, [stress])

  const rollDice = useCallback((count: number): number[] => {
    return Array.from({ length: count }, () => Math.floor(Math.random() * 6) + 1)
  }, [])

  const handleRoll = () => {
    const bResults = rollDice(baseDice)
    const sResults = rollDice(stressDice)

    setResults({ base: bResults, stress: sResults })
    setIsRolling(true)

    // Compter succès et traumas
    const successes = [...bResults, ...sResults].filter((r) => r === 6).length
    const traumas = sResults.filter((r) => r === 1).length

    setPendingRoll({
      playerId,
      playerName,
      attribute: selectedAttribute || undefined,
      skill: selectedSkill || undefined,
      baseDice,
      stressDice,
      modifier,
      baseResults: bResults,
      stressResults: sResults,
      successes,
      traumas,
      description: description || undefined,
    })
  }

  const handleAnimationFinished = () => {
    if (!isRolling || !pendingRoll) return
    
    setIsRolling(false)
    onRoll(pendingRoll)
    setPendingRoll(null)
  }

  const totalSuccesses = results
    ? [...results.base, ...results.stress].filter((r) => r === 6).length
    : 0
  const totalTraumas = results ? results.stress.filter((r) => r === 1).length : 0

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-neutral-900 rounded-xl shadow-2xl overflow-hidden max-w-2xl w-full border border-neutral-700"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-red-900 to-neutral-900 p-4 flex items-center justify-between">
              <h2 className="text-xl font-black uppercase tracking-wider">Lancer de dés</h2>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Mode Toggle */}
              <div className="flex gap-2">
                <button
                  onClick={() => setMode('quick')}
                  className={`flex-1 py-2 rounded font-bold transition-all ${
                    mode === 'quick'
                      ? 'bg-red-700 text-white'
                      : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
                  }`}
                >
                  Rapide
                </button>
                <button
                  onClick={() => setMode('skill')}
                  className={`flex-1 py-2 rounded font-bold transition-all ${
                    mode === 'skill'
                      ? 'bg-red-700 text-white'
                      : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
                  }`}
                >
                  Compétence
                </button>
              </div>

              {/* Configuration */}
              {mode === 'quick' ? (
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs uppercase text-neutral-500 mb-2">
                      Dés de base
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setBaseDice(Math.max(1, baseDice - 1))}
                        className="w-10 h-10 bg-neutral-800 hover:bg-neutral-700 rounded text-xl"
                      >
                        -
                      </button>
                      <div className="w-12 h-10 bg-neutral-700 rounded flex items-center justify-center text-xl font-bold">
                        {baseDice}
                      </div>
                      <button
                        onClick={() => setBaseDice(Math.min(10, baseDice + 1))}
                        className="w-10 h-10 bg-neutral-800 hover:bg-neutral-700 rounded text-xl"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs uppercase text-yellow-500 mb-2">
                      Dés de stress
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setStressDice(Math.max(0, stressDice - 1))}
                        className="w-10 h-10 bg-yellow-900/50 hover:bg-yellow-800/50 rounded text-xl text-yellow-400"
                      >
                        -
                      </button>
                      <div className="w-12 h-10 bg-yellow-900/30 border border-yellow-700 rounded flex items-center justify-center text-xl font-bold text-yellow-400">
                        {stressDice}
                      </div>
                      <button
                        onClick={() => setStressDice(Math.min(10, stressDice + 1))}
                        className="w-10 h-10 bg-yellow-900/50 hover:bg-yellow-800/50 rounded text-xl text-yellow-400"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs uppercase text-neutral-500 mb-2">
                      Modificateur
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setModifier(modifier - 1)}
                        className="w-10 h-10 bg-neutral-800 hover:bg-neutral-700 rounded text-xl"
                      >
                        -
                      </button>
                      <div className="w-12 h-10 bg-neutral-700 rounded flex items-center justify-center text-xl font-bold">
                        {modifier >= 0 ? `+${modifier}` : modifier}
                      </div>
                      <button
                        onClick={() => setModifier(modifier + 1)}
                        className="w-10 h-10 bg-neutral-800 hover:bg-neutral-700 rounded text-xl"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs uppercase text-neutral-500 mb-2">
                      Compétence
                    </label>
                    <select
                      value={selectedSkill || ''}
                      onChange={(e) => setSelectedSkill(e.target.value as SkillName)}
                      className="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-white focus:border-red-500 outline-none"
                    >
                      <option value="">Choisir une compétence...</option>
                      {Object.entries(SKILL_LABELS).map(([key, label]) => (
                        <option key={key} value={key}>
                          {label} ({ATTRIBUTE_LABELS[SKILL_TO_ATTRIBUTE[key as SkillName]]})
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedSkill && characterAttributes && characterSkills && (
                    <div className="bg-neutral-800 rounded p-3 flex items-center justify-between">
                      <div>
                        <span className="text-neutral-400">
                          {ATTRIBUTE_LABELS[SKILL_TO_ATTRIBUTE[selectedSkill]]}
                        </span>
                        <span className="mx-2 text-neutral-600">+</span>
                        <span className="text-neutral-400">{SKILL_LABELS[selectedSkill]}</span>
                      </div>
                      <div className="text-2xl font-black text-red-400">
                        {baseDice}d6 {stressDice > 0 && `+ ${stressDice}d6 stress`}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Description optionnelle */}
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description du jet (optionnel)..."
                className="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-white focus:border-red-500 outline-none text-sm"
              />

              {/* Zone de dés */}
              <div className="min-h-[250px] bg-neutral-800/50 rounded-lg p-4 flex flex-col items-center justify-center">
                {isRolling || results ? (
                  <RealisticDice 
                    results={results || { base: Array(baseDice).fill(0), stress: Array(stressDice).fill(0) }} 
                    isRolling={isRolling} 
                    onFinished={handleAnimationFinished}
                  />
                ) : (
                  <div className="text-neutral-500 text-center">
                    <div className="text-4xl mb-2">🎲</div>
                    <div>
                      {baseDice}d6{stressDice > 0 && ` + ${stressDice}d6 stress`}
                    </div>
                  </div>
                )}
              </div>

              {/* Résultats */}
              {results && !isRolling && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-neutral-800 rounded-lg p-4"
                >
                  <div className="flex items-center justify-around text-center">
                    <div>
                      <div className="text-4xl font-black text-green-400">{totalSuccesses}</div>
                      <div className="text-xs uppercase text-neutral-500">Succès</div>
                    </div>
                    {stressDice > 0 && (
                      <div>
                        <div
                          className={`text-4xl font-black ${
                            totalTraumas > 0 ? 'text-red-400' : 'text-neutral-500'
                          }`}
                        >
                          {totalTraumas}
                        </div>
                        <div className="text-xs uppercase text-neutral-500">Traumas</div>
                      </div>
                    )}
                  </div>

                  {/* Message de résultat */}
                  <div className="mt-4 text-center">
                    {totalSuccesses === 0 ? (
                      <p className="text-red-400 font-bold">Échec !</p>
                    ) : totalSuccesses >= 3 ? (
                      <p className="text-green-400 font-bold">Succès critique !</p>
                    ) : (
                      <p className="text-green-400 font-bold">Succès !</p>
                    )}
                    {totalTraumas > 0 && (
                      <p className="text-yellow-400 text-sm mt-1">
                        ⚠️ {totalTraumas} trauma{totalTraumas > 1 && 's'} - Risque de panique !
                      </p>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Bouton de lancer */}
              <button
                onClick={handleRoll}
                disabled={isRolling || baseDice + stressDice === 0}
                className="w-full py-4 bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 disabled:from-neutral-700 disabled:to-neutral-600 rounded-lg font-black text-xl uppercase tracking-wider transition-all hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed"
              >
                {isRolling ? 'Lancer en cours...' : results ? 'Relancer' : 'Lancer les dés'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
