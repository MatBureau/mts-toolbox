'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

// Types
import {
  GameState,
  Player,
  CharacterSheet as CharacterSheetType,
  Token,
  NPC,
  DiceRoll,
  Scene,
} from '@/types/jdr'

// Components
import CharacterSheet from '@/components/jdr/CharacterSheet'
import PlayerOnboarding from '@/components/jdr/PlayerOnboarding'
import NPCPanel from '@/components/jdr/NPCPanel'
import PlayersPanel from '@/components/jdr/PlayersPanel'
import GMToolbar from '@/components/jdr/GMToolbar'
import DiceRoller from '@/components/jdr/DiceRoller'
import MusicPlayer from '@/components/jdr/MusicPlayer'

// Local storage keys
const STORAGE_PLAYER_ID = 'jdr-player-id'
const STORAGE_PLAYER_NAME = 'jdr-player-name'

export default function GamePage() {
  const params = useParams()
  const gameId = params.gameId as string

  // Game state
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Local player info
  const [playerId, setPlayerId] = useState<string | null>(null)
  const [isGM, setIsGM] = useState(false)

  // UI state
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [showDiceRoller, setShowDiceRoller] = useState(false)
  const [showCharacterSheet, setShowCharacterSheet] = useState(false)
  const [viewingCharacter, setViewingCharacter] = useState<CharacterSheetType | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  // Refs
  const boardRef = useRef<HTMLDivElement>(null)

  // Initialize player from localStorage
  useEffect(() => {
    const storedId = localStorage.getItem(STORAGE_PLAYER_ID)
    if (storedId) {
      setPlayerId(storedId)
    }
  }, [])

  // Fetch game state (polling)
  useEffect(() => {
    let isMounted = true

    const fetchState = async () => {
      try {
        const res = await fetch(`/api/jdr/game/${gameId}`)
        if (!res.ok) {
          if (res.status === 404) {
            setError('Partie introuvable')
          } else {
            throw new Error('Erreur serveur')
          }
          return
        }

        const data: GameState = await res.json()
        if (isMounted && !isDragging) {
          setGameState(data)
          setLoading(false)

          // Check if current player is GM
          if (playerId && data.gmId === playerId) {
            setIsGM(true)
          }

          // Check if player needs onboarding
          if (playerId) {
            const existingPlayer = data.players.find((p) => p.id === playerId)
            if (!existingPlayer && !isGM) {
              setShowOnboarding(true)
            }
          } else if (!loading) {
            // No player ID in storage, show onboarding
            setShowOnboarding(true)
          }
        }
      } catch (err) {
        console.error('Polling error:', err)
      }
    }

    fetchState()
    const interval = setInterval(fetchState, 1000)
    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [gameId, playerId, isDragging, isGM, loading])

  // API action helper
  const sendAction = useCallback(
    async (action: string, payload: unknown) => {
      try {
        const res = await fetch(`/api/jdr/game/${gameId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action, payload }),
        })
        if (res.ok) {
          const data = await res.json()
          setGameState(data)
          return data
        }
      } catch (err) {
        console.error('Action error:', err)
        toast.error('Erreur de synchronisation')
      }
    },
    [gameId]
  )

  // Player onboarding complete
  const handleOnboardingComplete = async (data: {
    playerName: string
    character: CharacterSheetType
  }) => {
    const newPlayerId = crypto.randomUUID()

    // Create player object
    const player: Player = {
      id: newPlayerId,
      name: data.playerName,
      isGM: false,
      characterId: data.character.id,
      color: data.character.color || '#3b82f6',
      lastSeen: Date.now(),
    }

    // Save to localStorage
    localStorage.setItem(STORAGE_PLAYER_ID, newPlayerId)
    localStorage.setItem(STORAGE_PLAYER_NAME, data.playerName)
    setPlayerId(newPlayerId)

    // Add player to game
    await sendAction('JOIN_PLAYER', player)

    // Add character
    await sendAction('ADD_CHARACTER', data.character)

    // Create token for the player on the board
    if (gameState) {
      const newToken: Token = {
        id: crypto.randomUUID(),
        x: 100 + Math.random() * 200,
        y: 100 + Math.random() * 200,
        type: 'player',
        name: data.character.name.split('/')[0],
        avatar: data.character.avatar || '👤',
        color: data.character.color,
        characterId: data.character.id,
      }
      await sendAction('UPDATE_TOKENS', [...gameState.tokens, newToken])
    }

    setShowOnboarding(false)
  }

  // Token handlers
  const handleTokenMove = async (tokenId: string, x: number, y: number) => {
    if (!gameState) return
    setIsDragging(false)

    const newTokens = gameState.tokens.map((t) =>
      t.id === tokenId ? { ...t, x, y } : t
    )
    await sendAction('UPDATE_TOKENS', newTokens)
  }

  const handleAddTokenFromNPC = async (npc: NPC) => {
    if (!gameState || !isGM) return

    const newToken: Token = {
      id: crypto.randomUUID(),
      x: 200,
      y: 200,
      type: 'npc',
      name: npc.name,
      avatar: npc.threat === 'boss' ? '💀' : npc.threat === 'high' ? '👹' : '🧟',
      color: npc.threat === 'boss' ? '#ef4444' : '#eab308',
    }

    await sendAction('UPDATE_TOKENS', [...gameState.tokens, newToken])
  }

  // Dice roll handler
  const handleDiceRoll = async (roll: Omit<DiceRoll, 'id' | 'timestamp'>) => {
    await sendAction('ROLL_DICE', roll)
    toast.success(`${roll.successes} succès !`, {
      icon: '🎲',
    })
  }

  // Scene update handler
  const handleUpdateScene = async (sceneUpdate: Partial<Scene>) => {
    await sendAction('UPDATE_SCENE', sceneUpdate)
  }

  // Title update handler
  const handleUpdateTitle = async (title: string) => {
    await sendAction('UPDATE_TITLE', { title })
  }

  // Music update handler
  const handleUpdateMusic = async (track: GameState['currentTrack']) => {
    await sendAction('UPDATE_MUSIC', track)
  }

  // NPC handlers
  const handleAddNPC = async (npc: NPC) => {
    await sendAction('ADD_NPC', npc)
  }

  const handleUpdateNPC = async (npc: NPC) => {
    await sendAction('UPDATE_NPC', npc)
  }

  const handleDeleteNPC = async (id: string) => {
    await sendAction('DELETE_NPC', { id })
  }

  // Character handlers
  const handleViewCharacter = (character: CharacterSheetType) => {
    setViewingCharacter(character)
    setShowCharacterSheet(true)
  }

  const handleSaveCharacter = async (character: CharacterSheetType) => {
    await sendAction('UPDATE_CHARACTER', character)
    setShowCharacterSheet(false)
    setViewingCharacter(null)
    toast.success('Personnage sauvegardé')
  }

  // Get current player
  const currentPlayer = gameState?.players.find((p) => p.id === playerId)
  const currentCharacter = gameState?.characters.find(
    (c) => c.id === currentPlayer?.characterId
  )

  // Loading state
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-neutral-950 text-white">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-pulse">🎲</div>
          <p className="text-neutral-400">Chargement de la partie...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-neutral-950 text-white">
        <div className="text-center">
          <div className="text-4xl mb-4">💀</div>
          <p className="text-red-400 text-xl mb-2">{error}</p>
          <Link href="/jdr" className="text-neutral-400 hover:text-white underline">
            Retour à l'accueil
          </Link>
        </div>
      </div>
    )
  }

  if (!gameState) return null

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-neutral-950 text-white">
      {/* Onboarding Modal */}
      <AnimatePresence>
        {showOnboarding && (
          <PlayerOnboarding
            onComplete={handleOnboardingComplete}
            usedCharacterIds={gameState.characters.map((c) => c.id)}
            usedColors={gameState.players.map((p) => p.color)}
          />
        )}
      </AnimatePresence>

      {/* Dice Roller Modal */}
      <DiceRoller
        isOpen={showDiceRoller}
        onClose={() => setShowDiceRoller(false)}
        onRoll={handleDiceRoll}
        playerName={currentPlayer?.name || 'Joueur'}
        playerId={playerId || ''}
        characterAttributes={currentCharacter?.attributes}
        characterSkills={currentCharacter?.skills}
        stress={currentCharacter?.stress || 0}
      />

      {/* Character Sheet Modal */}
      <AnimatePresence>
        {showCharacterSheet && viewingCharacter && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto"
            onClick={() => {
              setShowCharacterSheet(false)
              setViewingCharacter(null)
            }}
          >
            <div onClick={(e) => e.stopPropagation()} className="w-full max-w-4xl my-8">
              <CharacterSheet
                initialData={viewingCharacter}
                onSave={handleSaveCharacter}
                onCancel={() => {
                  setShowCharacterSheet(false)
                  setViewingCharacter(null)
                }}
                readOnly={
                  !isGM &&
                  viewingCharacter.id !== currentPlayer?.characterId
                }
                showSecret={isGM || viewingCharacter.id === currentPlayer?.characterId}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* GM Toolbar */}
      <GMToolbar
        title={gameState.title}
        scene={gameState.scene}
        isGM={isGM}
        gameId={gameId}
        onUpdateTitle={handleUpdateTitle}
        onUpdateScene={handleUpdateScene}
      />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - NPCs (GM only shows full panel) */}
        <NPCPanel
          npcs={gameState.npcs}
          isGM={isGM}
          onAddNPC={handleAddNPC}
          onUpdateNPC={handleUpdateNPC}
          onDeleteNPC={handleDeleteNPC}
          onDragNPCToBoard={handleAddTokenFromNPC}
        />

        {/* Center - Game Board */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div
            ref={boardRef}
            className="flex-1 relative overflow-hidden bg-neutral-900"
            style={{
              backgroundImage: gameState.scene.gridEnabled
                ? `linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
                   linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)`
                : 'none',
              backgroundSize: gameState.scene.gridEnabled
                ? `${gameState.scene.gridSize}px ${gameState.scene.gridSize}px`
                : 'auto',
            }}
          >
            {/* Scene Background */}
            {gameState.scene.imageUrl && (
              <img
                src={gameState.scene.imageUrl}
                alt="Scene"
                className="absolute inset-0 w-full h-full object-contain pointer-events-none"
              />
            )}

            {/* Tokens */}
            {gameState.tokens.map((token) => (
              <motion.div
                key={token.id}
                className={`absolute flex flex-col items-center cursor-grab active:cursor-grabbing z-10
                  ${token.visible === false && !isGM ? 'hidden' : ''}
                  ${token.visible === false ? 'opacity-50' : ''}`}
                style={{ left: 0, top: 0 }}
                animate={{ x: token.x, y: token.y }}
                drag={isGM || token.characterId === currentPlayer?.characterId}
                dragMomentum={false}
                onDragStart={() => setIsDragging(true)}
                onDragEnd={(_, info) => {
                  handleTokenMove(
                    token.id,
                    token.x + info.offset.x,
                    token.y + info.offset.y
                  )
                }}
                onDoubleClick={() => {
                  const char = gameState.characters.find(
                    (c) => c.id === token.characterId
                  )
                  if (char) handleViewCharacter(char)
                }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <div
                  className={`w-14 h-14 rounded-full border-3 shadow-lg flex items-center justify-center text-2xl
                    ${token.type === 'player' ? 'bg-blue-900' : 'bg-red-900'}`}
                  style={{
                    borderColor: token.color || (token.type === 'player' ? '#3b82f6' : '#ef4444'),
                  }}
                >
                  {token.avatar || '👤'}
                </div>
                <div className="mt-1 px-2 py-0.5 bg-black/70 rounded text-xs font-bold whitespace-nowrap">
                  {token.name}
                </div>
              </motion.div>
            ))}

            {/* Dice Roll History */}
            <div className="absolute bottom-4 left-4 w-80 bg-neutral-900/90 border border-neutral-700 rounded-lg backdrop-blur-sm overflow-hidden">
              <div className="px-3 py-2 border-b border-neutral-700 text-xs uppercase text-neutral-500 tracking-wider">
                Journal des dés
              </div>
              <div className="p-2 space-y-1 max-h-40 overflow-y-auto">
                {gameState.diceRolls.slice(0, 10).map((roll) => (
                  <motion.div
                    key={roll.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-sm flex items-center gap-2"
                  >
                    <span className="font-bold text-yellow-500">{roll.playerName}</span>
                    <span className="text-neutral-500">:</span>
                    <span
                      className={`font-bold ${
                        roll.successes > 0 ? 'text-green-400' : 'text-red-400'
                      }`}
                    >
                      {roll.successes} succès
                    </span>
                    {roll.traumas > 0 && (
                      <span className="text-yellow-400 text-xs">
                        ({roll.traumas} trauma{roll.traumas > 1 && 's'})
                      </span>
                    )}
                    {roll.description && (
                      <span className="text-neutral-500 text-xs truncate">
                        - {roll.description}
                      </span>
                    )}
                  </motion.div>
                ))}
                {gameState.diceRolls.length === 0 && (
                  <div className="text-neutral-500 text-sm text-center py-2">
                    Aucun jet de dés
                  </div>
                )}
              </div>
            </div>

            {/* No scene image placeholder */}
            {!gameState.scene.imageUrl && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center text-neutral-700">
                  <div className="text-6xl mb-4">🗺️</div>
                  <p className="text-lg">
                    {isGM ? 'Clique sur "Scène" pour ajouter une image' : 'En attente de la scène...'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Music Player */}
          <MusicPlayer
            currentTrack={gameState.currentTrack}
            isGM={isGM}
            onUpdateMusic={handleUpdateMusic}
          />
        </div>

        {/* Right Panel - Players */}
        <PlayersPanel
          players={gameState.players}
          characters={gameState.characters}
          currentPlayerId={playerId || ''}
          isGM={isGM}
          onViewCharacter={handleViewCharacter}
          onRollDice={() => setShowDiceRoller(true)}
        />
      </div>
    </div>
  )
}
