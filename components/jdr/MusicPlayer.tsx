'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Track {
  url: string
  name: string
  volume: number
  playing: boolean
}

// Playlists d'ambiance prédéfinies (URLs YouTube ou fichiers locaux)
const AMBIENT_PRESETS = [
  {
    name: 'Silence inquiétant',
    description: 'Ambiance post-apocalyptique',
    icon: '🌑',
  },
  {
    name: 'Forêt sombre',
    description: 'Bruits de nature la nuit',
    icon: '🌲',
  },
  {
    name: 'Ville abandonnée',
    description: 'Échos urbains déserts',
    icon: '🏚️',
  },
  {
    name: 'Tension',
    description: 'Musique de suspense',
    icon: '😰',
  },
  {
    name: 'Combat',
    description: 'Action intense',
    icon: '⚔️',
  },
  {
    name: 'Repos au camp',
    description: 'Calme temporaire',
    icon: '🏕️',
  },
]

interface Props {
  currentTrack?: Track
  isGM: boolean
  onUpdateMusic?: (track: Track | undefined) => void
}

export default function MusicPlayer({ currentTrack, isGM, onUpdateMusic }: Props) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [localVolume, setLocalVolume] = useState(currentTrack?.volume ?? 50)
  const [customUrl, setCustomUrl] = useState('')
  const audioRef = useRef<HTMLAudioElement>(null)

  // Sync audio avec l'état
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = localVolume / 100
      if (currentTrack?.playing) {
        audioRef.current.play().catch(() => {})
      } else {
        audioRef.current.pause()
      }
    }
  }, [currentTrack, localVolume])

  const handlePlayPause = () => {
    if (!currentTrack) return
    onUpdateMusic?.({
      ...currentTrack,
      playing: !currentTrack.playing,
    })
  }

  const handleVolumeChange = (volume: number) => {
    setLocalVolume(volume)
    if (currentTrack) {
      onUpdateMusic?.({
        ...currentTrack,
        volume,
      })
    }
  }

  const handleSetTrack = (name: string, url?: string) => {
    onUpdateMusic?.({
      name,
      url: url || '',
      volume: localVolume,
      playing: true,
    })
  }

  const handleCustomUrl = () => {
    if (customUrl.trim()) {
      handleSetTrack('Piste personnalisée', customUrl.trim())
      setCustomUrl('')
    }
  }

  const handleStop = () => {
    onUpdateMusic?.(undefined)
  }

  return (
    <div className="bg-neutral-900 border-t border-neutral-800">
      {/* Audio element caché */}
      {currentTrack?.url && (
        <audio
          ref={audioRef}
          src={currentTrack.url}
          loop
          onError={() => console.warn('Erreur de lecture audio')}
        />
      )}

      {/* Barre compacte */}
      <div
        className="h-12 px-4 flex items-center justify-between cursor-pointer hover:bg-neutral-800/50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">🎵</span>
          <div>
            <div className="text-sm font-medium text-white">
              {currentTrack?.name || 'Pas de musique'}
            </div>
            <div className="text-xs text-neutral-500">
              {currentTrack?.playing ? '▶️ En lecture' : '⏸️ En pause'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Volume */}
          <input
            type="range"
            min="0"
            max="100"
            value={localVolume}
            onChange={(e) => {
              e.stopPropagation()
              handleVolumeChange(parseInt(e.target.value))
            }}
            onClick={(e) => e.stopPropagation()}
            className="w-20 h-1 appearance-none bg-neutral-700 rounded-lg cursor-pointer"
          />
          <span className="text-xs text-neutral-500 w-8">{localVolume}%</span>

          {/* Play/Pause */}
          {currentTrack && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                handlePlayPause()
              }}
              className="w-8 h-8 flex items-center justify-center bg-neutral-800 hover:bg-neutral-700 rounded-full"
            >
              {currentTrack.playing ? '⏸️' : '▶️'}
            </button>
          )}

          {/* Expand */}
          <motion.span
            animate={{ rotate: isExpanded ? 180 : 0 }}
            className="text-neutral-500"
          >
            ▲
          </motion.span>
        </div>
      </div>

      {/* Panel étendu (MJ seulement pour les contrôles) */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-neutral-800"
          >
            <div className="p-4 space-y-4">
              {isGM ? (
                <>
                  {/* Presets d'ambiance */}
                  <div>
                    <h3 className="text-xs uppercase text-neutral-500 mb-2">
                      Ambiances rapides
                    </h3>
                    <div className="grid grid-cols-3 gap-2">
                      {AMBIENT_PRESETS.map((preset) => (
                        <button
                          key={preset.name}
                          onClick={() => handleSetTrack(preset.name)}
                          className={`p-2 rounded text-left transition-all ${
                            currentTrack?.name === preset.name
                              ? 'bg-red-700 border border-red-500'
                              : 'bg-neutral-800 hover:bg-neutral-700 border border-neutral-700'
                          }`}
                        >
                          <div className="text-lg mb-1">{preset.icon}</div>
                          <div className="text-xs font-bold text-white truncate">
                            {preset.name}
                          </div>
                          <div className="text-[10px] text-neutral-400 truncate">
                            {preset.description}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* URL personnalisée */}
                  <div>
                    <h3 className="text-xs uppercase text-neutral-500 mb-2">
                      URL audio personnalisée
                    </h3>
                    <div className="flex gap-2">
                      <input
                        value={customUrl}
                        onChange={(e) => setCustomUrl(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleCustomUrl()}
                        placeholder="https://... (mp3, ogg, wav)"
                        className="flex-1 bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-sm text-white focus:border-red-500 outline-none"
                      />
                      <button
                        onClick={handleCustomUrl}
                        disabled={!customUrl.trim()}
                        className="px-4 py-2 bg-red-700 hover:bg-red-600 disabled:bg-neutral-700 rounded font-bold text-sm"
                      >
                        Jouer
                      </button>
                    </div>
                    <p className="text-[10px] text-neutral-500 mt-1">
                      Supporte les fichiers audio directs (pas YouTube)
                    </p>
                  </div>

                  {/* Contrôles */}
                  {currentTrack && (
                    <div className="flex gap-2">
                      <button
                        onClick={handleStop}
                        className="flex-1 py-2 bg-neutral-800 hover:bg-neutral-700 rounded text-sm"
                      >
                        ⏹️ Arrêter
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center text-neutral-500 py-4">
                  <p className="text-sm">🎵 La musique est contrôlée par le MJ</p>
                  <p className="text-xs mt-1">Tu peux ajuster ton volume local</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
