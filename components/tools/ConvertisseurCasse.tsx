'use client'

import { useState } from 'react'
import Textarea from '@/components/ui/Textarea'
import Button from '@/components/ui/Button'
import CopyButton from '@/components/ui/CopyButton'

export default function ConvertisseurCasse() {
  const [text, setText] = useState('')
  const [result, setResult] = useState('')

  const toUpperCase = () => setResult(text.toUpperCase())
  const toLowerCase = () => setResult(text.toLowerCase())
  const toTitleCase = () => {
    const result = text.replace(/\w\S*/g, (txt) => {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    })
    setResult(result)
  }
  const toSentenceCase = () => {
    const result = text.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase())
    setResult(result)
  }

  return (
    <div className="space-y-6">
      <Textarea
        label="Texte à convertir"
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={6}
        placeholder="Entrez votre texte..."
      />

      <div className="flex flex-wrap gap-3">
        <Button onClick={toUpperCase}>MAJUSCULES</Button>
        <Button onClick={toLowerCase}>minuscules</Button>
        <Button onClick={toTitleCase}>Titre (Chaque Mot)</Button>
        <Button onClick={toSentenceCase}>Phrase (Première lettre)</Button>
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
