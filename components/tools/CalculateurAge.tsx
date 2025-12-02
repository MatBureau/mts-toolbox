'use client'

import { useState } from 'react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

export default function CalculateurAge() {
  const [birthDate, setBirthDate] = useState('')
  const [result, setResult] = useState<{
    years: number
    months: number
    days: number
    totalDays: number
    nextBirthday: string
  } | null>(null)

  const calculate = () => {
    if (!birthDate) return

    const birth = new Date(birthDate)
    const today = new Date()

    let years = today.getFullYear() - birth.getFullYear()
    let months = today.getMonth() - birth.getMonth()
    let days = today.getDate() - birth.getDate()

    if (days < 0) {
      months--
      const lastMonth = new Date(today.getFullYear(), today.getMonth(), 0)
      days += lastMonth.getDate()
    }

    if (months < 0) {
      years--
      months += 12
    }

    // Calcul du nombre total de jours
    const diffTime = Math.abs(today.getTime() - birth.getTime())
    const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    // Prochain anniversaire
    let nextBirthday = new Date(today.getFullYear(), birth.getMonth(), birth.getDate())
    if (nextBirthday < today) {
      nextBirthday = new Date(today.getFullYear() + 1, birth.getMonth(), birth.getDate())
    }
    const daysUntilBirthday = Math.floor(
      (nextBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    )

    setResult({
      years,
      months,
      days,
      totalDays,
      nextBirthday: `Dans ${daysUntilBirthday} jour${daysUntilBirthday > 1 ? 's' : ''}`,
    })
  }

  return (
    <div className="space-y-6">
      <Input
        label="Date de naissance"
        type="date"
        value={birthDate}
        onChange={(e) => setBirthDate(e.target.value)}
      />

      <Button onClick={calculate}>Calculer mon âge</Button>

      {result && (
        <div className="space-y-4">
          <div className="bg-primary-50 dark:bg-primary-900/20 p-6 rounded-lg text-center">
            <div className="text-4xl font-bold text-primary-700 dark:text-primary-300 mb-2">
              {result.years} ans
            </div>
            <div className="text-lg text-primary-600 dark:text-primary-400">
              {result.months} mois et {result.days} jours
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {result.totalDays.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Jours vécus</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {result.nextBirthday}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Prochain anniversaire</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
