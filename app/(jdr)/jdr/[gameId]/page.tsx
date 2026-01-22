'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import CharacterSheet from '@/components/jdr/CharacterSheet'

// Types
type Token = { id: string; x: number; y: number; type: 'player' | 'npc'; name: string; avatar?: string; sheet?: any }
type Player = { id: string; name: string }

export default function GamePage() {
  const { gameId } = useParams()
  const searchParams = useSearchParams()
  const role = searchParams.get('role') || 'PLAYER' 
  const [gameState, setGameState] = useState<any>(null)
  const [tokens, setTokens] = useState<Token[]>([])
  const [players, setPlayers] = useState<Player[]>([])
  const [diceRolls, setDiceRolls] = useState<any[]>([])
  
  // UI State
  const [showSheet, setShowSheet] = useState(false)
  const [selectedTokenId, setSelectedTokenId] = useState<string | null>(null)
  const [localSheetData, setLocalSheetData] = useState<any>(null)

  // Polling
  useEffect(() => {
    const fetchState = async () => {
      try {
        const res = await fetch(`/api/jdr/game/${gameId}`)
        if (res.ok) {
          const data = await res.json()
          setGameState(data)
          // Si on ne drag pas, on update
          if (!document.body.classList.contains('dragging')) {
            setTokens(data.tokens || [])
          }
          setPlayers(data.players || [])
          setDiceRolls(data.diceRolls || [])
        }
      } catch (e) {
        console.error("Polling error", e)
      }
    }

    fetchState()
    const interval = setInterval(fetchState, 1000)
    return () => clearInterval(interval)
  }, [gameId])

  // Handlers
  const handleTokenMove = async (id: string, x: number, y: number) => {
    document.body.classList.remove('dragging')
    const newTokens = tokens.map(t => t.id === id ? { ...t, x, y } : t)
    setTokens(newTokens)

    await fetch(`/api/jdr/game/${gameId}`, {
        method: 'POST',
        body: JSON.stringify({
            action: 'UPDATE_TOKENS',
            payload: newTokens
        })
    })
  }

  const handleDragStart = () => {
    document.body.classList.add('dragging')
  }

  // Actions Bar
  const handleAddToken = async () => {
    if (role !== 'GM') return
    const newToken: Token = { 
        id: crypto.randomUUID(), 
        x: 100, 
        y: 100, 
        type: 'player', 
        name: 'Nouveau Joueur',
        avatar: '👤'
    }
    const newTokens = [...tokens, newToken]
    setTokens(newTokens)
    await fetch(`/api/jdr/game/${gameId}`, {
        method: 'POST',
        body: JSON.stringify({
            action: 'UPDATE_TOKENS',
            payload: newTokens
        })
    })
  }
  
  const handleRollDice = async () => {
    const result = Math.floor(Math.random() * 6) + 1
    const rollData = { player: role === 'GM' ? 'MJ' : 'Joueur', result, type: 'd6' }
    
    await fetch(`/api/jdr/game/${gameId}`, {
        method: 'POST',
        body: JSON.stringify({
            action: 'ROLL_DICE',
            payload: rollData
        })
    })
  }

  const handleSaveSheet = async (data: any) => {
    if (selectedTokenId) {
        const newTokens = tokens.map(t => t.id === selectedTokenId ? { ...t, name: data.name, sheet: data } : t)
        setTokens(newTokens)
        await fetch(`/api/jdr/game/${gameId}`, {
            method: 'POST',
            body: JSON.stringify({ action: 'UPDATE_TOKENS', payload: newTokens })
        })
        setShowSheet(false)
        toast.success("Fiche sauvegardée !")
    }
  }

  const openSheet = (token: Token) => {
    setSelectedTokenId(token.id)
    setLocalSheetData(token.sheet || { name: token.name })
    setShowSheet(true)
  }

  if (!gameState) return <div className="flex h-screen items-center justify-center text-white font-mono animate-pulse">Chargement de la partie...</div>

  return (
    <div className="flex h-screen overflow-hidden bg-neutral-900 text-white font-sans selection:bg-red-500/30">
      
      {/* Modal Fiche Personnage */}
      <AnimatePresence>
        {showSheet && (
            <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                onClick={() => setShowSheet(false)}
            >
                <div onClick={e => e.stopPropagation()} className="w-full max-w-3xl">
                    <CharacterSheet initialData={localSheetData} onSave={handleSaveSheet} />
                </div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* LEFT: PNJ */}
      <div className="w-64 bg-neutral-900 border-r border-neutral-800 flex flex-col z-20 shadow-xl">
        <div className="p-4 border-b border-neutral-800 font-bold text-red-500 uppercase tracking-widest text-sm text-center">Bestiaire & PNJ</div>
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
           <div className="p-3 bg-neutral-800/50 rounded border border-neutral-700/50 hover:border-red-500/50 cursor-pointer transition-all">
                <div className="font-bold text-gray-300">Rôdeur (Zombie)</div>
                <div className="text-xs text-gray-500">Force 3 • Agilité 1</div>
           </div>
           <div className="p-3 bg-neutral-800/50 rounded border border-neutral-700/50 hover:border-red-500/50 cursor-pointer transition-all">
                <div className="font-bold text-gray-300">Survivant Hostile</div>
                <div className="text-xs text-gray-500">Fusil de chasse</div>
           </div>
        </div>
      </div>

      {/* CENTER: BOARD */}
      <div className="flex-1 relative bg-[#121212] overflow-hidden flex flex-col">
         {/* Top Bar */}
         <div className="h-14 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between px-6 shadow-md z-20">
            <div className="font-serif text-xl tracking-widest text-neutral-400 uppercase">{gameState.scene.name}</div>
            <div className="flex items-center gap-4">
                <div className="text-xs font-mono text-neutral-600">ID: {gameId}</div>
            </div>
         </div>

         {/* Canvas Area */}
         <div className="flex-1 relative overflow-hidden bg-[url('/grid.svg')] bg-center opacity-100">
            {/* Background Image Layer */}
            {gameState.scene.imageUrl && (
                <img src={gameState.scene.imageUrl} alt="Scene" className="absolute inset-0 w-full h-full object-contain pointer-events-none opacity-80" />
            )}

            {/* Tokens Layer */}
            {tokens.map(token => (
                <motion.div
                    key={token.id}
                    className="absolute w-14 h-14 rounded-full border-2 border-white shadow-[0_0_15px_rgba(0,0,0,0.5)] bg-blue-600 flex items-center justify-center text-3xl cursor-grab active:cursor-grabbing z-10 hover:scale-110 transition-transform"
                    style={{ left: 0, top: 0 }} 
                    animate={{ x: token.x, y: token.y }}
                    drag
                    dragMomentum={false}
                    onDragStart={handleDragStart}
                    onDragEnd={(e, info) => {
                        handleTokenMove(token.id, token.x + info.offset.x, token.y + info.offset.y)
                    }}
                    onDoubleClick={() => openSheet(token)}
                >
                    {token.avatar || '👤'}
                    <div className="absolute -bottom-6 text-[10px] font-bold bg-black/70 px-2 py-0.5 rounded text-white whitespace-nowrap pointer-events-none">
                        {token.name}
                    </div>
                </motion.div>
            ))}

            {/* Dice Overlay */}
            <div className="absolute bottom-6 left-6 p-4 bg-neutral-900/90 border border-neutral-700 rounded-lg backdrop-blur-md max-w-sm pointer-events-none shadow-2xl">
                <div className="text-xs uppercase tracking-widest text-neutral-500 mb-2 border-b border-neutral-800 pb-1">Journal des dés</div>
                <div className="space-y-1 max-h-32 overflow-hidden flex flex-col-reverse">
                    {diceRolls.slice(0, 5).map((roll: any, i: number) => (
                        <div key={i} className="text-sm text-gray-300 animate-in slide-in-from-left-2 fade-in duration-300">
                            <span className="font-bold text-yellow-500">{roll.player}</span> : <span className={`font-bold ml-1 ${roll.result === 6 ? 'text-green-400' : 'text-white'}`}>{roll.result}</span>
                            <span className="text-xs text-gray-600 ml-1">({roll.type})</span>
                        </div>
                    ))}
                </div>
            </div>
         </div>
      </div>

      {/* RIGHT: TOOLS */}
      <div className="w-20 bg-neutral-900 border-l border-neutral-800 flex flex-col items-center py-4 z-20 shadow-xl gap-4">
        
        <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center text-white font-bold mb-4 shadow-lg ring-2 ring-red-500/20">
            {role === 'GM' ? 'MJ' : 'PJ'}
        </div>

        <button 
            onClick={handleRollDice} 
            className="w-12 h-12 bg-neutral-800 hover:bg-neutral-700 rounded-xl flex flex-col items-center justify-center gap-1 transition-all hover:scale-105 active:scale-95 group relative"
            title="Lancer 1d6"
        >
            <span className="text-2xl group-hover:rotate-180 transition-transform duration-500">🎲</span>
        </button>

        {role === 'GM' && (
            <button 
                onClick={handleAddToken} 
                className="w-12 h-12 bg-neutral-800 hover:bg-neutral-700 rounded-xl flex flex-col items-center justify-center gap-1 transition-all hover:scale-105 active:scale-95 text-blue-400 group"
                title="Ajouter Jeton"
            >
                <span className="text-xl group-hover:scale-125 transition-transform">♟️</span>
            </button>
        )}

        <div className="flex-1"></div>
        
        <div className="w-12 h-12 bg-neutral-800 rounded-full flex items-center justify-center text-xs text-gray-500">
            {players.length}
        </div>
      </div>
    </div>
  )
}
