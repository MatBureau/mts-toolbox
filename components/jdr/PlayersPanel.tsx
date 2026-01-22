'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Player, CharacterSheet as CharacterSheetType, HealthLevel, HEALTH_LABELS } from '@/types/jdr'

interface Props {
  players: Player[]
  characters: CharacterSheetType[]
  currentPlayerId: string
  isGM: boolean
  onViewCharacter?: (character: CharacterSheetType) => void
  onRollDice?: () => void
}

function PlayerCard({
  player,
  character,
  isCurrentPlayer,
  isGM,
  onViewCharacter,
}: {
  player: Player
  character?: CharacterSheetType
  isCurrentPlayer: boolean
  isGM: boolean
  onViewCharacter?: () => void
}) {
  const isOnline = Date.now() - player.lastSeen < 10000 // Considéré en ligne si vu dans les 10s

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      onClick={onViewCharacter}
      className={`p-3 rounded-lg border-2 transition-all cursor-pointer
        ${isCurrentPlayer ? 'border-white bg-neutral-800' : 'border-neutral-700 bg-neutral-800/50'}
        hover:bg-neutral-700/50 hover:border-neutral-500`}
    >
      {/* Avatar */}
      <div className="flex flex-col items-center gap-2">
        <div className="relative">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-2xl border-3"
            style={{
              borderColor: character?.color || player.color,
              backgroundColor: `${character?.color || player.color}30`,
            }}
          >
            {character?.avatar || '👤'}
          </div>
          {/* Indicateur en ligne */}
          <div
            className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-neutral-900 ${
              isOnline ? 'bg-green-500' : 'bg-neutral-600'
            }`}
            title={isOnline ? 'En ligne' : 'Hors ligne'}
          />
        </div>

        {/* Nom du personnage */}
        <div className="text-center">
          <div className="font-bold text-white text-sm truncate max-w-[100px]">
            {character?.name?.split('/')[0] || 'Sans nom'}
          </div>
          <div className="text-[10px] text-neutral-500 truncate max-w-[100px]">
            {player.name}
          </div>
        </div>

        {/* Stats rapides */}
        {character && (
          <div className="w-full space-y-1">
            {/* Santé */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-500">Santé</span>
              <span
                className={`font-bold ${
                  character.health === 3
                    ? 'text-green-400'
                    : character.health === 2
                    ? 'text-yellow-400'
                    : character.health === 1
                    ? 'text-orange-400'
                    : 'text-red-400'
                }`}
              >
                {HEALTH_LABELS[character.health as HealthLevel]}
              </span>
            </div>

            {/* Stress */}
            {character.stress > 0 && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-500">Stress</span>
                <span className="font-bold text-yellow-400">{character.stress}</span>
              </div>
            )}

            {/* Barre de santé visuelle */}
            <div className="flex gap-1 mt-1">
              {[3, 2, 1, 0].map((level) => (
                <div
                  key={level}
                  className={`flex-1 h-1 rounded-full ${
                    character.health >= level
                      ? level === 3
                        ? 'bg-green-500'
                        : level === 2
                        ? 'bg-yellow-500'
                        : level === 1
                        ? 'bg-orange-500'
                        : 'bg-red-500'
                      : 'bg-neutral-700'
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Badge MJ */}
        {player.isGM && (
          <div className="px-2 py-0.5 bg-red-700 rounded text-[10px] font-bold uppercase">
            MJ
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default function PlayersPanel({
  players,
  characters,
  currentPlayerId,
  isGM,
  onViewCharacter,
  onRollDice,
}: Props) {
  const getCharacterForPlayer = (playerId: string) => {
    const player = players.find((p) => p.id === playerId)
    if (!player?.characterId) return undefined
    return characters.find((c) => c.id === player.characterId)
  }

  // Séparer MJ et joueurs
  const gm = players.find((p) => p.isGM)
  const regularPlayers = players.filter((p) => !p.isGM)

  return (
    <div className="w-32 bg-neutral-900 border-l border-neutral-800 flex flex-col h-full">
      {/* Header */}
      <div className="p-2 border-b border-neutral-800">
        <h2 className="font-bold text-red-500 uppercase tracking-widest text-[10px] text-center">
          Joueurs
        </h2>
        <div className="text-center text-neutral-500 text-xs mt-1">
          {players.filter((p) => Date.now() - p.lastSeen < 10000).length}/{players.length} en ligne
        </div>
      </div>

      {/* Liste des joueurs */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {/* MJ en premier si existe */}
        {gm && (
          <PlayerCard
            player={gm}
            character={getCharacterForPlayer(gm.id)}
            isCurrentPlayer={gm.id === currentPlayerId}
            isGM={true}
            onViewCharacter={() => {
              const char = getCharacterForPlayer(gm.id)
              if (char) onViewCharacter?.(char)
            }}
          />
        )}

        {/* Séparateur */}
        {gm && regularPlayers.length > 0 && (
          <div className="border-t border-neutral-700 my-2" />
        )}

        {/* Autres joueurs */}
        <AnimatePresence>
          {regularPlayers.map((player) => (
            <PlayerCard
              key={player.id}
              player={player}
              character={getCharacterForPlayer(player.id)}
              isCurrentPlayer={player.id === currentPlayerId}
              isGM={isGM}
              onViewCharacter={() => {
                const char = getCharacterForPlayer(player.id)
                if (char) onViewCharacter?.(char)
              }}
            />
          ))}
        </AnimatePresence>

        {players.length === 0 && (
          <div className="text-center py-4 text-neutral-600 text-xs">
            En attente de joueurs...
          </div>
        )}
      </div>

      {/* Barre d'outils en bas */}
      <div className="border-t border-neutral-800 p-2 space-y-2">
        {/* Bouton dés */}
        <button
          onClick={onRollDice}
          className="w-full py-3 bg-red-700 hover:bg-red-600 rounded-lg flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95"
          title="Lancer les dés"
        >
          <span className="text-2xl">🎲</span>
        </button>

        {/* Indicateur rôle */}
        <div
          className="w-full py-2 rounded-lg flex items-center justify-center text-sm font-bold"
          style={{
            backgroundColor: isGM ? '#991b1b' : '#1e3a5f',
          }}
        >
          {isGM ? 'MJ' : 'PJ'}
        </div>
      </div>
    </div>
  )
}
