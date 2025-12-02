'use client'

import { useState } from 'react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

export default function CalculateurPourcentage() {
  const [value, setValue] = useState('')
  const [percentage, setPercentage] = useState('')
  const [result1, setResult1] = useState('')
  const [result2, setResult2] = useState('')

  const calculate = () => {
    const val = parseFloat(value)
    const perc = parseFloat(percentage)

    if (isNaN(val) || isNaN(perc)) return

    // Pourcentage de la valeur
    const percentOfValue = (val * perc) / 100
    setResult1(`${perc}% de ${val} = ${percentOfValue.toFixed(2)}`)

    // Valeur après augmentation/réduction
    const increase = val + percentOfValue
    const decrease = val - percentOfValue
    setResult2(`Après +${perc}% : ${increase.toFixed(2)} | Après -${perc}% : ${decrease.toFixed(2)}`)
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Valeur"
          type="number"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="100"
        />
        <Input
          label="Pourcentage (%)"
          type="number"
          value={percentage}
          onChange={(e) => setPercentage(e.target.value)}
          placeholder="20"
        />
      </div>

      <Button onClick={calculate}>Calculer</Button>

      {result1 && (
        <div className="space-y-3">
          <div className="bg-primary-50 dark:bg-primary-900/20 p-4 rounded-lg">
            <p className="text-lg font-semibold text-primary-700 dark:text-primary-400">
              {result1}
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {result2}
            </p>
          </div>
        </div>
      )}

      <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Exemples d'utilisation</h3>
        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
          <li>• Calculer une remise : 100€ avec -20% = 80€</li>
          <li>• Calculer la TVA : 100€ + 20% = 120€</li>
          <li>• Calculer une augmentation de salaire</li>
        </ul>
      </div>
    </div>
  )
}
