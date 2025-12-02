'use client'

import { useState } from 'react'
import Textarea from '@/components/ui/Textarea'
import Button from '@/components/ui/Button'

export default function DecodeurJWT() {
  const [token, setToken] = useState('')
  const [header, setHeader] = useState('')
  const [payload, setPayload] = useState('')
  const [error, setError] = useState('')

  const decodeJWT = () => {
    try {
      const parts = token.split('.')
      if (parts.length !== 3) {
        throw new Error('JWT invalide : doit contenir 3 parties séparées par des points')
      }

      const decodeBase64 = (str: string) => {
        return decodeURIComponent(
          atob(str.replace(/-/g, '+').replace(/_/g, '/'))
            .split('')
            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        )
      }

      const decodedHeader = JSON.parse(decodeBase64(parts[0]))
      const decodedPayload = JSON.parse(decodeBase64(parts[1]))

      setHeader(JSON.stringify(decodedHeader, null, 2))
      setPayload(JSON.stringify(decodedPayload, null, 2))
      setError('')
    } catch (err) {
      setError((err as Error).message)
      setHeader('')
      setPayload('')
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg text-yellow-700 dark:text-yellow-400 text-sm">
        Note : Cet outil décode uniquement le contenu du JWT sans vérifier sa signature. N'utilisez pas avec des tokens sensibles.
      </div>

      <Textarea
        label="Token JWT"
        value={token}
        onChange={(e) => setToken(e.target.value)}
        rows={4}
        placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
      />

      <Button onClick={decodeJWT}>Décoder</Button>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      {header && payload && (
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">Header</h3>
            <Textarea value={header} readOnly rows={5} className="font-mono text-sm" />
          </div>

          <div>
            <h3 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">Payload</h3>
            <Textarea value={payload} readOnly rows={10} className="font-mono text-sm" />
          </div>
        </div>
      )}
    </div>
  )
}
