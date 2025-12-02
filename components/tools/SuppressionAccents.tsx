'use client'

import { useState } from 'react'
import Textarea from '@/components/ui/Textarea'
import Button from '@/components/ui/Button'
import CopyButton from '@/components/ui/CopyButton'

export default function SuppressionAccents() {
  const [text, setText] = useState('')
  const [result, setResult] = useState('')

  const removeAccents = () => {
    const withoutAccents = text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[œ]/g, 'oe')
      .replace(/[Œ]/g, 'OE')
      .replace(/[æ]/g, 'ae')
      .replace(/[Æ]/g, 'AE')
    setResult(withoutAccents)
  }

  return (
    <div className="space-y-6">
      <Textarea
        label="Texte avec accents"
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={6}
        placeholder="Entrez votre texte avec accents..."
      />

      <Button onClick={removeAccents}>Supprimer les accents</Button>

      {result && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Résultat
            </label>
            <CopyButton text={result} />
          </div>
          <Textarea value={result} readOnly rows={6} />
        </div>
      )}
    </div>
  )
}
