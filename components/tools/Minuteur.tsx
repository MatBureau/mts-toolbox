'use client'

import { useState, useEffect, useRef } from 'react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

export default function Minuteur() {
  const [mode, setMode] = useState<'timer' | 'stopwatch'>('timer')
  const [minutes, setMinutes] = useState('5')
  const [seconds, setSeconds] = useState('0')
  const [timeLeft, setTimeLeft] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [stopwatchTime, setStopwatchTime] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    if (isRunning) {
      if (mode === 'timer') {
        intervalRef.current = setInterval(() => {
          setTimeLeft((prev) => {
            if (prev <= 1) {
              setIsRunning(false)
              playSound()
              return 0
            }
            return prev - 1
          })
        }, 1000)
      } else {
        intervalRef.current = setInterval(() => {
          setStopwatchTime((prev) => prev + 1)
        }, 1000)
      }
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning, mode])

  const playSound = () => {
    // Son de notification (optionnel)
    if (typeof Audio !== 'undefined') {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZUQ8PC5Xc8MR0JAHB2P...') // Placeholder
    }
  }

  const startTimer = () => {
    const totalSeconds = parseInt(minutes) * 60 + parseInt(seconds)
    if (totalSeconds > 0) {
      setTimeLeft(totalSeconds)
      setIsRunning(true)
    }
  }

  const startStopwatch = () => {
    setIsRunning(true)
  }

  const pause = () => {
    setIsRunning(false)
  }

  const reset = () => {
    setIsRunning(false)
    if (mode === 'timer') {
      setTimeLeft(0)
    } else {
      setStopwatchTime(0)
    }
  }

  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600)
    const mins = Math.floor((totalSeconds % 3600) / 60)
    const secs = totalSeconds % 60
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`
  }

  const displayTime = mode === 'timer' ? formatTime(timeLeft) : formatTime(stopwatchTime)

  return (
    <div className="space-y-6">
      <div className="flex gap-3 justify-center">
        <Button
          onClick={() => {
            setMode('timer')
            reset()
          }}
          variant={mode === 'timer' ? 'primary' : 'secondary'}
        >
          Minuteur
        </Button>
        <Button
          onClick={() => {
            setMode('stopwatch')
            reset()
          }}
          variant={mode === 'stopwatch' ? 'primary' : 'secondary'}
        >
          Chronomètre
        </Button>
      </div>

      {mode === 'timer' && !isRunning && timeLeft === 0 && (
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Minutes"
            type="number"
            value={minutes}
            onChange={(e) => setMinutes(e.target.value)}
            min={0}
          />
          <Input
            label="Secondes"
            type="number"
            value={seconds}
            onChange={(e) => setSeconds(e.target.value)}
            min={0}
            max={59}
          />
        </div>
      )}

      <div className="bg-gray-900 text-white rounded-lg p-12 text-center">
        <div className="text-6xl md:text-8xl font-mono font-bold">{displayTime}</div>
      </div>

      <div className="flex gap-3 justify-center">
        {!isRunning ? (
          <Button onClick={mode === 'timer' ? startTimer : startStopwatch} size="lg">
            Démarrer
          </Button>
        ) : (
          <Button onClick={pause} variant="secondary" size="lg">
            Pause
          </Button>
        )}
        <Button onClick={reset} variant="outline" size="lg">
          Réinitialiser
        </Button>
      </div>
    </div>
  )
}
