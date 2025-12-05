'use client'

import { useState } from 'react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import CopyButton from '@/components/ui/CopyButton'
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card'

export default function GenerateurHash() {
  const [input, setInput] = useState('')
  const [hashes, setHashes] = useState<Record<string, string>>({})

  // Simple hash functions (for demonstration - use crypto API in production)
  const generateMD5 = async (str: string): Promise<string> => {
    const encoder = new TextEncoder()
    const data = encoder.encode(str)
    const hashBuffer = await crypto.subtle.digest('SHA-1', data) // Using SHA-1 as fallback
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }

  const generateSHA256 = async (str: string): Promise<string> => {
    const encoder = new TextEncoder()
    const data = encoder.encode(str)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }

  const generateSHA512 = async (str: string): Promise<string> => {
    const encoder = new TextEncoder()
    const data = encoder.encode(str)
    const hashBuffer = await crypto.subtle.digest('SHA-512', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }

  const generateAllHashes = async () => {
    if (!input.trim()) return

    const results: Record<string, string> = {}

    results['SHA-1 (MD5 fallback)'] = await generateMD5(input)
    results['SHA-256'] = await generateSHA256(input)
    results['SHA-512'] = await generateSHA512(input)

    setHashes(results)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Texte à hasher</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Entrez votre texte ou mot de passe..."
          />
          <Button onClick={generateAllHashes} className="w-full">
            Générer tous les hash
          </Button>
        </CardContent>
      </Card>

      {Object.keys(hashes).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Hash générés</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(hashes).map(([algo, hash]) => (
              <div key={algo}>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {algo}
                  </label>
                  <CopyButton text={hash} />
                </div>
                <div className="bg-gray-900 text-gray-100 p-3 rounded-lg font-mono text-xs break-all">
                  {hash}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>💡 À propos des hash</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300 list-disc list-inside">
            <li><strong>SHA-256</strong> : Standard moderne, très sécurisé (256 bits)</li>
            <li><strong>SHA-512</strong> : Version encore plus sécurisée (512 bits)</li>
            <li>Les hash sont <strong>à sens unique</strong> : impossible de retrouver le texte original</li>
            <li>Utilisés pour stocker des mots de passe, vérifier l'intégrité de fichiers</li>
            <li>Le moindre changement dans l'entrée produit un hash complètement différent</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>⚠ Sécurité</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Pour hasher des mots de passe, ajoutez toujours un <strong>salt</strong> unique et utilisez des algorithmes spécialisés comme <strong>bcrypt</strong>, <strong>scrypt</strong> ou <strong>Argon2</strong>.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
