'use client'

import { useState } from 'react'
import Textarea from '@/components/ui/Textarea'
import Button from '@/components/ui/Button'
import CopyButton from '@/components/ui/CopyButton'

export default function FormateurSQL() {
  const [input, setInput] = useState('')
  const [result, setResult] = useState('')

  const formatSQL = () => {
    let formatted = input
      .replace(/\s+/g, ' ')
      .replace(/\s*,\s*/g, ',\n  ')
      .replace(/\s*(SELECT|FROM|WHERE|JOIN|LEFT JOIN|RIGHT JOIN|INNER JOIN|ORDER BY|GROUP BY|HAVING|LIMIT|OFFSET)\s+/gi, '\n$1 ')
      .replace(/\s*(\(|\))\s*/g, ' $1 ')
      .trim()

    setResult(formatted)
  }

  return (
    <div className="space-y-6">
      <Textarea
        label="Requête SQL"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        rows={8}
        placeholder="SELECT * FROM users WHERE id=1"
      />

      <Button onClick={formatSQL}>Formater</Button>

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
