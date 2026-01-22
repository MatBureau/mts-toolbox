'use client'

import { useState, useRef, useEffect } from 'react'
import { DrawingPath } from '@/types/jdr'

interface Props {
  paths: DrawingPath[]
  onUpdatePaths: (paths: DrawingPath[]) => void
  isGM: boolean
  playerId: string
  isEnabled: boolean
  color?: string
}

export default function DrawingBoard({
  paths,
  onUpdatePaths,
  isGM,
  playerId,
  isEnabled,
  color = '#ef4444'
}: Props) {
  const [currentPath, setCurrentPath] = useState<{ x: number; y: number }[] | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    if (!svgRef.current) return null
    const svg = svgRef.current
    const rect = svg.getBoundingClientRect()
    
    let clientX, clientY
    if ('touches' in e) {
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
    } else {
      clientX = e.clientX
      clientY = e.clientY
    }

    // Calculer les coordonnées relatives à la viewBox (on suppose viewBox="0 0 width height")
    const x = (clientX - rect.left) * (svg.viewBox.baseVal.width / rect.width)
    const y = (clientY - rect.top) * (svg.viewBox.baseVal.height / rect.height)
    
    return { x, y }
  }

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isEnabled) return
    const coords = getCoordinates(e)
    if (coords) {
      setCurrentPath([coords])
    }
  }

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!currentPath || !isEnabled) return
    const coords = getCoordinates(e)
    if (coords) {
      setCurrentPath((prev) => prev ? [...prev, coords] : [coords])
    }
  }

  const stopDrawing = () => {
    if (!currentPath || currentPath.length < 2) {
      setCurrentPath(null)
      return
    }

    const newPath: DrawingPath = {
      id: crypto.randomUUID(),
      userId: playerId,
      color: color,
      width: 3,
      points: currentPath,
      timestamp: Date.now()
    }

    onUpdatePaths([...paths, newPath])
    setCurrentPath(null)
  }

  const clearAll = () => {
    if (isGM && confirm('Effacer tous les dessins ?')) {
      onUpdatePaths([])
    }
  }

  return (
    <div className={`absolute inset-0 z-20 ${isEnabled ? 'cursor-crosshair pointer-events-auto' : 'pointer-events-none'}`}>
      <svg
        ref={svgRef}
        viewBox="0 0 1600 900" 
        className="w-full h-full touch-none"
        style={{ pointerEvents: isEnabled ? 'auto' : 'none' }}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
      >
        {/* Existing Paths */}
        {paths.map((p) => (
          <polyline
            key={p.id}
            points={p.points.map(pt => `${pt.x},${pt.y}`).join(' ')}
            fill="none"
            stroke={p.color}
            strokeWidth={p.width}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}

        {/* Current Path */}
        {currentPath && (
          <polyline
            points={currentPath.map(pt => `${pt.x},${pt.y}`).join(' ')}
            fill="none"
            stroke={color}
            strokeWidth={4}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
      </svg>

      {/* Drawing Controls (only visible when enabled) */}
      {isEnabled && (
        <div className="absolute top-4 right-20 flex flex-col gap-2 bg-neutral-900/80 p-2 rounded-lg border border-neutral-700 backdrop-blur-md pointer-events-auto shadow-xl">
          <div className="flex flex-col gap-1 items-center">
             <div 
              className="w-8 h-8 rounded-full cursor-pointer border-2 border-white shadow-inner mb-2"
              style={{ backgroundColor: color }}
            />
          </div>
          <button 
            onClick={() => onUpdatePaths(paths.slice(0, -1))}
            className="p-2 hover:bg-neutral-800 rounded text-xl"
            title="Annuler"
          >
            ↩️
          </button>
          {isGM && (
            <button 
              onClick={clearAll}
              className="p-2 hover:bg-red-900/40 rounded text-xl"
              title="Effacer tout"
            >
              🗑️
            </button>
          )}
        </div>
      )}
    </div>
  )
}
