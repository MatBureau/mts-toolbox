'use client'

import { useState, useEffect } from 'react'
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card'

interface TimeZone {
  name: string
  label: string
  offset: number
}

export default function HorlogeMondiale() {
  const [times, setTimes] = useState<{ [key: string]: string }>({})

  const timezones: TimeZone[] = [
    { name: 'Paris', label: 'Paris, France', offset: 1 },
    { name: 'London', label: 'Londres, Royaume-Uni', offset: 0 },
    { name: 'NewYork', label: 'New York, États-Unis', offset: -5 },
    { name: 'LosAngeles', label: 'Los Angeles, États-Unis', offset: -8 },
    { name: 'Tokyo', label: 'Tokyo, Japon', offset: 9 },
    { name: 'Sydney', label: 'Sydney, Australie', offset: 11 },
    { name: 'Dubai', label: 'Dubaï, EAU', offset: 4 },
    { name: 'Shanghai', label: 'Shanghai, Chine', offset: 8 },
    { name: 'Moscow', label: 'Moscou, Russie', offset: 3 },
    { name: 'Mumbai', label: 'Mumbai, Inde', offset: 5.5 },
    { name: 'SaoPaulo', label: 'São Paulo, Brésil', offset: -3 },
    { name: 'Toronto', label: 'Toronto, Canada', offset: -5 },
  ]

  const updateTimes = () => {
    const now = new Date()
    const utcHours = now.getUTCHours()
    const utcMinutes = now.getUTCMinutes()
    const utcSeconds = now.getUTCSeconds()

    const newTimes: { [key: string]: string } = {}

    timezones.forEach((tz) => {
      let hours = utcHours + tz.offset
      const minutes = utcMinutes + (tz.offset % 1) * 60

      if (hours >= 24) hours -= 24
      if (hours < 0) hours += 24

      const formattedTime = `${String(Math.floor(hours)).padStart(2, '0')}:${String(Math.floor(minutes)).padStart(2, '0')}:${String(utcSeconds).padStart(2, '0')}`
      newTimes[tz.name] = formattedTime
    })

    setTimes(newTimes)
  }

  useEffect(() => {
    updateTimes()
    const interval = setInterval(updateTimes, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Horloge mondiale</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {timezones.map((tz) => (
              <div
                key={tz.name}
                className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  {tz.label}
                </div>
                <div className="text-3xl font-bold font-mono text-primary-600 dark:text-primary-400">
                  {times[tz.name] || '00:00:00'}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  UTC{tz.offset >= 0 ? '+' : ''}{tz.offset}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
