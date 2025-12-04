'use client'

import { useState } from 'react'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card'

export default function CalculateurSalaire() {
  const [type, setType] = useState<string>('brut-net')
  const [status, setStatus] = useState<string>('cadre')
  const [amount, setAmount] = useState<string>('')
  const [result, setResult] = useState<number | null>(null)

  const calculateSalary = () => {
    const value = parseFloat(amount)
    if (isNaN(value) || value <= 0) return

    const chargesRate = status === 'cadre' ? 0.25 : 0.22

    if (type === 'brut-net') {
      setResult(value * (1 - chargesRate))
    } else {
      setResult(value / (1 - chargesRate))
    }
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
          <CardTitle>Type de conversion</CardTitle>
        </CardHeader>
        <CardContent>
          <Select
            value={type}
            onChange={(e) => {
              setType(e.target.value)
              setResult(null)
            }}
            options={[
              { value: 'brut-net', label: 'Brut → Net' },
              { value: 'net-brut', label: 'Net → Brut' },
            ]}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Statut</CardTitle>
        </CardHeader>
        <CardContent>
          <Select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value)
              setResult(null)
            }}
            options={[
              { value: 'non-cadre', label: 'Non-cadre (~22% de charges)' },
              { value: 'cadre', label: 'Cadre (~25% de charges)' },
            ]}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            {type === 'brut-net' ? 'Salaire brut' : 'Salaire net'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            type="number"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value)
              setResult(null)
            }}
            placeholder="Montant en €"
            min="0"
            step="0.01"
          />
          <Button onClick={calculateSalary} className="w-full">
            Calculer
          </Button>
        </CardContent>
      </Card>

      {result !== null && (
        <Card>
          <CardHeader>
            <CardTitle>
              {type === 'brut-net' ? 'Salaire net' : 'Salaire brut'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-600 dark:text-primary-400 mb-2">
                {formatCurrency(result)}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                par mois
              </p>
              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                  {formatCurrency(result * 12)}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  par an
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            ⚠️ Ce calcul est approximatif et basé sur des taux moyens de charges sociales en France.
            Les taux réels peuvent varier selon votre situation. Consultez un expert comptable pour
            des calculs précis.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
