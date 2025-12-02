'use client'

import { useState } from 'react'
import Textarea from '@/components/ui/Textarea'
import Button from '@/components/ui/Button'
import CopyButton from '@/components/ui/CopyButton'

export default function FormateurJSON() {
  const [input, setInput] = useState('')
  const [result, setResult] = useState('')
  const [error, setError] = useState('')

  const formatJSON = () => {
    try {
      const parsed = JSON.parse(input)
      setResult(JSON.stringify(parsed, null, 2))
      setError('')
    } catch (err) {
      setError('JSON invalide : ' + (err as Error).message)
      setResult('')
    }
  }

  const minifyJSON = () => {
    try {
      const parsed = JSON.parse(input)
      setResult(JSON.stringify(parsed))
      setError('')
    } catch (err) {
      setError('JSON invalide : ' + (err as Error).message)
      setResult('')
    }
  }

  return (
    <div className="space-y-6">
      <Textarea
        label="JSON à formater"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        rows={10}
        placeholder='{"name":"John","age":30}'
      />

      <div className="flex gap-3">
        <Button onClick={formatJSON}>Formater (Embellir)</Button>
        <Button onClick={minifyJSON} variant="secondary">Minifier</Button>
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
          <Textarea value={result} readOnly rows={15} className="font-mono text-sm" />
        </div>
      )}
    </div>
  )
}
