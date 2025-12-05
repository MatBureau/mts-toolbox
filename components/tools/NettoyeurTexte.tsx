'use client'

import { useState } from 'react'
import Textarea from '@/components/ui/Textarea'
import Button from '@/components/ui/Button'
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card'

export default function NettoyeurTexte() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')

  const cleanText = (options: {
    trim?: boolean
    removeExtraSpaces?: boolean
    removeLineBreaks?: boolean
    removeSpecialChars?: boolean
    removeDiacritics?: boolean
    toLowerCase?: boolean
    toUpperCase?: boolean
  }) => {
    let result = input

    if (options.trim) {
      result = result.trim()
    }

    if (options.removeExtraSpaces) {
      result = result.replace(/\s+/g, ' ')
    }

    if (options.removeLineBreaks) {
      result = result.replace(/\n+/g, ' ')
    }

    if (options.removeSpecialChars) {
      result = result.replace(/[^\w\sàâäéèêëïîôùûüÿœæç]/g, '')
    }

    if (options.removeDiacritics) {
      result = result.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    }

    if (options.toLowerCase) {
      result = result.toLowerCase()
    }

    if (options.toUpperCase) {
      result = result.toUpperCase()
    }

    setOutput(result)
  }

  const applyAll = () => {
    cleanText({
      trim: true,
      removeExtraSpaces: true,
      removeLineBreaks: false,
      removeSpecialChars: false,
      removeDiacritics: false,
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Texte à nettoyer</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Collez votre texte ici..."
            rows={8}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Options de nettoyage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <Button onClick={() => cleanText({ trim: true })} variant="secondary" size="sm">
              Supprimer espaces début/fin
            </Button>
            <Button onClick={() => cleanText({ removeExtraSpaces: true })} variant="secondary" size="sm">
              Espaces multiples → simple
            </Button>
            <Button onClick={() => cleanText({ removeLineBreaks: true })} variant="secondary" size="sm">
              Supprimer sauts de ligne
            </Button>
            <Button onClick={() => cleanText({ removeSpecialChars: true })} variant="secondary" size="sm">
              Supprimer caractères spéciaux
            </Button>
            <Button onClick={() => cleanText({ removeDiacritics: true })} variant="secondary" size="sm">
              Supprimer accents
            </Button>
            <Button onClick={() => cleanText({ toLowerCase: true })} variant="secondary" size="sm">
              → minuscules
            </Button>
            <Button onClick={() => cleanText({ toUpperCase: true })} variant="secondary" size="sm">
              → MAJUSCULES
            </Button>
            <Button onClick={applyAll} className="md:col-span-2">
              Tout nettoyer
            </Button>
          </div>
        </CardContent>
      </Card>

      {output && (
        <Card>
          <CardHeader>
            <CardTitle>Résultat</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={output}
              onChange={(e) => setOutput(e.target.value)}
              rows={8}
            />
            <div className="mt-2 flex gap-4 text-sm text-gray-600 dark:text-gray-400">
              <span>Original : {input.length} caractères</span>
              <span>Nettoyé : {output.length} caractères</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
