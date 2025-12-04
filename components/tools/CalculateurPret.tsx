'use client'

import { useState } from 'react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card'

export default function CalculateurPret() {
  const [amount, setAmount] = useState<string>('200000')
  const [duration, setDuration] = useState<string>('20')
  const [rate, setRate] = useState<string>('3.5')
  const [result, setResult] = useState<any>(null)

  const calculateLoan = () => {
    const principal = parseFloat(amount)
    const years = parseFloat(duration)
    const annualRate = parseFloat(rate)

    if (isNaN(principal) || isNaN(years) || isNaN(annualRate) || principal <= 0 || years <= 0) {
      return
    }

    const monthlyRate = annualRate / 100 / 12
    const numberOfPayments = years * 12

    const monthlyPayment =
      (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1)

    const totalAmount = monthlyPayment * numberOfPayments
    const totalInterest = totalAmount - principal

    setResult({
      monthlyPayment,
      totalAmount,
      totalInterest,
      numberOfPayments,
    })
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(value)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Informations du prêt</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Montant emprunté (€)"
            type="number"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value)
              setResult(null)
            }}
            min="0"
            step="1000"
          />

          <Input
            label="Durée (années)"
            type="number"
            value={duration}
            onChange={(e) => {
              setDuration(e.target.value)
              setResult(null)
            }}
            min="1"
            max="30"
            step="1"
          />

          <Input
            label="Taux d'intérêt annuel (%)"
            type="number"
            value={rate}
            onChange={(e) => {
              setRate(e.target.value)
              setResult(null)
            }}
            min="0"
            max="20"
            step="0.1"
          />

          <Button onClick={calculateLoan} className="w-full">
            Calculer
          </Button>
        </CardContent>
      </Card>

      {result && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Mensualité</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary-600 dark:text-primary-400">
                  {formatCurrency(result.monthlyPayment)}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  par mois pendant {result.numberOfPayments} mois
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Détails du prêt</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span>Montant emprunté</span>
                  <span className="font-semibold">{formatCurrency(parseFloat(amount))}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span>Intérêts totaux</span>
                  <span className="font-semibold text-orange-600 dark:text-orange-400">
                    {formatCurrency(result.totalInterest)}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                  <span className="font-semibold">Coût total</span>
                  <span className="font-bold text-lg text-primary-600 dark:text-primary-400">
                    {formatCurrency(result.totalAmount)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                ℹ️ Ce calcul est basé sur un taux fixe et ne prend pas en compte les frais de
                dossier, assurance emprunteur, ou autres frais annexes. Consultez votre banque
                pour une simulation personnalisée.
              </p>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
