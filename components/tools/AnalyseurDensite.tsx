'use client'

import { useState, useMemo } from 'react'
import Textarea from '@/components/ui/Textarea'
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card'

export default function AnalyseurDensite() {
  const [text, setText] = useState('')

  const analysis = useMemo(() => {
    if (!text.trim()) {
      return { keywords: [], wordCount: 0, charCount: 0 }
    }

    const words = text
      .toLowerCase()
      .replace(/[^\w\sàâäéèêëïîôùûüÿœæç]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 3) // Only words with 4+ characters

    const wordCount = words.length
    const charCount = text.length

    // Count word frequency
    const frequency: Record<string, number> = {}
    words.forEach(word => {
      frequency[word] = (frequency[word] || 0) + 1
    })

    // Calculate density and create keyword objects
    const keywords = Object.entries(frequency)
      .map(([word, count]) => ({
        word,
        count,
        density: ((count / wordCount) * 100).toFixed(2),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20) // Top 20 keywords

    return { keywords, wordCount, charCount }
  }, [text])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Votre texte</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Collez votre texte ici pour analyser la densité des mots-clés..."
            rows={10}
          />
          <div className="mt-2 flex gap-4 text-sm text-gray-600 dark:text-gray-400">
            <span>{analysis.wordCount} mots</span>
            <span>{analysis.charCount} caractères</span>
          </div>
        </CardContent>
      </Card>

      {analysis.keywords.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Densité des mots-clés (Top 20)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-2 px-3 font-semibold text-gray-700 dark:text-gray-300">Mot-clé</th>
                    <th className="text-right py-2 px-3 font-semibold text-gray-700 dark:text-gray-300">Occurrences</th>
                    <th className="text-right py-2 px-3 font-semibold text-gray-700 dark:text-gray-300">Densité</th>
                    <th className="py-2 px-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {analysis.keywords.map((kw, i) => (
                    <tr key={i} className="border-b border-gray-100 dark:border-gray-800">
                      <td className="py-2 px-3 text-gray-900 dark:text-gray-100 font-medium">{kw.word}</td>
                      <td className="text-right py-2 px-3 text-gray-700 dark:text-gray-300">{kw.count}</td>
                      <td className="text-right py-2 px-3 text-gray-700 dark:text-gray-300">{kw.density}%</td>
                      <td className="py-2 px-3">
                        <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-blue-500 h-full"
                            style={{ width: `${Math.min(parseFloat(kw.density) * 10, 100)}%` }}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>💡 À propos de la densité</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300 list-disc list-inside">
            <li>La densité idéale pour un mot-clé principal est de 1-3%</li>
            <li>Une densité trop élevée (&gt;5%) peut être considérée comme du spam</li>
            <li>Privilégiez la qualité et la pertinence à la répétition</li>
            <li>Utilisez des synonymes et variations de vos mots-clés</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
