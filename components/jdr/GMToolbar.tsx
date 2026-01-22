'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Scene } from '@/types/jdr'

interface Props {
  title: string
  scene: Scene
  sceneLibrary: Scene[]
  isGM: boolean
  gameId: string
  drawingMode: boolean
  onUpdateTitle: (title: string) => void
  onUpdateScene: (scene: Partial<Scene>) => void
  onSaveScene: (scene: Scene) => void
  onLoadScene: (id: string) => void
  onToggleDrawing: () => void
}

export default function GMToolbar({
  title,
  scene,
  sceneLibrary,
  isGM,
  gameId,
  drawingMode,
  onUpdateTitle,
  onUpdateScene,
  onSaveScene,
  onLoadScene,
  onToggleDrawing,
}: Props) {
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [editTitle, setEditTitle] = useState(title)
  const [showScenePanel, setShowScenePanel] = useState(false)
  const [activeTab, setActiveTab] = useState<'settings' | 'library'>('settings')
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

          {/* Bouton Dessin */}
          <button
            onClick={onToggleDrawing}
            className={`px-3 py-1.5 rounded text-sm flex items-center gap-2 transition-all ${
              drawingMode
                ? 'bg-yellow-600 text-white shadow-lg shadow-yellow-600/20'
                : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300'
            }`}
          >
            🎨 Dessin
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
            <div className="flex border-b border-neutral-700 mb-4">
              <button
                onClick={() => setActiveTab('settings')}
                className={`flex-1 py-1 px-2 text-xs font-bold transition-all ${
                  activeTab === 'settings' ? 'text-white border-b-2 border-red-600' : 'text-neutral-500'
                }`}
              >
                Configuration
              </button>
              <button
                onClick={() => setActiveTab('library')}
                className={`flex-1 py-1 px-2 text-xs font-bold transition-all ${
                  activeTab === 'library' ? 'text-white border-b-2 border-red-600' : 'text-neutral-500'
                }`}
              >
                Bibliothèque ({sceneLibrary.length})
              </button>
            </div>

            {activeTab === 'settings' ? (
              <>
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
                  onClick={() => onSaveScene(scene)}
                  className="w-full py-2 bg-blue-700 hover:bg-blue-600 rounded font-bold mb-2 text-sm"
                >
                  💾 Sauvegarder dans la biblio
                </button>
              </>
            ) : (
              <div className="max-h-80 overflow-y-auto space-y-2 mb-4">
                {sceneLibrary.length === 0 ? (
                  <p className="text-center text-neutral-500 py-4 text-sm italic">
                    Aucune scène sauvegardée
                  </p>
                ) : (
                  sceneLibrary.map((libScene) => (
                    <div
                      key={libScene.id}
                      className="flex items-center gap-2 p-2 bg-neutral-800 rounded-lg hover:bg-neutral-750 group cursor-pointer"
                      onClick={() => onLoadScene(libScene.id!)}
                    >
                      <div className="w-16 h-10 bg-black rounded overflow-hidden flex-shrink-0">
                        {libScene.imageUrl && (
                          <img src={libScene.imageUrl} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" alt="" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold truncate text-white">{libScene.name || 'Sans titre'}</div>
                      </div>
                      <button className="p-1 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                        ✕
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}

            <button
              onClick={() => setShowScenePanel(false)}
              className="w-full py-2 bg-neutral-700 hover:bg-neutral-600 rounded font-bold text-sm"
            >
              Fermer
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
