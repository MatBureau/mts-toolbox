'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Scene } from '@/types/jdr'

interface Props {
  title: string
  scene: Scene
  isGM: boolean
  gameId: string
  onUpdateTitle: (title: string) => void
  onUpdateScene: (scene: Partial<Scene>) => void
}

export default function GMToolbar({
  title,
  scene,
  isGM,
  gameId,
  onUpdateTitle,
  onUpdateScene,
}: Props) {
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [editTitle, setEditTitle] = useState(title)
  const [showScenePanel, setShowScenePanel] = useState(false)
  const [imageUrl, setImageUrl] = useState(scene.imageUrl)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleTitleSave = () => {
    if (editTitle.trim()) {
      onUpdateTitle(editTitle.trim())
    }
    setIsEditingTitle(false)
  }

  const handleImageUrlChange = () => {
    if (imageUrl.trim()) {
      onUpdateScene({ imageUrl: imageUrl.trim() })
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Convertir en base64 pour un stockage simple (dans un vrai projet, utiliser un CDN/S3)
    const reader = new FileReader()
    reader.onload = () => {
      const base64 = reader.result as string
      onUpdateScene({ imageUrl: base64 })
      setImageUrl(base64)
    }
    reader.readAsDataURL(file)
  }

  // Copier le code de la partie
  const copyGameCode = () => {
    navigator.clipboard.writeText(gameId)
  }

  return (
    <div className="h-14 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between px-4 shadow-md z-30">
      {/* Gauche: Titre */}
      <div className="flex items-center gap-4">
        {isEditingTitle && isGM ? (
          <div className="flex items-center gap-2">
            <input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleTitleSave()
                if (e.key === 'Escape') setIsEditingTitle(false)
              }}
              className="bg-neutral-800 border border-neutral-700 rounded px-3 py-1 text-lg text-white focus:border-red-500 outline-none"
              autoFocus
            />
            <button
              onClick={handleTitleSave}
              className="px-3 py-1 bg-red-700 hover:bg-red-600 rounded text-sm"
            >
              ✓
            </button>
            <button
              onClick={() => setIsEditingTitle(false)}
              className="px-3 py-1 bg-neutral-700 hover:bg-neutral-600 rounded text-sm"
            >
              ✕
            </button>
          </div>
        ) : (
          <h1
            onClick={() => isGM && setIsEditingTitle(true)}
            className={`font-serif text-xl tracking-widest text-neutral-300 uppercase ${
              isGM ? 'cursor-pointer hover:text-white' : ''
            }`}
            title={isGM ? 'Cliquer pour modifier' : ''}
          >
            {title || 'Sans titre'}
          </h1>
        )}

        {/* Indicateur MJ */}
        {isGM && (
          <span className="px-2 py-0.5 bg-red-700/50 text-red-300 text-xs uppercase rounded">
            MJ
          </span>
        )}
      </div>

      {/* Centre: Outils MJ */}
      {isGM && (
        <div className="flex items-center gap-2">
          {/* Bouton Image de scène */}
          <button
            onClick={() => setShowScenePanel(!showScenePanel)}
            className={`px-3 py-1.5 rounded text-sm flex items-center gap-2 transition-all ${
              showScenePanel
                ? 'bg-red-700 text-white'
                : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300'
            }`}
          >
            🖼️ Scène
          </button>

          {/* Bouton Grille */}
          <button
            onClick={() => onUpdateScene({ gridEnabled: !scene.gridEnabled })}
            className={`px-3 py-1.5 rounded text-sm flex items-center gap-2 transition-all ${
              scene.gridEnabled
                ? 'bg-blue-700 text-white'
                : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300'
            }`}
          >
            📐 Grille
          </button>
        </div>
      )}

      {/* Droite: Code de partie */}
      <div className="flex items-center gap-3">
        <button
          onClick={copyGameCode}
          className="flex items-center gap-2 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 rounded text-sm text-neutral-400 hover:text-white transition-all"
          title="Copier le code"
        >
          <span className="font-mono text-xs">{gameId}</span>
          <span>📋</span>
        </button>
      </div>

      {/* Panel de scène (dropdown) */}
      <AnimatePresence>
        {showScenePanel && isGM && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-14 left-1/2 -translate-x-1/2 bg-neutral-900 border border-neutral-700 rounded-lg shadow-2xl p-4 w-96 z-50"
          >
            <h3 className="font-bold text-white mb-3">Paramètres de scène</h3>

            {/* Nom de la scène */}
            <div className="mb-3">
              <label className="block text-xs uppercase text-neutral-500 mb-1">
                Nom de la scène
              </label>
              <input
                value={scene.name}
                onChange={(e) => onUpdateScene({ name: e.target.value })}
                className="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-white focus:border-red-500 outline-none"
                placeholder="Ex: Forêt abandonnée"
              />
            </div>

            {/* Image URL */}
            <div className="mb-3">
              <label className="block text-xs uppercase text-neutral-500 mb-1">
                Image de fond (URL)
              </label>
              <div className="flex gap-2">
                <input
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  onBlur={handleImageUrlChange}
                  onKeyDown={(e) => e.key === 'Enter' && handleImageUrlChange()}
                  className="flex-1 bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-white focus:border-red-500 outline-none text-sm"
                  placeholder="https://..."
                />
              </div>
            </div>

            {/* Upload local */}
            <div className="mb-3">
              <label className="block text-xs uppercase text-neutral-500 mb-1">
                Ou importer une image
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 border-dashed rounded text-sm text-neutral-400"
              >
                📁 Choisir un fichier
              </button>
            </div>

            {/* Aperçu */}
            {scene.imageUrl && (
              <div className="mb-3">
                <label className="block text-xs uppercase text-neutral-500 mb-1">Aperçu</label>
                <div className="relative w-full h-32 bg-neutral-800 rounded overflow-hidden">
                  <img
                    src={scene.imageUrl}
                    alt="Aperçu"
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => {
                      onUpdateScene({ imageUrl: '' })
                      setImageUrl('')
                    }}
                    className="absolute top-2 right-2 w-6 h-6 bg-red-700 hover:bg-red-600 rounded-full flex items-center justify-center text-xs"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}

            {/* Options de grille */}
            {scene.gridEnabled && (
              <div className="mb-3">
                <label className="block text-xs uppercase text-neutral-500 mb-1">
                  Taille de la grille
                </label>
                <input
                  type="range"
                  min="20"
                  max="100"
                  value={scene.gridSize}
                  onChange={(e) => onUpdateScene({ gridSize: parseInt(e.target.value) })}
                  className="w-full"
                />
                <div className="text-xs text-neutral-500 text-center">{scene.gridSize}px</div>
              </div>
            )}

            <button
              onClick={() => setShowScenePanel(false)}
              className="w-full py-2 bg-red-700 hover:bg-red-600 rounded font-bold"
            >
              Fermer
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
