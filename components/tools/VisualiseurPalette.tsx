'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Box, Layers, RefreshCw, ZoomIn, ZoomOut } from 'lucide-react'

// Pallet types
const PALLETS = [
  { id: 'eur', name: 'Palette Europe (EUR)', width: 800, length: 1200, height: 144 },
  { id: 'iso', name: 'Palette ISO (Standard)', width: 1000, length: 1200, height: 144 },
  { id: 'us', name: 'Palette US (GMA)', width: 1016, length: 1219, height: 140 },
]

export default function VisualiseurPalette() {
  const [box, setBox] = useState({ length: 400, width: 300, height: 250, weight: 5 })
  const [pallet, setPallet] = useState(PALLETS[0])
  const [maxHeight, setMaxHeight] = useState(1800)
  const [zoom, setZoom] = useState(0.8)
  const [rotation, setRotation] = useState({ x: 60, z: 45 })
  
  // Interactive Rotation Logic
  const [isDragging, setIsDragging] = useState(false)
  const lastMousePos = useRef({ x: 0, y: 0 })

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
    lastMousePos.current = { x: e.clientX, y: e.clientY }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    const deltaX = e.clientX - lastMousePos.current.x
    const deltaY = e.clientY - lastMousePos.current.y
    
    setRotation(prev => ({
      x: Math.max(0, Math.min(90, prev.x - deltaY * 0.5)), // Limit X rotation to avoid flipping
      z: prev.z + deltaX * 0.5
    }))
    
    lastMousePos.current = { x: e.clientX, y: e.clientY }
  }

  const handleMouseUp = () => setIsDragging(false)
  
  // Stats
  const [stats, setStats] = useState({ totalBoxes: 0, totalWeight: 0, layers: 0, efficiency: 0, stackHeight: 0 })
  const [layout, setLayout] = useState<{ x: number, y: number, z: number, rotated: boolean }[]>([])

  // Calculation Logic (Simple Layer Stacking)
  useEffect(() => {
    // Try two orientations for the base layer
    // 1. Normal: Box Length aligned with Pallet Length
    // 2. Rotated: Box Length aligned with Pallet Width (if possible)
    
    // Simplification: We test a homogenous layer pattern (all rotated or all normal)
    // A robust algorithm uses "Column generation" or "Dancing Links" but that's too heavy for client-side simple tool.
    
    const calculateLayer = (pL: number, pW: number, bL: number, bW: number) => {
      const cols = Math.floor(pL / bL)
      const rows = Math.floor(pW / bW)
      return { count: cols * rows, cols, rows, rotated: false }
    }

    // Option A: Normal
    const layoutA = calculateLayer(pallet.length, pallet.width, box.length, box.width)
    // Option B: Rotated box
    const layoutB = calculateLayer(pallet.length, pallet.width, box.width, box.length)

    // Option C: Mixed is hard. Let's pick best of A or B.
    const bestLayer = layoutA.count > layoutB.count ? 
      { ...layoutA, bL: box.length, bW: box.width } : 
      { count: layoutB.count, cols: layoutB.cols, rows: layoutB.rows, rotated: true, bL: box.width, bW: box.length }

    // Calculate max layers
    const maxStackHeight = maxHeight - pallet.height
    const numLayers = Math.floor(maxStackHeight / box.height)
    
    const totalBoxes = bestLayer.count * numLayers
    
    // Generate simple coordinates for visualization
    const boxes = []
    for (let l = 0; l < numLayers; l++) {
      for (let r = 0; r < bestLayer.rows; r++) {
         for (let c = 0; c < bestLayer.cols; c++) {
           boxes.push({
             x: c * bestLayer.bL,
             y: r * bestLayer.bW,
             z: l * box.height,
             rotated: bestLayer.rotated
           })
         }
      }
    }

    setLayout(boxes)
    setStats({
      totalBoxes,
      totalWeight: totalBoxes * box.weight,
      layers: numLayers,
      efficiency: (bestLayer.count * bestLayer.bL * bestLayer.bW) / (pallet.length * pallet.width) * 100,
      stackHeight: numLayers * box.height + pallet.height
    })

  }, [box, pallet, maxHeight])

  return (
    <div className="flex flex-col xl:flex-row gap-8 min-h-[600px]">
      
      {/* Controls */}
      <div className="w-full xl:w-1/3 space-y-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
           <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
             <Box className="text-primary-500"/> Dimensions Colis (mm)
           </h3>
           <div className="grid grid-cols-2 gap-4">
             <div>
               <label className="text-xs text-gray-500 block mb-1">Longueur</label>
               <input 
                 type="number" value={box.length} 
                 onChange={e=>setBox({...box, length: parseInt(e.target.value) || 0})}
                 className="w-full p-2 rounded border bg-gray-50 dark:bg-gray-700 dark:border-gray-600"
               />
             </div>
             <div>
               <label className="text-xs text-gray-500 block mb-1">Largeur</label>
               <input 
                 type="number" value={box.width} 
                 onChange={e=>setBox({...box, width: parseInt(e.target.value) || 0})}
                 className="w-full p-2 rounded border bg-gray-50 dark:bg-gray-700 dark:border-gray-600"
               />
             </div>
             <div>
               <label className="text-xs text-gray-500 block mb-1">Hauteur</label>
               <input 
                 type="number" value={box.height} 
                 onChange={e=>setBox({...box, height: parseInt(e.target.value) || 0})}
                 className="w-full p-2 rounded border bg-gray-50 dark:bg-gray-700 dark:border-gray-600"
               />
             </div>
             <div>
               <label className="text-xs text-gray-500 block mb-1">Poids (kg)</label>
               <input 
                 type="number" value={box.weight} 
                 onChange={e=>setBox({...box, weight: parseFloat(e.target.value) || 0})}
                 className="w-full p-2 rounded border bg-gray-50 dark:bg-gray-700 dark:border-gray-600"
               />
             </div>
           </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
           <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
             <Layers className="text-primary-500"/> Palette
           </h3>
           <div className="space-y-4">
             <select 
               value={pallet.id}
               onChange={(e) => setPallet(PALLETS.find(p => p.id === e.target.value) || PALLETS[0])}
               className="w-full p-2 rounded border bg-gray-50 dark:bg-gray-700 dark:border-gray-600"
             >
               {PALLETS.map(p => (
                 <option key={p.id} value={p.id}>{p.name} - {p.length}x{p.width}</option>
               ))}
             </select>
             
             <div>
               <label className="text-xs text-gray-500 block mb-1">Hauteur Max (mm)</label>
               <input 
                 type="number" value={maxHeight} 
                 onChange={e=>setMaxHeight(parseInt(e.target.value) || 0)}
                 className="w-full p-2 rounded border bg-gray-50 dark:bg-gray-700 dark:border-gray-600"
               />
             </div>

             {/* Recap Stats */}
             <div className="pt-4 mt-4 border-t border-gray-100 dark:border-gray-700 grid grid-cols-2 gap-4 text-center">
                <div className="bg-primary-50 dark:bg-primary-900/20 p-2 rounded">
                  <div className="text-2xl font-bold text-primary-600">{stats.totalBoxes}</div>
                  <div className="text-xs text-gray-500">Colis total</div>
                </div>
                <div className="bg-primary-50 dark:bg-primary-900/20 p-2 rounded">
                  <div className="text-2xl font-bold text-primary-600">{stats.layers}</div>
                  <div className="text-xs text-gray-500">Couches</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded">
                  <div className="text-lg font-bold text-gray-700 dark:text-gray-300">{stats.totalWeight} kg</div>
                  <div className="text-xs text-gray-500">Poids Total</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded">
                  <div className="text-lg font-bold text-gray-700 dark:text-gray-300">{stats.stackHeight/1000} m</div>
                  <div className="text-xs text-gray-500">Hauteur Totale</div>
                </div>
             </div>
           </div>
        </div>
      </div>

      {/* 3D Visualization */}
      <div 
        className={`flex-1 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-950 rounded-xl overflow-hidden relative border border-gray-200 dark:border-gray-800 flex items-center justify-center min-h-[500px] perspective-1000 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
         
         <div className="absolute top-4 right-4 flex flex-col gap-2 z-10 w-10">
            <button onClick={(e) => { e.stopPropagation(); setZoom(z => Math.min(z + 0.1, 2)) }} className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition-colors tooltip-left" title="Zoom In"><ZoomIn size={20}/></button>
            <button onClick={(e) => { e.stopPropagation(); setZoom(z => Math.max(z - 0.1, 0.3)) }} className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition-colors" title="Zoom Out"><ZoomOut size={20}/></button>
            <button onClick={(e) => { e.stopPropagation(); setRotation({ x: 60, z: 45 }) }} className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition-colors" title="Réinitialiser vue"><RefreshCw size={20}/></button>
         </div>

         {/* 3D Scene Root */}
         <div 
           className="relative transition-transform duration-300 ease-out"
           style={{
             transform: `scale(${zoom}) rotateX(${rotation.x}deg) rotateZ(${rotation.z}deg)`,
             transformStyle: 'preserve-3d'
           }}
         >
            {/* Pallet Base - Centered */}
            <div 
              className="absolute"
              style={{
                width: pallet.length,
                height: pallet.width,
                transform: `translate(-50%, -50%)`,
                transformStyle: 'preserve-3d'
              }}
            >
               {/* Pallet Top Face */}
               <div className="absolute inset-0 bg-[#d4a873] border border-[#a07c50]" 
                    style={{ transform: 'translateZ(0px)' }} >
                 <div className="w-full h-full border-4 border-[#8B4513]/20"></div>
                 {/* Pallet Side Faces (Fake thickness) */}
                 <div className="absolute -bottom-2 left-0 right-0 h-4 bg-[#b58b5a] origin-top transform rotate-x-90 translate-y-full" style={{ transform: 'rotateX(-90deg)' }}></div>
                 <div className="absolute top-0 bottom-0 -right-2 w-4 bg-[#a07c50] origin-left transform rotate-y-90 translate-x-full" style={{ transform: 'rotateY(90deg)' }}></div>
               </div>

               {/* Shadow */}
               <div className="absolute inset-0 bg-black/40 blur-xl transform translate-z-[-20px]" style={{ transform: 'translateZ(-20px)' }}></div>
            
               {/* Boxes Container (Relative to Pallet Top-Left which is 0,0 locally in this div) */}
               {layout.map((b, i) => {
                  const w = b.rotated ? box.width : box.length
                  const l = b.rotated ? box.length : box.width // Visual length (y-axis)
                  const h = box.height
                  
                  // Color variation for distinction
                  const isEven = (i % 2 === 0)
                  const colorTop = isEven ? '#fb923c' : '#f97316' // orange-400 / orange-500
                  const colorSide = isEven ? '#ea580c' : '#c2410c' // orange-600 / orange-700
                  const colorFront = isEven ? '#f97316' : '#ea580c' // orange-500 / orange-600

                  return (
                    <div
                      key={i}
                      className="absolute group"
                      style={{
                        width: w,
                        height: l,
                        transform: `translate3d(${b.x}px, ${b.y}px, ${b.z}px)`,
                        transformStyle: 'preserve-3d'
                      }}
                    >
                      {/* Top Face */}
                      <div 
                        className="absolute inset-0 border border-black/10 flex items-center justify-center text-[10px] font-bold text-black/30 group-hover:bg-blue-400 transition-colors"
                        style={{ 
                          backgroundColor: colorTop,
                          transform: `translateZ(${h}px)` 
                        }}
                      >
                        {stats.totalBoxes < 100 && i+1}
                      </div>

                      {/* Front Face (South) */}
                      <div 
                        className="absolute top-full left-0 w-full origin-top"
                        style={{ 
                          height: h, 
                          backgroundColor: colorFront,
                          transform: 'rotateX(-90deg)',
                          borderBottom: '1px solid rgba(0,0,0,0.1)'
                        }}
                      ></div>
                      
                      {/* Right Face (East) */}
                      <div 
                        className="absolute top-0 left-full h-full origin-left"
                        style={{ 
                          width: h, 
                          backgroundColor: colorSide,
                          transform: 'rotateY(90deg)',
                          borderRight: '1px solid rgba(0,0,0,0.1)'
                        }}
                      ></div>
                    </div>
                  )
               })}
             </div>
         </div>

         <div className="absolute bottom-4 left-4 text-xs font-mono text-gray-400 pointer-events-none select-none">
            CSS 3D Engine • Rot: {rotation.x}°/{rotation.z}°
         </div>
      </div>
    </div>
  )
}
