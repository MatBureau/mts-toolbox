'use client'

import { useState, useMemo } from 'react'
import Input from '@/components/ui/Input'
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card'

export default function SimulateurInterets() {
  const [capital, setCapital] = useState(10000)
  const [monthlyDeposit, setMonthlyDeposit] = useState(200)
  const [rate, setRate] = useState(5)
  const [years, setYears] = useState(10)
  const [frequency, setFrequency] = useState<'yearly' | 'monthly'>('yearly')

  const calculation = useMemo(() => {
    const r = rate / 100
    const n = frequency === 'yearly' ? 1 : 12
    const t = years
    const P = capital
    const PMT = frequency === 'monthly' ? monthlyDeposit : monthlyDeposit * 12

    // Calcul des intérêts composés avec versements réguliers
    const totalPeriods = n * t

    // Valeur future du capital initial
    const futureValueCapital = P * Math.pow(1 + r / n, totalPeriods)

    // Valeur future des versements
    let futureValueDeposits = 0
    if (PMT > 0 && r > 0) {
      const ratePerPeriod = r / n
      futureValueDeposits = PMT * ((Math.pow(1 + ratePerPeriod, totalPeriods) - 1) / ratePerPeriod)
    } else if (PMT > 0) {
      futureValueDeposits = PMT * totalPeriods
    }

    const totalValue = futureValueCapital + futureValueDeposits
    const totalDeposits = P + (frequency === 'monthly' ? PMT * 12 * t : PMT * t)
    const totalInterest = totalValue - totalDeposits

    // Évolution année par année
    const evolution: { year: number; value: number; deposits: number; interest: number }[] = []
    for (let year = 1; year <= years; year++) {
      const periods = n * year
      const valueCapital = P * Math.pow(1 + r / n, periods)
      let valueDeposits = 0
      if (PMT > 0 && r > 0) {
        const ratePerPeriod = r / n
        valueDeposits = PMT * ((Math.pow(1 + ratePerPeriod, periods) - 1) / ratePerPeriod)
      } else if (PMT > 0) {
        valueDeposits = PMT * periods
      }
      const totalYearValue = valueCapital + valueDeposits
      const totalYearDeposits = P + (frequency === 'monthly' ? PMT * 12 * year : PMT * year)
      const totalYearInterest = totalYearValue - totalYearDeposits

      evolution.push({
        year,
        value: totalYearValue,
        deposits: totalYearDeposits,
        interest: totalYearInterest,
      })
    }

    return {
      totalValue,
      totalDeposits,
      totalInterest,
      evolution,
    }
  }, [capital, monthlyDeposit, rate, years, frequency])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Paramètres</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Capital initial (€)"
            type="number"
            value={capital}
            onChange={(e) => setCapital(Number(e.target.value))}
          />

          <Input
            label="Versement mensuel (€)"
            type="number"
            value={monthlyDeposit}
            onChange={(e) => setMonthlyDeposit(Number(e.target.value))}
          />

          <Input
            label="Taux d'intérêt annuel (%)"
            type="number"
            step="0.1"
            value={rate}
            onChange={(e) => setRate(Number(e.target.value))}
          />

          <Input
            label="Durée (années)"
            type="number"
            value={years}
            onChange={(e) => setYears(Number(e.target.value))}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Fréquence de capitalisation
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => setFrequency('yearly')}
                className={`px-4 py-2 rounded-lg ${
                  frequency === 'yearly'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                Annuelle
              </button>
              <button
                onClick={() => setFrequency('monthly')}
                className={`px-4 py-2 rounded-lg ${
                  frequency === 'monthly'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                Mensuelle
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Résultat après {years} ans</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Valeur finale</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {calculation.totalValue.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
              </p>
            </div>
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Intérêts gagnés</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {calculation.totalInterest.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
              </p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total versé</p>
              <p className="text-2xl font-bold text-gray-700 dark:text-gray-300">
                {calculation.totalDeposits.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Évolution année par année</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-2 px-3 font-semibold text-gray-700 dark:text-gray-300">Année</th>
                  <th className="text-right py-2 px-3 font-semibold text-gray-700 dark:text-gray-300">Versements</th>
                  <th className="text-right py-2 px-3 font-semibold text-gray-700 dark:text-gray-300">Intérêts</th>
                  <th className="text-right py-2 px-3 font-semibold text-gray-700 dark:text-gray-300">Total</th>
                </tr>
              </thead>
              <tbody>
                {calculation.evolution.map((row) => (
                  <tr key={row.year} className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-2 px-3 text-gray-900 dark:text-gray-100">{row.year}</td>
                    <td className="text-right py-2 px-3 text-gray-700 dark:text-gray-300">
                      {row.deposits.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} €
                    </td>
                    <td className="text-right py-2 px-3 text-green-600 dark:text-green-400">
                      {row.interest.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} €
                    </td>
                    <td className="text-right py-2 px-3 font-semibold text-blue-600 dark:text-blue-400">
                      {row.value.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} €
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>💡 Comprendre les intérêts composés</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300 list-disc list-inside">
            <li>Les intérêts composés génèrent des intérêts sur les intérêts précédents</li>
            <li>Plus vous commencez tôt, plus l'effet est puissant (effet boule de neige)</li>
            <li>Des versements réguliers amplifient significativement le résultat</li>
            <li>La capitalisation mensuelle est légèrement plus avantageuse que l'annuelle</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
