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
      <div className="flex-1 bg-gray-100 dark:bg-gray-900 rounded-xl overflow-hidden relative border border-gray-200 dark:border-gray-800 flex items-center justify-center min-h-[500px] perspective-1000">
         
         <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
            <button onClick={() => setZoom(z => Math.min(z + 0.1, 2))} className="p-2 bg-white dark:bg-gray-800 rounded shadow hover:bg-gray-50"><ZoomIn size={20}/></button>
            <button onClick={() => setZoom(z => Math.max(z - 0.1, 0.3))} className="p-2 bg-white dark:bg-gray-800 rounded shadow hover:bg-gray-50"><ZoomOut size={20}/></button>
            <button onClick={() => setRotation({ x: 60, z: 45 })} className="p-2 bg-white dark:bg-gray-800 rounded shadow hover:bg-gray-50"><RefreshCw size={20}/></button>
         </div>

         {/* 3D Scene Root */}
         <div 
           className="relative transition-transform duration-300 ease-out"
           style={{
             transform: `scale(${zoom}) rotateX(${rotation.x}deg) rotateZ(${rotation.z}deg)`,
             transformStyle: 'preserve-3d'
           }}
         >
            {/* Pallet Base */}
            <div 
              className="absolute bg-[#C19A6B] border border-[#a08055]"
              style={{
                width: pallet.length,
                height: pallet.width,
                transform: `translate(-50%, -50%) translateZ(0px)`,
                boxShadow: '0 0 50px rgba(0,0,0,0.2)'
              }}
            >
               {/* Pallet detailed simulation (wood planks look) */}
               <div className="w-full h-full border-4 border-[#8B4513] opacity-20"></div>
            </div>

            {/* Boxes */}
            {layout.map((b, i) => {
              // Only render minimal faces for performance if plenty of boxes
              // Using a simple Cube approximation
              const w = b.rotated ? box.width : box.length
              const h = b.rotated ? box.length : box.width
              
              return (
                <div
                  key={i}
                  className="absolute group hover:z-50"
                  style={{
                    width: w,
                    height: h,
                    // Transform origin is center, so we need to offset coordinates
                    // Our coordinate system is 0,0 at top-left of pallet. 
                    // Scene center is 0,0. Pallet top-left is -L/2, -W/2
                    transform: `
                      translate3d(
                        ${b.x - pallet.length/2}px, 
                        ${b.y - pallet.width/2}px, 
                        ${b.z + pallet.height}px
                      )
                    `,
                    transformStyle: 'preserve-3d'
                  }}
                >
                  {/* BOX - Using simple CSS Cube */}
                  {/* Top Face */}
                  <div 
                    className="absolute bg-orange-400 border border-orange-600/50 flex items-center justify-center text-[10px] text-orange-900/50 font-bold"
                    style={{ width: w, height: h, transform: 'translateZ(' + box.height + 'px)' }}
                  >
                    {i+1}
                  </div>
                  {/* Front/Side Faces (Simulated with thick borders or pseudo elements if needed, but for top-down view mostly top face + slight extrusion effect works) */}
                  {/* Side Face (Thickness) */}
                   <div 
                    className="absolute bg-orange-600 w-full top-full origin-top"
                    style={{ height: box.height, transform: 'rotateX(-90deg)' }}
                  ></div>
                  <div 
                    className="absolute bg-orange-500 h-full left-full origin-left"
                    style={{ width: box.height, transform: 'rotateY(90deg)' }}
                  ></div>
                </div>
              )
            })}
         </div>

         <div className="absolute bottom-4 left-4 text-xs text-gray-400 pointer-events-none">
            CSS 3D Render • 1px = 1mm
         </div>

      </div>
    </div>
  )
}
