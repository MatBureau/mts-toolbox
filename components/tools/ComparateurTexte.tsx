'use client'

import { useState } from 'react'
import Textarea from '@/components/ui/Textarea'
import Button from '@/components/ui/Button'

export default function ComparateurTexte() {
  const [text1, setText1] = useState('')
  const [text2, setText2] = useState('')
  const [differences, setDifferences] = useState<string[]>([])

  const compareTexts = () => {
    const lines1 = text1.split('\n')
    const lines2 = text2.split('\n')
    const maxLines = Math.max(lines1.length, lines2.length)
    const diffs: string[] = []

    for (let i = 0; i < maxLines; i++) {
      const line1 = lines1[i] || ''
      const line2 = lines2[i] || ''

      if (line1 !== line2) {
        if (line1 && !line2) {
          diffs.push(`Ligne ${i + 1}: supprimée - "${line1}"`)
        } else if (!line1 && line2) {
          diffs.push(`Ligne ${i + 1}: ajoutée - "${line2}"`)
        } else {
          diffs.push(`Ligne ${i + 1}: modifiée\n  Avant: "${line1}"\n  Après: "${line2}"`)
        }
      }
    }

    setDifferences(diffs)
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Textarea
          label="Texte 1"
          value={text1}
          onChange={(e) => setText1(e.target.value)}
          rows={10}
          placeholder="Premier texte..."
        />
        <Textarea
          label="Texte 2"
          value={text2}
          onChange={(e) => setText2(e.target.value)}
          rows={10}
          placeholder="Deuxième texte..."
        />
      </div>

      <Button onClick={compareTexts}>Comparer</Button>

      {differences.length > 0 ? (
        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
          <h3 className="font-semibold mb-3 text-gray-900 dark:text-gray-100">
            {differences.length} différence(s) trouvée(s)
          </h3>
          <div className="space-y-2">
            {differences.map((diff, index) => (
              <div key={index} className="text-sm font-mono whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                {diff}
              </div>
            ))}
          </div>
        </div>
      ) : differences.length === 0 && text1 && text2 ? (
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg text-green-700 dark:text-green-400">
          Les textes sont identiques
        </div>
      ) : null}
    </div>
  )
}
