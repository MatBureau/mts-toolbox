'use client'

import { useState, useEffect } from 'react'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'

export default function TesteurRegex() {
  const [pattern, setPattern] = useState('')
  const [flags, setFlags] = useState('g')
  const [testText, setTestText] = useState('')
  const [matches, setMatches] = useState<string[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    if (pattern && testText) {
      try {
        const regex = new RegExp(pattern, flags)
        const found = testText.match(regex)
        setMatches(found || [])
        setError('')
      } catch (err) {
        setError((err as Error).message)
        setMatches([])
      }
    }
  }, [pattern, flags, testText])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <Input
            label="Expression régulière"
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            placeholder="\d{3}-\d{4}"
          />
        </div>
        <Input
          label="Flags"
          value={flags}
          onChange={(e) => setFlags(e.target.value)}
          placeholder="g, i, m, s..."
        />
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      <Textarea
        label="Texte de test"
        value={testText}
        onChange={(e) => setTestText(e.target.value)}
        rows={8}
        placeholder="Entrez le texte à tester..."
      />

      {matches.length > 0 && (
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
          <h3 className="font-semibold mb-3 text-green-700 dark:text-green-400">
            {matches.length} correspondance(s) trouvée(s)
          </h3>
          <div className="space-y-1">
            {matches.map((match, index) => (
              <div key={index} className="font-mono text-sm text-green-700 dark:text-green-400">
                [{index}]: "{match}"
              </div>
            ))}
          </div>
        </div>
      )}

      {!error && matches.length === 0 && testText && pattern && (
        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg text-gray-600 dark:text-gray-400">
          Aucune correspondance trouvée
        </div>
      )}
    </div>
  )
}
