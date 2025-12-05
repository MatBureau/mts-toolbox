'use client'

import { useState } from 'react'
import Textarea from '@/components/ui/Textarea'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card'

export default function TirageAuSort() {
  const [items, setItems] = useState('')
  const [count, setCount] = useState(1)
  const [results, setResults] = useState<string[]>([])
  const [history, setHistory] = useState<string[][]>([])

  const pickRandom = () => {
    const list = items.split('\n').filter(item => item.trim().length > 0)

    if (list.length === 0) {
      alert('Veuillez entrer au moins un élément')
      return
    }

    if (count > list.length) {
      alert(`Vous ne pouvez pas tirer plus de ${list.length} éléments`)
      return
    }

    // Fisher-Yates shuffle algorithm
    const shuffled = [...list]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }

    const picked = shuffled.slice(0, count)
    setResults(picked)
    setHistory([picked, ...history])
  }

  const pickOne = () => {
    const list = items.split('\n').filter(item => item.trim().length > 0)
    if (list.length === 0) return

    const randomIndex = Math.floor(Math.random() * list.length)
    const picked = [list[randomIndex]]
    setResults(picked)
    setHistory([picked, ...history])
  }

  const clearHistory = () => {
    setHistory([])
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Liste des éléments</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={items}
            onChange={(e) => setItems(e.target.value)}
            placeholder="Entrez un élément par ligne&#10;Alice&#10;Bob&#10;Charlie&#10;Diana"
            rows={8}
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {items.split('\n').filter(item => item.trim().length > 0).length} éléments
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Nombre d'éléments à tirer"
            type="number"
            min="1"
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
          />

          <div className="flex gap-3">
            <Button onClick={pickRandom} className="flex-1">
              Tirer {count} {count > 1 ? 'éléments' : 'élément'}
            </Button>
            <Button onClick={pickOne} variant="secondary">
              Tirer 1 au hasard
            </Button>
          </div>
        </CardContent>
      </Card>

      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>🎲 Résultat du tirage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {results.map((result, index) => (
                <div
                  key={index}
                  className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-2 border-blue-300 dark:border-blue-700"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {index + 1}.
                    </span>
                    <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {result}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {history.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Historique des tirages</CardTitle>
              <Button onClick={clearHistory} variant="secondary" size="sm">
                Effacer
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {history.map((draw, index) => (
                <div
                  key={index}
                  className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Tirage #{history.length - index}
                  </p>
                  <p className="text-sm text-gray-900 dark:text-gray-100">
                    {draw.join(', ')}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>💡 Utilisation</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300 list-disc list-inside">
            <li>Idéal pour tirer au sort des gagnants de concours</li>
            <li>Choisir aléatoirement des participants à une activité</li>
            <li>Créer des équipes de manière équitable</li>
            <li>L'algorithme garantit un tirage vraiment aléatoire</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
