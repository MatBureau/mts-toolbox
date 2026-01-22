'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { NPC } from '@/types/jdr'

interface Props {
  npcs: NPC[]
  isGM: boolean
  onAddNPC?: (npc: NPC) => void
  onUpdateNPC?: (npc: NPC) => void
  onDeleteNPC?: (id: string) => void
  onDragNPCToBoard?: (npc: NPC) => void
}

// PNJ prédéfinis pour TWD
const PRESET_NPCS: Partial<NPC>[] = [
  {
    name: 'Rôdeur',
    description: 'Zombie lambda',
    stats: 'VIG 2 • AGI 2 • Combat 2',
    threat: 'low',
  },
  {
    name: 'Rôdeur rapide',
    description: 'Zombie fraîchement tourné',
    stats: 'VIG 3 • AGI 3 • Combat 2',
    threat: 'medium',
  },
  {
    name: 'Horde (5-10)',
    description: 'Groupe de rôdeurs',
    stats: 'Danger collectif',
    threat: 'high',
  },
  {
    name: 'Survivant hostile',
    description: 'Humain ennemi',
    stats: 'Variable selon équipement',
    threat: 'medium',
  },
  {
    name: 'Chef de bande',
    description: 'Leader ennemi',
    stats: 'VIG 4 • AGI 3 • Commandement 3',
    threat: 'boss',
  },
]

const THREAT_COLORS: Record<string, string> = {
  low: 'border-green-600 bg-green-900/30',
  medium: 'border-yellow-600 bg-yellow-900/30',
  high: 'border-orange-600 bg-orange-900/30',
  boss: 'border-red-600 bg-red-900/30',
}

const THREAT_LABELS: Record<string, string> = {
  low: 'Faible',
  medium: 'Moyen',
  high: 'Élevé',
  boss: 'Boss',
}

export default function NPCPanel({
  npcs,
  isGM,
  onAddNPC,
  onUpdateNPC,
  onDeleteNPC,
  onDragNPCToBoard,
}: Props) {
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newNPC, setNewNPC] = useState<Partial<NPC>>({
    name: '',
    description: '',
    stats: '',
    threat: 'medium',
  })

  const handleAddPreset = (preset: Partial<NPC>) => {
    const npc: NPC = {
      id: crypto.randomUUID(),
      name: preset.name || 'PNJ',
      description: preset.description || '',
      stats: preset.stats,
      threat: preset.threat || 'medium',
    }
    onAddNPC?.(npc)
  }

  const handleAddCustom = () => {
    if (!newNPC.name?.trim()) return
    const npc: NPC = {
      id: crypto.randomUUID(),
      name: newNPC.name.trim(),
      description: newNPC.description || '',
      stats: newNPC.stats,
      threat: newNPC.threat || 'medium',
      notes: newNPC.notes,
    }
    onAddNPC?.(npc)
    setNewNPC({ name: '', description: '', stats: '', threat: 'medium' })
    setIsAddingNew(false)
  }

  const handleDelete = (id: string) => {
    if (confirm('Supprimer ce PNJ ?')) {
      onDeleteNPC?.(id)
    }
  }

  return (
    <div className="w-64 bg-neutral-900 border-r border-neutral-800 flex flex-col h-full">
      {/* Header */}
      <div className="p-3 border-b border-neutral-800">
        <h2 className="font-bold text-red-500 uppercase tracking-widest text-xs text-center">
          Bestiaire & PNJ
        </h2>
      </div>

      {/* Liste des PNJ */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        <AnimatePresence>
          {npcs.map((npc) => (
            <motion.div
              key={npc.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className={`p-3 rounded border-l-4 ${THREAT_COLORS[npc.threat || 'medium']}
                hover:bg-neutral-800/50 transition-all cursor-pointer group`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-white text-sm truncate">{npc.name}</div>
                  {npc.description && (
                    <div className="text-xs text-neutral-400 truncate">{npc.description}</div>
                  )}
                  {npc.stats && (
                    <div className="text-xs text-neutral-500 mt-1 font-mono">{npc.stats}</div>
                  )}
                </div>

                {isGM && (
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onDragNPCToBoard?.(npc)
                      }}
                      className="p-1 hover:bg-neutral-700 rounded text-xs"
                      title="Ajouter au plateau"
                    >
                      ➕
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(npc.id)
                      }}
                      className="p-1 hover:bg-red-700 rounded text-xs text-red-400"
                      title="Supprimer"
                    >
                      🗑️
                    </button>
                  </div>
                )}
              </div>

              {npc.threat && (
                <div className="mt-2">
                  <span
                    className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      npc.threat === 'boss'
                        ? 'bg-red-700 text-white'
                        : npc.threat === 'high'
                        ? 'bg-orange-700 text-white'
                        : npc.threat === 'medium'
                        ? 'bg-yellow-700 text-black'
                        : 'bg-green-700 text-white'
                    }`}
                  >
                    {THREAT_LABELS[npc.threat]}
                  </span>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {npcs.length === 0 && (
          <div className="text-center py-8 text-neutral-600 text-sm">
            {isGM ? 'Ajoute des PNJ ci-dessous' : 'Aucun PNJ'}
          </div>
        )}
      </div>

      {/* Actions MJ */}
      {isGM && (
        <div className="border-t border-neutral-800 p-2 space-y-2">
          {/* Formulaire d'ajout */}
          <AnimatePresence>
            {isAddingNew && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2 pb-2 border-b border-neutral-800"
              >
                <input
                  value={newNPC.name || ''}
                  onChange={(e) => setNewNPC((n) => ({ ...n, name: e.target.value }))}
                  placeholder="Nom du PNJ"
                  className="w-full bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-sm text-white focus:border-red-500 outline-none"
                  autoFocus
                />
                <input
                  value={newNPC.description || ''}
                  onChange={(e) => setNewNPC((n) => ({ ...n, description: e.target.value }))}
                  placeholder="Description courte"
                  className="w-full bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-sm text-white focus:border-red-500 outline-none"
                />
                <input
                  value={newNPC.stats || ''}
                  onChange={(e) => setNewNPC((n) => ({ ...n, stats: e.target.value }))}
                  placeholder="Stats (ex: VIG 3 • Combat 2)"
                  className="w-full bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-xs text-white focus:border-red-500 outline-none font-mono"
                />
                <select
                  value={newNPC.threat || 'medium'}
                  onChange={(e) =>
                    setNewNPC((n) => ({ ...n, threat: e.target.value as NPC['threat'] }))
                  }
                  className="w-full bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-sm text-white focus:border-red-500 outline-none"
                >
                  <option value="low">Menace faible</option>
                  <option value="medium">Menace moyenne</option>
                  <option value="high">Menace élevée</option>
                  <option value="boss">Boss</option>
                </select>
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsAddingNew(false)}
                    className="flex-1 py-1 bg-neutral-700 hover:bg-neutral-600 rounded text-sm"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleAddCustom}
                    disabled={!newNPC.name?.trim()}
                    className="flex-1 py-1 bg-red-700 hover:bg-red-600 disabled:bg-neutral-700 rounded text-sm"
                  >
                    Ajouter
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Presets rapides */}
          {!isAddingNew && (
            <>
              <div className="text-[10px] uppercase tracking-wider text-neutral-500 text-center">
                Ajout rapide
              </div>
              <div className="grid grid-cols-2 gap-1">
                {PRESET_NPCS.slice(0, 4).map((preset, i) => (
                  <button
                    key={i}
                    onClick={() => handleAddPreset(preset)}
                    className={`p-2 text-xs rounded border ${THREAT_COLORS[preset.threat || 'medium']}
                      hover:brightness-125 transition-all truncate`}
                  >
                    {preset.name}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setIsAddingNew(true)}
                className="w-full py-2 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded text-sm flex items-center justify-center gap-2"
              >
                <span>➕</span>
                <span>PNJ personnalisé</span>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
