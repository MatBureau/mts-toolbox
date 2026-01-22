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
  DrawingPath,
} from '@/types/jdr'

// Components
import CharacterSheet from '@/components/jdr/CharacterSheet'
import PlayerOnboarding from '@/components/jdr/PlayerOnboarding'
import NPCPanel from '@/components/jdr/NPCPanel'
import PlayersPanel from '@/components/jdr/PlayersPanel'
import GMToolbar from '@/components/jdr/GMToolbar'
import DiceRoller from '@/components/jdr/DiceRoller'
import MusicPlayer from '@/components/jdr/MusicPlayer'
import DrawingBoard from '@/components/jdr/DrawingBoard'

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
  const [draggedToken, setDraggedToken] = useState<string | null>(null)
  const [drawingMode, setDrawingMode] = useState(false)
  const [drawingColor, setDrawingColor] = useState('#ef4444')


  // Refs
  const boardRef = useRef<HTMLDivElement>(null)
  const lastActionTime = useRef<number>(0)
  const gameStateRef = useRef<GameState | null>(null)

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
      // Don't poll if we just performed an action (grace period of 2s)
      if (Date.now() - lastActionTime.current < 2000) {
        return
      }

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
          // Only update if the incoming state is newer than what we have
          if (!gameStateRef.current || data.lastUpdated > (gameStateRef.current.lastUpdated || 0)) {
            setGameState(data)
            gameStateRef.current = data
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
      // Update local timestamp reference immediately
      lastActionTime.current = Date.now()
      
      try {
        const res = await fetch(`/api/jdr/game/${gameId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action, payload }),
        })
        if (res.ok) {
          const data = await res.json()
          setGameState(data)
          gameStateRef.current = data
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
    
    // Finalize state
    setIsDragging(false)
    setDraggedToken(null)

    const newTokens = gameState.tokens.map((t) =>
      t.id === tokenId ? { ...t, x, y } : t
    )
    
    // Optimistic update
    const optimisticState = { ...gameState, tokens: newTokens, lastUpdated: Date.now() }
    setGameState(optimisticState)
    gameStateRef.current = optimisticState
    
    await sendAction('UPDATE_TOKENS', newTokens)
  }

  const handleToggleTokenStatus = async (tokenId: string, status: string) => {
    if (!gameState) return
    const token = gameState.tokens.find(t => t.id === tokenId)
    if (!token) return

    const currentStatus = token.status || []
    const newStatus = currentStatus.includes(status)
      ? currentStatus.filter(s => s !== status)
      : [...currentStatus, status]

    await sendAction('UPDATE_TOKEN_STATUS', { tokenId, status: newStatus })
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

  // Scene Library handlers
  const handleSaveScene = async (sceneToSave: Scene) => {
    await sendAction('SAVE_SCENE_TO_LIB', sceneToSave)
    toast.success('Scène sauvegardée dans la bibliothèque')
  }

  const handleLoadScene = async (sceneId: string) => {
    await sendAction('LOAD_SCENE_FROM_LIB', { id: sceneId })
    toast.success('Scène chargée')
  }

  // Music update handler
  const handleUpdateMusic = async (track: GameState['currentTrack']) => {
    await sendAction('UPDATE_MUSIC', track)
  }

  // Drawing handlers
  const handleUpdateDrawings = async (drawings: DrawingPath[]) => {
    // Optimistic update
    if (gameStateRef.current) {
      gameStateRef.current.drawings = drawings
      setGameState({ ...gameStateRef.current })
    }
    await sendAction('UPDATE_DRAWINGS', drawings)
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

  const handlePushRoll = async (rollId: string) => {
    await sendAction('PUSH_ROLL', { rollId })
    toast.success('Jet forcé !', { icon: '🔥' })
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
                onRoll={(attr, skill) => {
                  setShowCharacterSheet(false)
                  setTimeout(() => {
                    setShowDiceRoller(true)
                    // TODO: Pass pre-selected attr/skill to DiceRoller if needed
                  }, 100)
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* GM Toolbar */}
      <GMToolbar
        title={gameState.title}
        scene={gameState.scene}
        sceneLibrary={gameState.sceneLibrary || []}
        isGM={isGM}
        gameId={gameId}
        drawingMode={drawingMode}
        onUpdateTitle={handleUpdateTitle}
        onUpdateScene={handleUpdateScene}
        onSaveScene={handleSaveScene}
        onLoadScene={handleLoadScene}
        onToggleDrawing={() => setDrawingMode(!drawingMode)}
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
            {/* Drawing Layer */}
            <DrawingBoard
              paths={gameState.drawings || []}
              onUpdatePaths={handleUpdateDrawings}
              isGM={isGM}
              playerId={playerId || ''}
              isEnabled={drawingMode}
              color={drawingColor}
            />

            {/* Scene Background */}
            {gameState.scene.imageUrl && (
              <img
                src={gameState.scene.imageUrl}
                alt="Scene"
                className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                loading="eager"
              />
            )}

            {/* Tokens */}
            {gameState.tokens.map((token) => (
              <motion.div
                key={token.id}
                className={`absolute flex flex-col items-center cursor-grab active:cursor-grabbing z-10 group
                  ${token.visible === false && !isGM ? 'hidden' : ''}
                  ${token.visible === false ? 'opacity-50' : ''}`}
                style={{ left: 0, top: 0 }}
                animate={{ x: token.x, y: token.y }}
                drag={isGM || token.characterId === currentPlayer?.characterId}
                dragMomentum={false}
                onDragStart={() => {
                  setIsDragging(true)
                  setDraggedToken(token.id)
                }}
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
                onContextMenu={(e) => {
                  e.preventDefault()
                  // On pourrait ouvrir un menu plus complexe, mais pour l'instant
                  // on va cycler les statuts ou proposer un petit overlay
                }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                {/* Status Toggle Menu (Simple overlay on hover/active) */}
                {(isGM || token.characterId === currentPlayer?.characterId) && (
                  <div className="absolute -left-10 top-0 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleToggleTokenStatus(token.id, 'blessé') }}
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] border border-neutral-700 shadow-lg ${token.status?.includes('blessé') ? 'bg-red-600' : 'bg-neutral-800'}`}
                      title="Blessé"
                    >
                      🩸
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleToggleTokenStatus(token.id, 'paniqué') }}
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] border border-neutral-700 shadow-lg ${token.status?.includes('paniqué') ? 'bg-yellow-600' : 'bg-neutral-800'}`}
                      title="Paniqué"
                    >
                      😱
                    </button>
                  </div>
                )}
                <div
                  className={`w-14 h-14 rounded-full border-3 shadow-lg flex items-center justify-center text-2xl
                    ${token.type === 'player' ? 'bg-blue-900' : 'bg-red-900'}`}
                  style={{
                    borderColor: token.color || (token.type === 'player' ? '#3b82f6' : '#ef4444'),
                  }}
                >
                  {token.avatar || '👤'}
                </div>
                
                {/* Status Badges */}
                <div className="absolute -top-1 -right-1 flex flex-wrap-reverse justify-end gap-1 pointer-events-none">
                  {token.status?.map((s, i) => (
                    <div 
                      key={i} 
                      className={`w-5 h-5 rounded-full border border-neutral-900 flex items-center justify-center text-[10px] shadow-sm
                        ${s === 'blessé' ? 'bg-red-600' : s === 'paniqué' ? 'bg-yellow-600' : 'bg-blue-600'}`}
                      title={s}
                    >
                      {s === 'blessé' ? '🩸' : s === 'paniqué' ? '😱' : '✨'}
                    </div>
                  ))}
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
                    {roll.playerId === playerId && !roll.pushed && (
                      <button
                        onClick={() => handlePushRoll(roll.id)}
                        className="ml-auto text-[10px] bg-red-900/50 hover:bg-red-900 border border-red-700 px-1.5 py-0.5 rounded text-red-200"
                        title="Forcer le jet (+1 Stress, relance les échecs)"
                      >
                        Pousser
                      </button>
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
