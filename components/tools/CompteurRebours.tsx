'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card'

export default function CompteurRebours() {
  const [targetDate, setTargetDate] = useState<string>('')
  const [targetTime, setTargetTime] = useState<string>('00:00')
  const [title, setTitle] = useState<string>('')
  const [started, setStarted] = useState(false)
  const [timeLeft, setTimeLeft] = useState<any>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const calculateTimeLeft = useCallback(() => {
    const target = new Date(`${targetDate}T${targetTime}`)
    const now = new Date()
    const difference = target.getTime() - now.getTime()

    if (difference <= 0) {
      setTimeLeft({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        expired: true,
      })
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      return
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24))
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((difference % (1000 * 60)) / 1000)

    setTimeLeft({ days, hours, minutes, seconds, expired: false })
  }, [targetDate, targetTime])

  useEffect(() => {
    if (started && targetDate) {
      calculateTimeLeft()
      intervalRef.current = setInterval(calculateTimeLeft, 1000)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [started, targetDate, calculateTimeLeft])

  const start = () => {
    if (!targetDate) return
    setStarted(true)
  }

  const stop = () => {
    setStarted(false)
    setTimeLeft(null)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
  }

  const reset = () => {
    stop()
    setTargetDate('')
    setTargetTime('00:00')
    setTitle('')
  }

  const padZero = (num: number) => String(num).padStart(2, '0')

  return (
    <div className="space-y-6">
      {!started && (
        <Card>
          <CardHeader>
            <CardTitle>Configuration du compte à rebours</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Titre de l'événement (optionnel)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Exemple : Anniversaire, Vacances..."
            />

            <Input
              label="Date cible"
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />

            <Input
              label="Heure cible"
              type="time"
              value={targetTime}
              onChange={(e) => setTargetTime(e.target.value)}
            />

            <Button onClick={start} disabled={!targetDate} className="w-full">
              Démarrer le compte à rebours
            </Button>
          </CardContent>
        </Card>
      )}

      {started && timeLeft && (
        <>
          {title && (
            <Card>
              <CardContent className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {title}
                </h2>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent>
              {timeLeft.expired ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🎉</div>
                  <div className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                    Temps écoulé !
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center p-6 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                    <div className="text-5xl font-bold text-primary-600 dark:text-primary-400 mb-2">
                      {timeLeft.days}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Jours
                    </div>
                  </div>

                  <div className="text-center p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-5xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                      {padZero(timeLeft.hours)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Heures
                    </div>
                  </div>

                  <div className="text-center p-6 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="text-5xl font-bold text-green-600 dark:text-green-400 mb-2">
                      {padZero(timeLeft.minutes)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Minutes
                    </div>
                  </div>

                  <div className="text-center p-6 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="text-5xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                      {padZero(timeLeft.seconds)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Secondes
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex space-x-4">
            <Button onClick={stop} variant="outline" className="flex-1">
              Arrêter
            </Button>
            <Button onClick={reset} variant="outline" className="flex-1">
              Réinitialiser
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
