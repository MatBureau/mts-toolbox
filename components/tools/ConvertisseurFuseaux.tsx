'use client'

import { useState, useEffect } from 'react'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card'

export default function ConvertisseurFuseaux() {
  const [time, setTime] = useState<string>('')
  const [fromTimezone, setFromTimezone] = useState<string>('Europe/Paris')
  const [results, setResults] = useState<any[]>([])

  const timezones = [
    { value: 'Europe/Paris', label: 'Paris (CET/CEST)', offset: 1 },
    { value: 'Europe/London', label: 'Londres (GMT/BST)', offset: 0 },
    { value: 'America/New_York', label: 'New York (EST/EDT)', offset: -5 },
    { value: 'America/Los_Angeles', label: 'Los Angeles (PST/PDT)', offset: -8 },
    { value: 'America/Chicago', label: 'Chicago (CST/CDT)', offset: -6 },
    { value: 'Asia/Tokyo', label: 'Tokyo (JST)', offset: 9 },
    { value: 'Asia/Shanghai', label: 'Shanghai (CST)', offset: 8 },
    { value: 'Asia/Dubai', label: 'Dubai (GST)', offset: 4 },
    { value: 'Australia/Sydney', label: 'Sydney (AEDT/AEST)', offset: 11 },
    { value: 'Pacific/Auckland', label: 'Auckland (NZDT/NZST)', offset: 13 },
  ]

  useEffect(() => {
    const now = new Date()
    const hours = String(now.getHours()).padStart(2, '0')
    const minutes = String(now.getMinutes()).padStart(2, '0')
    setTime(`${hours}:${minutes}`)
  }, [])

  useEffect(() => {
    if (time) {
      convertTime()
    }
  }, [time, fromTimezone])

  const convertTime = () => {
    if (!time) return

    const [hours, minutes] = time.split(':').map(Number)
    if (isNaN(hours) || isNaN(minutes)) return

    const sourceTimezone = timezones.find(tz => tz.value === fromTimezone)
    if (!sourceTimezone) return

    const converted = timezones
      .filter(tz => tz.value !== fromTimezone)
      .map(tz => {
        const offsetDiff = tz.offset - sourceTimezone.offset
        let newHours = hours + offsetDiff
        let newDay = 0

        if (newHours >= 24) {
          newDay = Math.floor(newHours / 24)
          newHours = newHours % 24
        } else if (newHours < 0) {
          newDay = Math.floor(newHours / 24)
          newHours = ((newHours % 24) + 24) % 24
        }

        const dayText = newDay > 0 ? ' (+1 jour)' : newDay < 0 ? ' (-1 jour)' : ''

        return {
          timezone: tz.label,
          time: `${String(newHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}${dayText}`,
        }
      })

    setResults(converted)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Heure source</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Heure"
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />

          <Select
            label="Fuseau horaire"
            value={fromTimezone}
            onChange={(e) => setFromTimezone(e.target.value)}
            options={timezones}
          />
        </CardContent>
      </Card>

      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Conversions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {results.map((result, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <span className="text-sm">{result.timezone}</span>
                  <span className="text-lg font-semibold text-primary-600 dark:text-primary-400">
                    {result.time}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
