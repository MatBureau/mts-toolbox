'use client'

import { useState } from 'react'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'

const conversions: Record<string, Record<string, number>> = {
  longueur: {
    'Millimètre (mm)': 1,
    'Centimètre (cm)': 10,
    'Mètre (m)': 1000,
    'Kilomètre (km)': 1000000,
    'Pouce (in)': 25.4,
    'Pied (ft)': 304.8,
    'Yard (yd)': 914.4,
    'Mile (mi)': 1609344,
  },
  poids: {
    'Milligramme (mg)': 1,
    'Gramme (g)': 1000,
    'Kilogramme (kg)': 1000000,
    'Tonne (t)': 1000000000,
    'Once (oz)': 28349.5,
    'Livre (lb)': 453592,
  },
  volume: {
    'Millilitre (ml)': 1,
    'Centilitre (cl)': 10,
    'Litre (L)': 1000,
    'Mètre cube (m³)': 1000000,
    'Once liquide (fl oz)': 29.5735,
    'Gallon US (gal)': 3785.41,
  },
}

export default function ConvertisseurUnites() {
  const [category, setCategory] = useState('longueur')
  const [fromUnit, setFromUnit] = useState('Mètre (m)')
  const [toUnit, setToUnit] = useState('Centimètre (cm)')
  const [value, setValue] = useState('')
  const [result, setResult] = useState('')

  const convert = () => {
    const val = parseFloat(value)
    if (isNaN(val)) return

    const units = conversions[category]
    const fromBase = val * units[fromUnit]
    const toValue = fromBase / units[toUnit]

    setResult(`${val} ${fromUnit} = ${toValue.toFixed(6)} ${toUnit}`)
  }

  const handleCategoryChange = (newCategory: string) => {
    setCategory(newCategory)
    const firstUnit = Object.keys(conversions[newCategory])[0]
    const secondUnit = Object.keys(conversions[newCategory])[1]
    setFromUnit(firstUnit)
    setToUnit(secondUnit)
    setResult('')
  }

  const units = Object.keys(conversions[category])

  return (
    <div className="space-y-6">
      <Select
        label="Catégorie"
        value={category}
        onChange={(e) => handleCategoryChange(e.target.value)}
        options={[
          { value: 'longueur', label: 'Longueur' },
          { value: 'poids', label: 'Poids / Masse' },
          { value: 'volume', label: 'Volume' },
        ]}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          label="Valeur"
          type="number"
          value={value}
          onChange={(e) => {
            setValue(e.target.value)
            if (e.target.value) convert()
          }}
          placeholder="1"
        />
        <Select
          label="De"
          value={fromUnit}
          onChange={(e) => {
            setFromUnit(e.target.value)
            if (value) convert()
          }}
          options={units.map((u) => ({ value: u, label: u }))}
        />
        <Select
          label="Vers"
          value={toUnit}
          onChange={(e) => {
            setToUnit(e.target.value)
            if (value) convert()
          }}
          options={units.map((u) => ({ value: u, label: u }))}
        />
      </div>

      {result && (
        <div className="bg-primary-50 dark:bg-primary-900/20 p-4 rounded-lg">
          <p className="text-lg font-semibold text-primary-700 dark:text-primary-400">
            {result}
          </p>
        </div>
      )}
    </div>
  )
}
