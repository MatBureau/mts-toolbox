'use client'

import { useState } from 'react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import CopyButton from '@/components/ui/CopyButton'

export default function GenerateurSlug() {
  const [text, setText] = useState('')
  const [result, setResult] = useState('')

  const generateSlug = () => {
    const slug = text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
    setResult(slug)
  }

  return (
    <div className="space-y-6">
      <Input
        label="Texte"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Mon Super Article 2024!"
      />

      <Button onClick={generateSlug}>Générer le slug</Button>

      {result && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Slug généré
            </label>
            <CopyButton text={result} />
          </div>
          <Input value={result} readOnly />
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            URL: https://example.com/<span className="text-primary-600">{result}</span>
          </p>
        </div>
      )}
    </div>
  )
}
