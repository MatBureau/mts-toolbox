'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, Plus, Calculator, Info } from 'lucide-react'

type Cut = {
  id: string
  length: number
  quantity: number
}

type Stock = {
  id: string
  length: number
  quantity: number // -1 for infinite
  cost?: number
}

type ResultBar = {
  stockLength: number
  cuts: number[]
  waste: number
}

type CalculationResult = {
  bars: ResultBar[]
  totalStockUsed: number
  totalWaste: number
  efficiency: number
}

export default function OptimisateurCoupe() {
  const [stocks, setStocks] = useState<Stock[]>([
    { id: '1', length: 6000, quantity: -1 }, // Default 6m bar infinite
  ])
  const [cuts, setCuts] = useState<Cut[]>([
    { id: '1', length: 1500, quantity: 4 },
    { id: '2', length: 800, quantity: 5 },
  ])
  const [bladeWidth, setBladeWidth] = useState(4) // 4mm saw blade
  const [result, setResult] = useState<CalculationResult | null>(null)

  const addStock = () => {
    setStocks([...stocks, { id: crypto.randomUUID(), length: 6000, quantity: -1 }])
  }

  const removeStock = (id: string) => {
    setStocks(stocks.filter(s => s.id !== id))
  }

  const updateStock = (id: string, field: keyof Stock, value: number) => {
    setStocks(stocks.map(s => s.id === id ? { ...s, [field]: value } : s))
  }

  const addCut = () => {
    setCuts([...cuts, { id: crypto.randomUUID(), length: 0, quantity: 1 }])
  }

  const removeCut = (id: string) => {
    setCuts(cuts.filter(c => c.id !== id))
  }

  const updateCut = (id: string, field: keyof Cut, value: number) => {
    setCuts(cuts.map(c => c.id === id ? { ...c, [field]: value } : c))
  }

  const calculate = () => {
    // Flatten requests: create a list of all required lengths
    let requiredCuts: number[] = []
    cuts.forEach(cut => {
      for (let i = 0; i < cut.quantity; i++) requiredCuts.push(cut.length)
    })
    
    // Sort cuts descending (Best Fit Decreasing heuristic)
    requiredCuts.sort((a, b) => b - a)

    // Only consider the first stock definition for now (Simplification for this version)
    // Multi-stock support would require a more complex solver
    const stockLength = stocks[0].length
    
    const usedBars: ResultBar[] = []

    requiredCuts.forEach(cutLen => {
      // Try to fit in existing bars
      let placed = false
      for (let bar of usedBars) {
        const usedLength = bar.cuts.reduce((sum, c) => sum + c + bladeWidth, 0)
        if (stockLength - usedLength >= cutLen) {
          bar.cuts.push(cutLen)
          // Re-calculate waste
          const newUsed = bar.cuts.reduce((sum, c) => sum + c + bladeWidth, 0) - bladeWidth // Remove last blade width
          bar.waste = stockLength - newUsed
          placed = true
          break
        }
      }

      if (!placed) {
        // Create new bar
        usedBars.push({
          stockLength,
          cuts: [cutLen],
          waste: stockLength - cutLen
        })
      }
    })

    // Formatting result
    const totalLengthUsed = usedBars.length * stockLength
    const totalCutLength = requiredCuts.reduce((a, b) => a + b, 0)
    const efficiency = (totalCutLength / totalLengthUsed) * 100

    setResult({
      bars: usedBars,
      totalStockUsed: usedBars.length,
      totalWaste: usedBars.reduce((acc, bar) => acc + bar.waste, 0),
      efficiency
    })
  }

  return (
    <div className="space-y-8">
      {/* Configuration Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Stocks */}
        <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <span className="bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-300 p-1.5 rounded-lg">📦</span>
              Stock disponible
            </h3>
            <button onClick={addStock} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition hidden">
              <Plus size={18} />
            </button>
          </div>
          
          <div className="space-y-3">
            {stocks.map((stock) => (
              <div key={stock.id} className="flex gap-2 items-center">
                <div className="flex-1">
                  <label className="text-xs text-gray-500 mb-1 block">Longueur (mm)</label>
                  <input
                    type="number"
                    value={stock.length}
                    onChange={(e) => updateStock(stock.id, 'length', parseInt(e.target.value) || 0)}
                    className="w-full p-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 font-mono"
                  />
                </div>
                {/* Simplified: only length for now
                <div className="w-24">
                  <label className="text-xs text-gray-500 mb-1 block">Qté</label>
                  <input 
                     disabled
                     value="∞"
                     className="w-full p-2 rounded border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 text-center"
                  />
                </div>
                */}
              </div>
            ))}
            
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <label className="text-sm font-medium flex items-center gap-2">
                Épaisseur lame (mm)
                <div className="group relative">
                  <Info size={14} className="text-gray-400 cursor-help" />
                  <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-black rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none">
                     Perte de matière à chaque coupe
                  </span>
                </div>
              </label>
              <input
                type="number"
                value={bladeWidth}
                onChange={(e) => setBladeWidth(parseFloat(e.target.value) || 0)}
                className="mt-1 w-full p-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
              />
            </div>
          </div>
        </div>

        {/* Cuts Requests */}
        <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
           <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <span className="bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-300 p-1.5 rounded-lg">✂️</span>
              Découpes demandées
            </h3>
            <button 
              onClick={addCut}
              className="flex items-center gap-1 text-sm bg-primary-600 text-white px-3 py-1.5 rounded hover:bg-primary-700 transition"
            >
              <Plus size={16} /> Ajouter
            </button>
          </div>

          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
            <AnimatePresence>
              {cuts.map((cut) => (
                <motion.div 
                  key={cut.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex gap-2 items-end"
                >
                  <div className="flex-1">
                    <label className="text-xs text-gray-500 mb-1 block">Longueur (mm)</label>
                    <input
                      type="number"
                      value={cut.length}
                      onChange={(e) => updateCut(cut.id, 'length', parseInt(e.target.value) || 0)}
                      className="w-full p-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 font-mono"
                      placeholder="ex: 1500"
                    />
                  </div>
                  <div className="w-20">
                    <label className="text-xs text-gray-500 mb-1 block">Qté</label>
                    <input
                      type="number"
                      value={cut.quantity}
                      onChange={(e) => updateCut(cut.id, 'quantity', parseInt(e.target.value) || 0)}
                      className="w-full p-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-center"
                    />
                  </div>
                  <button 
                    onClick={() => removeCut(cut.id)}
                    className="p-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded border border-transparent hover:border-red-200 transition mb-[1px]"
                  >
                    <Trash2 size={18} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <button
          onClick={calculate}
          className="group relative inline-flex items-center justify-center px-8 py-3 text-lg font-medium text-white transition-all duration-200 bg-primary-600 rounded-full hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-600"
        >
          <span className="absolute inset-0 w-full h-full -mt-1 rounded-lg opacity-30 bg-gradient-to-b from-transparent via-transparent to-black"></span>
          <span className="relative flex items-center gap-2">
            <Calculator className="group-hover:rotate-12 transition-transform" /> 
            Optimiser maintenant
          </span>
        </button>
      </div>

      {/* Results */}
      {result && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="text-sm text-gray-500">Barres nécessaires</div>
              <div className="text-3xl font-bold text-primary-600">{result.totalStockUsed}</div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="text-sm text-gray-500">Efficacité</div>
              <div className="text-3xl font-bold text-green-600">{result.efficiency.toFixed(1)}%</div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="text-sm text-gray-500">Chutes (Total)</div>
              <div className="text-3xl font-bold text-orange-600">{result.totalWaste} <span className="text-sm font-normal text-gray-400">mm</span></div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
               <div className="text-sm text-gray-500">Nb. Coupes</div>
               <div className="text-3xl font-bold text-gray-700 dark:text-gray-300">{result.bars.reduce((acc, b) => acc + b.cuts.length, 0)}</div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 font-medium">
              Plan de coupe détaillé
            </div>
            <div className="p-6 space-y-6">
              {result.bars.map((bar, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>Barre #{idx + 1} ({stocks[0].length}mm)</span>
                    <span>Chute: {bar.waste}mm</span>
                  </div>
                  <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden flex relative w-full border border-gray-300 dark:border-gray-600">
                    {bar.cuts.map((cut, cutIdx) => {
                      const widthPercent = (cut / bar.stockLength) * 100
                      // const bladePercent = (bladeWidth / bar.stockLength) * 100
                      return (
                         <div 
                           key={cutIdx}
                           style={{ width: `${widthPercent}%` }}
                           className="h-full bg-primary-500 border-r border-white/20 flex items-center justify-center text-xs text-white font-mono relative group first:rounded-l last:rounded-r"
                           title={`${cut}mm`}
                         >
                           {widthPercent > 5 && <span>{cut}</span>}
                         </div>
                      )
                    })}
                    {/* Visualizing Waste */}
                    <div className="flex-1 bg-red-100 dark:bg-red-900/30 h-full flex items-center justify-center text-xs text-red-500">
                       <span className="opacity-50 text-[10px] transform -rotate-45">chute</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
