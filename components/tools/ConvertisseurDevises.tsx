'use client'

import { useState, useEffect } from 'react'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card'

export default function ConvertisseurDevises() {
  const [amount, setAmount] = useState<string>('100')
  const [fromCurrency, setFromCurrency] = useState<string>('EUR')
  const [toCurrency, setToCurrency] = useState<string>('USD')
  const [result, setResult] = useState<number | null>(null)
  const [rates, setRates] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const currencies = [
    { value: 'EUR', label: 'EUR - Euro' },
    { value: 'USD', label: 'USD - Dollar américain' },
    { value: 'GBP', label: 'GBP - Livre sterling' },
    { value: 'CHF', label: 'CHF - Franc suisse' },
    { value: 'JPY', label: 'JPY - Yen japonais' },
    { value: 'CAD', label: 'CAD - Dollar canadien' },
    { value: 'AUD', label: 'AUD - Dollar australien' },
    { value: 'CNY', label: 'CNY - Yuan chinois' },
  ]

  const staticRates: any = {
    EUR: { EUR: 1, USD: 1.09, GBP: 0.86, CHF: 0.95, JPY: 162.5, CAD: 1.48, AUD: 1.66, CNY: 7.85 },
    USD: { EUR: 0.92, USD: 1, GBP: 0.79, CHF: 0.87, JPY: 149.2, CAD: 1.36, AUD: 1.52, CNY: 7.21 },
    GBP: { EUR: 1.16, USD: 1.27, GBP: 1, CHF: 1.10, JPY: 189.0, CAD: 1.72, AUD: 1.93, CNY: 9.12 },
    CHF: { EUR: 1.05, USD: 1.15, GBP: 0.91, CHF: 1, JPY: 171.8, CAD: 1.56, AUD: 1.75, CNY: 8.28 },
    JPY: { EUR: 0.0062, USD: 0.0067, GBP: 0.0053, CHF: 0.0058, JPY: 1, CAD: 0.0091, AUD: 0.010, CNY: 0.048 },
    CAD: { EUR: 0.68, USD: 0.74, GBP: 0.58, CHF: 0.64, JPY: 110.0, CAD: 1, AUD: 1.12, CNY: 5.31 },
    AUD: { EUR: 0.60, USD: 0.66, GBP: 0.52, CHF: 0.57, JPY: 98.2, CAD: 0.89, AUD: 1, CNY: 4.73 },
    CNY: { EUR: 0.13, USD: 0.14, GBP: 0.11, CHF: 0.12, JPY: 20.8, CAD: 0.19, AUD: 0.21, CNY: 1 },
  }

  useEffect(() => {
    setRates(staticRates)
  }, [])

  const convert = () => {
    const value = parseFloat(amount)
    if (isNaN(value) || value <= 0 || !rates) return

    const rate = rates[fromCurrency][toCurrency]
    setResult(value * rate)
  }

  const swapCurrencies = () => {
    setFromCurrency(toCurrency)
    setToCurrency(fromCurrency)
    setResult(null)
  }

  const formatCurrency = (value: number, currency: string) => {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value) + ' ' + currency
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            ℹ️ Les taux de change sont indicatifs et peuvent varier. Consultez votre banque pour
            les taux officiels.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Montant à convertir</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            type="number"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value)
              setResult(null)
            }}
            placeholder="Montant"
            min="0"
            step="0.01"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="De"
              value={fromCurrency}
              onChange={(e) => {
                setFromCurrency(e.target.value)
                setResult(null)
              }}
              options={currencies}
            />

            <Select
              label="Vers"
              value={toCurrency}
              onChange={(e) => {
                setToCurrency(e.target.value)
                setResult(null)
              }}
              options={currencies}
            />
          </div>

          <div className="flex space-x-2">
            <Button onClick={convert} className="flex-1">
              Convertir
            </Button>
            <Button onClick={swapCurrencies} variant="outline">
              ⇄
            </Button>
          </div>
        </CardContent>
      </Card>

      {result !== null && (
        <Card>
          <CardHeader>
            <CardTitle>Résultat</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <div>
                <div className="text-2xl text-gray-600 dark:text-gray-400 mb-2">
                  {formatCurrency(parseFloat(amount), fromCurrency)}
                </div>
                <div className="text-4xl font-bold text-primary-600 dark:text-primary-400">
                  {formatCurrency(result, toCurrency)}
                </div>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Taux: 1 {fromCurrency} = {rates[fromCurrency][toCurrency].toFixed(4)} {toCurrency}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
