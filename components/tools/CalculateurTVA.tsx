'use client'

import { useState } from 'react'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'

export default function CalculateurTVA() {
  const [amount, setAmount] = useState('')
  const [tva, setTva] = useState('20')
  const [results, setResults] = useState<{
    ht: string
    ttc: string
    tvaAmount: string
  } | null>(null)

  const calculate = () => {
    const val = parseFloat(amount)
    const tvaRate = parseFloat(tva)

    if (isNaN(val) || isNaN(tvaRate)) return

    // On suppose que la valeur entrée est HT
    const htAmount = val
    const tvaAmount = (htAmount * tvaRate) / 100
    const ttcAmount = htAmount + tvaAmount

    setResults({
      ht: htAmount.toFixed(2),
      ttc: ttcAmount.toFixed(2),
      tvaAmount: tvaAmount.toFixed(2),
    })
  }

  const calculateReverse = () => {
    const val = parseFloat(amount)
    const tvaRate = parseFloat(tva)

    if (isNaN(val) || isNaN(tvaRate)) return

    // On suppose que la valeur entrée est TTC
    const ttcAmount = val
    const htAmount = ttcAmount / (1 + tvaRate / 100)
    const tvaAmount = ttcAmount - htAmount

    setResults({
      ht: htAmount.toFixed(2),
      ttc: ttcAmount.toFixed(2),
      tvaAmount: tvaAmount.toFixed(2),
    })
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Montant (€)"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="100.00"
        />
        <Select
          label="Taux de TVA"
          value={tva}
          onChange={(e) => setTva(e.target.value)}
          options={[
            { value: '20', label: '20% (taux normal)' },
            { value: '10', label: '10% (taux intermédiaire)' },
            { value: '5.5', label: '5,5% (taux réduit)' },
            { value: '2.1', label: '2,1% (taux super-réduit)' },
            { value: '0', label: '0% (exonéré)' },
          ]}
        />
      </div>

      <div className="flex gap-3">
        <Button onClick={calculate}>HT → TTC</Button>
        <Button onClick={calculateReverse} variant="secondary">
          TTC → HT
        </Button>
      </div>

      {results && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <div className="text-sm text-blue-600 dark:text-blue-400 mb-1">Prix HT</div>
            <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
              {results.ht} €
            </div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <div className="text-sm text-green-600 dark:text-green-400 mb-1">Prix TTC</div>
            <div className="text-2xl font-bold text-green-700 dark:text-green-300">
              {results.ttc} €
            </div>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
            <div className="text-sm text-purple-600 dark:text-purple-400 mb-1">Montant TVA</div>
            <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
              {results.tvaAmount} €
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
