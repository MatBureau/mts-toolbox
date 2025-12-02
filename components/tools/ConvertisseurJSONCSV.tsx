'use client'

import { useState } from 'react'
import Textarea from '@/components/ui/Textarea'
import Button from '@/components/ui/Button'
import CopyButton from '@/components/ui/CopyButton'

export default function ConvertisseurJSONCSV() {
  const [input, setInput] = useState('')
  const [result, setResult] = useState('')
  const [error, setError] = useState('')

  const jsonToCSV = () => {
    try {
      const data = JSON.parse(input)
      if (!Array.isArray(data)) {
        throw new Error('Le JSON doit être un tableau d\'objets')
      }
      if (data.length === 0) {
        setResult('')
        return
      }

      const headers = Object.keys(data[0])
      const csvLines = [headers.join(',')]

      data.forEach((row) => {
        const values = headers.map((header) => {
          const value = row[header] || ''
          return typeof value === 'string' && value.includes(',') ? `"${value}"` : value
        })
        csvLines.push(values.join(','))
      })

      setResult(csvLines.join('\n'))
      setError('')
    } catch (err) {
      setError((err as Error).message)
      setResult('')
    }
  }

  const csvToJSON = () => {
    try {
      const lines = input.trim().split('\n')
      if (lines.length < 2) {
        throw new Error('Le CSV doit contenir au moins une ligne d\'en-têtes et une ligne de données')
      }

      const headers = lines[0].split(',').map((h) => h.trim())
      const data = lines.slice(1).map((line) => {
        const values = line.split(',').map((v) => v.trim().replace(/^"|"$/g, ''))
        const obj: Record<string, string> = {}
        headers.forEach((header, index) => {
          obj[header] = values[index] || ''
        })
        return obj
      })

      setResult(JSON.stringify(data, null, 2))
      setError('')
    } catch (err) {
      setError((err as Error).message)
      setResult('')
    }
  }

  return (
    <div className="space-y-6">
      <Textarea
        label="Entrée"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        rows={10}
        placeholder='[{"name":"John","age":30}] ou name,age\nJohn,30'
      />

      <div className="flex gap-3">
        <Button onClick={jsonToCSV}>JSON → CSV</Button>
        <Button onClick={csvToJSON} variant="secondary">CSV → JSON</Button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      {result && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Résultat
            </label>
            <CopyButton text={result} />
          </div>
          <Textarea value={result} readOnly rows={12} className="font-mono text-sm" />
        </div>
      )}
    </div>
  )
}
