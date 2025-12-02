'use client'

import { useState } from 'react'
import Textarea from '@/components/ui/Textarea'
import Button from '@/components/ui/Button'
import CopyButton from '@/components/ui/CopyButton'

export default function EncodeurBase64() {
  const [text, setText] = useState('')
  const [result, setResult] = useState('')

  const encode = () => {
    try {
      setResult(btoa(unescape(encodeURIComponent(text))))
    } catch (err) {
      setResult('Erreur lors de l\'encodage')
    }
  }

  const decode = () => {
    try {
      setResult(decodeURIComponent(escape(atob(text))))
    } catch (err) {
      setResult('Erreur lors du décodage - vérifiez que le texte est bien en Base64')
    }
  }

  return (
    <div className="space-y-6">
      <Textarea
        label="Texte"
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={6}
        placeholder="Entrez votre texte..."
      />

      <div className="flex gap-3">
        <Button onClick={encode}>Encoder en Base64</Button>
        <Button onClick={decode} variant="secondary">Décoder depuis Base64</Button>
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
