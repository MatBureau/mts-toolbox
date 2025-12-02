'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'
import CopyButton from '@/components/ui/CopyButton'

export default function GenerateurUUID() {
  const [uuids, setUuids] = useState<string[]>([])

  const generateUUID = () => {
    const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0
      const v = c === 'x' ? r : (r & 0x3) | 0x8
      return v.toString(16)
    })
    setUuids([uuid, ...uuids.slice(0, 9)])
  }

  return (
    <div className="space-y-6">
      <div>
        <Button onClick={generateUUID}>Générer un UUID v4</Button>
      </div>

      {uuids.length > 0 && (
        <div>
          <h3 className="font-semibold mb-3 text-gray-900 dark:text-gray-100">
            UUIDs générés
          </h3>
          <div className="space-y-2">
            {uuids.map((uuid, index) => (
              <div
                key={index}
                className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg flex items-center justify-between"
              >
                <code className="font-mono text-sm text-gray-900 dark:text-gray-100">
                  {uuid}
                </code>
                <CopyButton text={uuid} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
