'use client'

import { useState } from 'react'
import Textarea from '@/components/ui/Textarea'
import Button from '@/components/ui/Button'
import CopyButton from '@/components/ui/CopyButton'

export default function EncodeurURL() {
  const [text, setText] = useState('')
  const [result, setResult] = useState('')

  const encode = () => {
    try {
      setResult(encodeURIComponent(text))
    } catch (err) {
      setResult('Erreur lors de l\'encodage')
    }
  }

  const decode = () => {
    try {
      setResult(decodeURIComponent(text))
    } catch (err) {
      setResult('Erreur lors du décodage')
    }
  }

  return (
    <div className="space-y-6">
      <Textarea
        label="Texte ou URL"
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={6}
        placeholder="Entrez votre texte ou URL..."
      />

      <div className="flex gap-3">
        <Button onClick={encode}>Encoder</Button>
        <Button onClick={decode} variant="secondary">Décoder</Button>
      </div>

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
