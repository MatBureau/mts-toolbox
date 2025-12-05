'use client'

import { useState, useEffect, useMemo } from 'react'
import Select from '@/components/ui/Select'
import Input from '@/components/ui/Input'
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card'

type SizeSystem = {
  [key: string]: string[]
}

type SizeConversions = {
  [key: string]: SizeSystem
}

export default function ConvertisseurTailles() {
  const [category, setCategory] = useState<string>('women-clothes')
  const [inputSystem, setInputSystem] = useState<string>('eu')
  const [inputSize, setInputSize] = useState<string>('')
  const [results, setResults] = useState<{ system: string; size: string }[]>([])

  const sizeConversions = useMemo<SizeConversions>(() => ({
    'women-clothes': {
      eu: ['32', '34', '36', '38', '40', '42', '44', '46', '48'],
      us: ['0', '2', '4', '6', '8', '10', '12', '14', '16'],
      uk: ['4', '6', '8', '10', '12', '14', '16', '18', '20'],
    },
    'men-clothes': {
      eu: ['44', '46', '48', '50', '52', '54', '56', '58', '60'],
      us: ['34', '36', '38', '40', '42', '44', '46', '48', '50'],
      uk: ['34', '36', '38', '40', '42', '44', '46', '48', '50'],
    },
    'shoes-women': {
      eu: ['35', '36', '37', '38', '39', '40', '41', '42', '43'],
      us: ['5', '6', '6.5', '7.5', '8.5', '9', '10', '10.5', '11.5'],
      uk: ['2.5', '3.5', '4', '5', '6', '6.5', '7.5', '8', '9'],
    },
    'shoes-men': {
      eu: ['39', '40', '41', '42', '43', '44', '45', '46', '47'],
      us: ['6', '7', '7.5', '8.5', '9.5', '10', '11', '11.5', '12.5'],
      uk: ['6', '6.5', '7.5', '8', '9', '9.5', '10.5', '11', '12'],
    },
  }), [])

  useEffect(() => {
    if (!inputSize) {
      setResults([])
      return
    }

    const conversions = sizeConversions[category]
    if (!conversions) {
      setResults([])
      return
    }

    const index = conversions[inputSystem].indexOf(inputSize)
    if (index === -1) {
      setResults([])
      return
    }

    const result = []
    for (const [system, sizes] of Object.entries(conversions)) {
      if (system !== inputSystem) {
        result.push({
          system: system.toUpperCase(),
          size: (sizes as string[])[index],
        })
      }
    }

    setResults(result)
  }, [category, inputSystem, inputSize, sizeConversions])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Catégorie</CardTitle>
        </CardHeader>
        <CardContent>
          <Select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value)
              setInputSize('')
              setResults([])
            }}
            options={[
              { value: 'women-clothes', label: 'Vêtements Femme' },
              { value: 'men-clothes', label: 'Vêtements Homme' },
              { value: 'shoes-women', label: 'Chaussures Femme' },
              { value: 'shoes-men', label: 'Chaussures Homme' },
            ]}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Votre taille</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select
            label="Système"
            value={inputSystem}
            onChange={(e) => {
              setInputSystem(e.target.value)
              setInputSize('')
              setResults([])
            }}
            options={[
              { value: 'eu', label: 'EU (Europe)' },
              { value: 'us', label: 'US (États-Unis)' },
              { value: 'uk', label: 'UK (Royaume-Uni)' },
            ]}
          />

          <Select
            label="Taille"
            value={inputSize}
            onChange={(e) => setInputSize(e.target.value)}
            options={[
              { value: '', label: 'Sélectionnez une taille' },
              ...sizeConversions[category][inputSystem].map((size: string) => ({
                value: size,
                label: size,
              })),
            ]}
          />
        </CardContent>
      </Card>

      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Conversions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {results.map((result, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <span className="font-semibold">{result.system}</span>
                  <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                    {result.size}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
