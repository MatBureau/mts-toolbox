'use client'

import { useState } from 'react'
import Textarea from '@/components/ui/Textarea'
import Button from '@/components/ui/Button'
import CopyButton from '@/components/ui/CopyButton'
import Select from '@/components/ui/Select'

export default function Minificateur() {
  const [input, setInput] = useState('')
  const [result, setResult] = useState('')
  const [type, setType] = useState('js')

  const minify = () => {
    let minified = input
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\/\/.*/g, '')
      .replace(/\s+/g, ' ')
      .replace(/\s*([{};:,()=])\s*/g, '$1')
      .trim()

    setResult(minified)
  }

  return (
    <div className="space-y-6">
      <Select
        label="Type"
        value={type}
        onChange={(e) => setType(e.target.value)}
        options={[
          { value: 'js', label: 'JavaScript' },
          { value: 'css', label: 'CSS' },
          { value: 'html', label: 'HTML' },
        ]}
      />

      <Textarea
        label={`Code ${type.toUpperCase()}`}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        rows={10}
        placeholder="Entrez votre code..."
      />

      <Button onClick={minify}>Minifier</Button>

      {result && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Résultat ({input.length} → {result.length} caractères, {Math.round((1 - result.length / input.length) * 100)}% de réduction)
            </label>
            <CopyButton text={result} />
          </div>
          <Textarea value={result} readOnly rows={8} className="font-mono text-sm" />
        </div>
      )}
    </div>
  )
}
