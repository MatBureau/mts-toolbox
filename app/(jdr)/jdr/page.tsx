'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import toast from 'react-hot-toast'

export default function JdrLandingPage() {
  const router = useRouter()
  const [joinCode, setJoinCode] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  const handleCreateGame = async () => {
    setIsCreating(true)
    try {
      const res = await fetch('/api/jdr/game', {
        method: 'POST',
      })
      
      if (!res.ok) throw new Error('Erreur création partie')
      
      const { gameId } = await res.json()
      router.push(`/jdr/${gameId}?role=GM`)
    } catch (error) {
      toast.error("Impossible de créer la partie")
      setIsCreating(false)
    }
  }

  const handleJoinGame = (e: React.FormEvent) => {
    e.preventDefault()
    if (!joinCode.trim()) return
    router.push(`/jdr/${joinCode}`)
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-[url('/jdr-bg.jpg')] bg-cover bg-center bg-no-repeat bg-blend-overlay bg-black/70">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* CREATE GAME */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="h-full bg-neutral-800/90 border-neutral-700 backdrop-blur-sm hover:border-red-500/50 transition-colors cursor-pointer group" onClick={handleCreateGame}>
            <CardHeader>
              <CardTitle className="text-3xl text-red-500 group-hover:text-red-400">Créer une partie</CardTitle>
              <CardDescription className="text-neutral-400">Pour le Maître du Jeu (MJ)</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-neutral-300">
                Lancez une nouvelle table de jeu. Vous aurez le contrôle total sur les scénarios, les PNJ et l'ambiance.
              </p>
              <div className="mt-6 text-sm text-neutral-500">
                Système par défaut : Year Zero Engine (Walking Dead)
              </div>
              <button 
                disabled={isCreating}
                className="mt-8 w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded font-bold transition-all"
              >
                {isCreating ? 'Création...' : 'COMMENCER L\'AVENTURE'}
              </button>
            </CardContent>
          </Card>
        </motion.div>

        {/* JOIN GAME */}
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="h-full bg-neutral-800/90 border-neutral-700 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-3xl text-blue-500">Rejoindre</CardTitle>
              <CardDescription className="text-neutral-400">Pour les Joueurs</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-neutral-300 mb-6">
                Entrez le code de la partie fourni par votre MJ pour rejoindre la table.
              </p>
              
              <form onSubmit={handleJoinGame} className="space-y-4">
                <input 
                  type="text"
                  placeholder="Code de la partie (ex: AB12)"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  className="w-full bg-neutral-900 border border-neutral-600 rounded p-3 text-center text-2xl font-mono tracking-widest text-white focus:border-blue-500 outline-none"
                />
                <button 
                  type="submit"
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold transition-all"
                >
                  REJOINDRE
                </button>
              </form>
            </CardContent>
          </Card>
        </motion.div>

      </div>
    </div>
  )
}
