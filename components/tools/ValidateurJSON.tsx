'use client'

import { useState } from 'react'
import Textarea from '@/components/ui/Textarea'
import Button from '@/components/ui/Button'

export default function ValidateurJSON() {
  const [input, setInput] = useState('')
  const [isValid, setIsValid] = useState<boolean | null>(null)
  const [error, setError] = useState('')

  const validateJSON = () => {
    try {
      JSON.parse(input)
      setIsValid(true)
      setError('')
    } catch (err) {
      setIsValid(false)
      setError((err as Error).message)
    }
  }

  return (
    <div className="space-y-6">
      <Textarea
        label="JSON à valider"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        rows={12}
        placeholder='{"name":"John","age":30}'
      />

      <Button onClick={validateJSON}>Valider</Button>

      {isValid === true && (
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg text-green-700 dark:text-green-400">
          ✓ JSON valide
        </div>
      )}

      {isValid === false && (
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg text-red-700 dark:text-red-400">
          ✗ JSON invalide : {error}
        </div>
      )}
    </div>
  )
}
