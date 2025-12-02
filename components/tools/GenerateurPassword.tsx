'use client'

import { useState } from 'react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import CopyButton from '@/components/ui/CopyButton'

export default function GenerateurPassword() {
  const [length, setLength] = useState(16)
  const [includeUppercase, setIncludeUppercase] = useState(true)
  const [includeLowercase, setIncludeLowercase] = useState(true)
  const [includeNumbers, setIncludeNumbers] = useState(true)
  const [includeSymbols, setIncludeSymbols] = useState(true)
  const [password, setPassword] = useState('')

  const generatePassword = () => {
    let charset = ''
    if (includeLowercase) charset += 'abcdefghijklmnopqrstuvwxyz'
    if (includeUppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    if (includeNumbers) charset += '0123456789'
    if (includeSymbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?'

    if (charset === '') {
      setPassword('Sélectionnez au moins un type de caractère')
      return
    }

    let result = ''
    for (let i = 0; i < length; i++) {
      result += charset.charAt(Math.floor(Math.random() * charset.length))
    }
    setPassword(result)
  }

  return (
    <div className="space-y-6">
      <Input
        label="Longueur du mot de passe"
        type="number"
        value={length}
        onChange={(e) => setLength(parseInt(e.target.value) || 8)}
        min={4}
        max={64}
      />

      <div className="space-y-3">
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={includeUppercase}
            onChange={(e) => setIncludeUppercase(e.target.checked)}
            className="w-4 h-4"
          />
          <span className="text-gray-700 dark:text-gray-300">Majuscules (A-Z)</span>
        </label>
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={includeLowercase}
            onChange={(e) => setIncludeLowercase(e.target.checked)}
            className="w-4 h-4"
          />
          <span className="text-gray-700 dark:text-gray-300">Minuscules (a-z)</span>
        </label>
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={includeNumbers}
            onChange={(e) => setIncludeNumbers(e.target.checked)}
            className="w-4 h-4"
          />
          <span className="text-gray-700 dark:text-gray-300">Chiffres (0-9)</span>
        </label>
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={includeSymbols}
            onChange={(e) => setIncludeSymbols(e.target.checked)}
            className="w-4 h-4"
          />
          <span className="text-gray-700 dark:text-gray-300">Symboles (!@#$...)</span>
        </label>
      </div>

      <Button onClick={generatePassword}>Générer un mot de passe</Button>

      {password && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Mot de passe généré
            </label>
            <CopyButton text={password} />
          </div>
          <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
            <code className="text-lg font-mono break-all text-gray-900 dark:text-gray-100">
              {password}
            </code>
          </div>
        </div>
      )}
    </div>
  )
}
