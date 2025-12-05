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
  const [stopwatchTime, setStopwatchTime] = useState(0) // En millisecondes
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
        // Chronomètre avec millisecondes - mise à jour toutes les 10ms
        intervalRef.current = setInterval(() => {
          setStopwatchTime((prev) => prev + 10)
        }, 10)
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
    // Génère un son d'alarme avec Web Audio API
    if (typeof window !== 'undefined' && 'AudioContext' in window) {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()

      // Fonction pour jouer un bip
      const playBeep = (frequency: number, duration: number, startTime: number) => {
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()

        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)

        oscillator.frequency.value = frequency
        oscillator.type = 'sine'

        gainNode.gain.setValueAtTime(0.3, startTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration)

        oscillator.start(startTime)
        oscillator.stop(startTime + duration)
      }

      // Alarme : 3 bips successifs
      const now = audioContext.currentTime
      playBeep(800, 0.15, now)
      playBeep(800, 0.15, now + 0.2)
      playBeep(800, 0.4, now + 0.4)
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

  const formatTimeWithMs = (totalMs: number) => {
    const hrs = Math.floor(totalMs / 3600000)
    const mins = Math.floor((totalMs % 3600000) / 60000)
    const secs = Math.floor((totalMs % 60000) / 1000)
    const ms = Math.floor((totalMs % 1000) / 10)
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}.${ms.toString().padStart(2, '0')}`
  }

  const displayTime = mode === 'timer' ? formatTime(timeLeft) : formatTimeWithMs(stopwatchTime)

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
