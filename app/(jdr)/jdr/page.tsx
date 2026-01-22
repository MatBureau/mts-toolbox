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
  const [gmName, setGmName] = useState('')
  const [showGmNameInput, setShowGmNameInput] = useState(false)

  const handleCreateGame = async () => {
    if (!showGmNameInput) {
      setShowGmNameInput(true)
      return
    }

    if (!gmName.trim()) {
      toast.error('Entre ton nom de MJ')
      return
    }

    setIsCreating(true)
    try {
      // Générer un ID unique pour le MJ
      const gmId = crypto.randomUUID()

      // Sauvegarder l'ID local
      localStorage.setItem('jdr-player-id', gmId)
      localStorage.setItem('jdr-player-name', gmName.trim())

      const res = await fetch('/api/jdr/game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gmId,
          gmName: gmName.trim(),
        }),
      })

      if (!res.ok) throw new Error('Erreur création partie')

      const { gameId } = await res.json()
      router.push(`/jdr/${gameId}`)
    } catch (error) {
      toast.error('Impossible de créer la partie')
      setIsCreating(false)
    }
  }

  const handleJoinGame = (e: React.FormEvent) => {
    e.preventDefault()
    if (!joinCode.trim()) return
    router.push(`/jdr/${joinCode.trim().toUpperCase()}`)
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-neutral-950 via-neutral-900 to-red-950">
      {/* Background effects */}
      <div className="fixed inset-0 bg-[url('/noise.png')] opacity-5 pointer-events-none" />
      <div className="fixed inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />

      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
        {/* Header */}
        <div className="col-span-full text-center mb-4">
          <h1 className="text-5xl font-black text-red-500 tracking-tighter mb-2">
            THE WALKING DEAD
          </h1>
          <p className="text-neutral-500 uppercase tracking-[0.3em] text-sm">
            Year Zero Engine - Table Virtuelle
          </p>
        </div>

        {/* CREATE GAME */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="h-full bg-neutral-900/90 border-neutral-800 backdrop-blur-sm hover:border-red-500/50 transition-colors">
            <CardHeader>
              <CardTitle className="text-3xl text-red-500">Créer une partie</CardTitle>
              <CardDescription className="text-neutral-400">
                Pour le Maître du Jeu (MJ)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-neutral-300">
                Lancez une nouvelle table de jeu. Vous aurez le contrôle total sur les
                scénarios, les PNJ et l'ambiance.
              </p>

              <motion.div
                initial={false}
                animate={{ height: showGmNameInput ? 'auto' : 0 }}
                className="overflow-hidden"
              >
                <div className="mt-4">
                  <label className="block text-xs uppercase text-neutral-500 mb-2">
                    Ton nom de MJ
                  </label>
                  <input
                    type="text"
                    value={gmName}
                    onChange={(e) => setGmName(e.target.value)}
                    placeholder="Ex: Le Narrateur"
                    className="w-full bg-neutral-800 border border-neutral-700 rounded px-4 py-3 text-white focus:border-red-500 outline-none"
                    autoFocus={showGmNameInput}
                    onKeyDown={(e) => e.key === 'Enter' && handleCreateGame()}
                  />
                </div>
              </motion.div>

              <div className="mt-6 text-sm text-neutral-500">
                Les sessions sont sauvegardées indéfiniment
              </div>

              <button
                onClick={handleCreateGame}
                disabled={isCreating}
                className="mt-6 w-full py-3 bg-red-600 hover:bg-red-700 disabled:bg-neutral-700 text-white rounded font-bold transition-all"
              >
                {isCreating
                  ? 'Création...'
                  : showGmNameInput
                  ? 'CRÉER LA PARTIE'
                  : "COMMENCER L'AVENTURE"}
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
          <Card className="h-full bg-neutral-900/90 border-neutral-800 backdrop-blur-sm">
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
                  placeholder="CODE (ex: AB12CD)"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded p-3 text-center text-2xl font-mono tracking-widest text-white focus:border-blue-500 outline-none"
                />
                <button
                  type="submit"
                  disabled={!joinCode.trim()}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-neutral-700 text-white rounded font-bold transition-all"
                >
                  REJOINDRE
                </button>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Footer */}
        <div className="col-span-full text-center text-neutral-600 text-xs mt-4">
          Year Zero Engine est une création de Free League Publishing
        </div>
      </div>
    </div>
  )
}
