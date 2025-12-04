'use client'

import { useState, useEffect, useRef } from 'react'
import Button from '@/components/ui/Button'
import Textarea from '@/components/ui/Textarea'
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card'

export default function TestFrappe() {
  const [started, setStarted] = useState(false)
  const [finished, setFinished] = useState(false)
  const [text, setText] = useState('')
  const [startTime, setStartTime] = useState<number>(0)
  const [endTime, setEndTime] = useState<number>(0)
  const [stats, setStats] = useState<any>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const sampleText = "La pratique régulière améliore la vitesse de frappe. Plus vous tapez, plus vous devenez rapide et précis. Il est important de maintenir une bonne posture et de regarder l'écran plutôt que le clavier."

  const start = () => {
    setText('')
    setStarted(true)
    setFinished(false)
    setStats(null)
    setStartTime(Date.now())
    setTimeout(() => textareaRef.current?.focus(), 100)
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!started) return

    const value = e.target.value
    setText(value)

    if (value === sampleText) {
      finish()
    }
  }

  const finish = () => {
    const end = Date.now()
    setEndTime(end)
    setFinished(true)
    setStarted(false)

    const timeInMinutes = (end - startTime) / 1000 / 60
    const words = sampleText.split(' ').length
    const wpm = Math.round(words / timeInMinutes)

    const correctChars = text.split('').filter((char, index) => char === sampleText[index]).length
    const accuracy = Math.round((correctChars / sampleText.length) * 100)

    setStats({
      wpm,
      accuracy,
      time: Math.round((end - startTime) / 1000),
      words,
    })
  }

  const getTextColor = () => {
    if (!started || text.length === 0) return 'text-gray-900 dark:text-gray-100'

    let correct = true
    for (let i = 0; i < text.length; i++) {
      if (text[i] !== sampleText[i]) {
        correct = false
        break
      }
    }

    return correct ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Texte à reproduire</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg font-mono text-lg leading-relaxed">
            {sampleText}
          </div>
        </CardContent>
      </Card>

      {!started && !finished && (
        <div className="text-center">
          <Button onClick={start} className="px-8 py-3 text-lg">
            Commencer le test
          </Button>
        </div>
      )}

      {started && (
        <Card>
          <CardHeader>
            <CardTitle>Tapez ici</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              ref={textareaRef}
              value={text}
              onChange={handleChange}
              rows={5}
              className={`font-mono text-lg ${getTextColor()}`}
              placeholder="Commencez à taper..."
            />
          </CardContent>
        </Card>
      )}

      {finished && stats && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Résultats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                  <div className="text-4xl font-bold text-primary-600 dark:text-primary-400">
                    {stats.wpm}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Mots/minute
                  </div>
                </div>

                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-4xl font-bold text-green-600 dark:text-green-400">
                    {stats.accuracy}%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Précision
                  </div>
                </div>

                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                    {stats.time}s
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Temps
                  </div>
                </div>

                <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="text-4xl font-bold text-purple-600 dark:text-purple-400">
                    {stats.words}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Mots
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="text-center">
            <Button onClick={start} variant="outline">
              Recommencer
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
