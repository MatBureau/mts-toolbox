'use client'

import { useState } from 'react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

export default function CalculateurDates() {
  const [date1, setDate1] = useState('')
  const [date2, setDate2] = useState('')
  const [result, setResult] = useState<{
    days: number
    weeks: number
    months: number
    years: number
  } | null>(null)

  const calculate = () => {
    if (!date1 || !date2) return

    const d1 = new Date(date1)
    const d2 = new Date(date2)

    const diffTime = Math.abs(d2.getTime() - d1.getTime())
    const days = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    const weeks = Math.floor(days / 7)
    const months = Math.floor(days / 30.44)
    const years = Math.floor(days / 365.25)

    setResult({ days, weeks, months, years })
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Date de début"
          type="date"
          value={date1}
          onChange={(e) => setDate1(e.target.value)}
        />
        <Input
          label="Date de fin"
          type="date"
          value={date2}
          onChange={(e) => setDate2(e.target.value)}
        />
      </div>

      <Button onClick={calculate}>Calculer la différence</Button>

      {result && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-center">
            <div className="text-3xl font-bold text-blue-700 dark:text-blue-300">
              {result.days}
            </div>
            <div className="text-sm text-blue-600 dark:text-blue-400">Jours</div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg text-center">
            <div className="text-3xl font-bold text-green-700 dark:text-green-300">
              {result.weeks}
            </div>
            <div className="text-sm text-green-600 dark:text-green-400">Semaines</div>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg text-center">
            <div className="text-3xl font-bold text-purple-700 dark:text-purple-300">
              {result.months}
            </div>
            <div className="text-sm text-purple-600 dark:text-purple-400">Mois</div>
          </div>
          <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg text-center">
            <div className="text-3xl font-bold text-orange-700 dark:text-orange-300">
              {result.years}
            </div>
            <div className="text-sm text-orange-600 dark:text-orange-400">Années</div>
          </div>
        </div>
      )}
    </div>
  )
}
