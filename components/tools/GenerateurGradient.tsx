'use client'

import { useState } from 'react'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import CopyButton from '@/components/ui/CopyButton'

export default function GenerateurGradient() {
  const [color1, setColor1] = useState('#667eea')
  const [color2, setColor2] = useState('#764ba2')
  const [direction, setDirection] = useState('to right')
  const [type, setType] = useState('linear')

  const generateCSS = () => {
    if (type === 'linear') {
      return `background: linear-gradient(${direction}, ${color1}, ${color2});`
    } else {
      return `background: radial-gradient(circle, ${color1}, ${color2});`
    }
  }

  const css = generateCSS()

  return (
    <div className="space-y-6">
      <Select
        label="Type de gradient"
        value={type}
        onChange={(e) => setType(e.target.value)}
        options={[
          { value: 'linear', label: 'Linéaire' },
          { value: 'radial', label: 'Radial' },
        ]}
      />

      {type === 'linear' && (
        <Select
          label="Direction"
          value={direction}
          onChange={(e) => setDirection(e.target.value)}
          options={[
            { value: 'to right', label: 'Gauche → Droite' },
            { value: 'to left', label: 'Droite → Gauche' },
            { value: 'to bottom', label: 'Haut → Bas' },
            { value: 'to top', label: 'Bas → Haut' },
            { value: 'to bottom right', label: 'Diagonale ↘' },
            { value: 'to bottom left', label: 'Diagonale ↙' },
          ]}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Couleur 1
          </label>
          <div className="flex gap-2">
            <input
              type="color"
              value={color1}
              onChange={(e) => setColor1(e.target.value)}
              className="h-10 w-20 rounded border border-gray-300 dark:border-gray-600"
            />
            <Input
              value={color1}
              onChange={(e) => setColor1(e.target.value)}
              placeholder="#667eea"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Couleur 2
          </label>
          <div className="flex gap-2">
            <input
              type="color"
              value={color2}
              onChange={(e) => setColor2(e.target.value)}
              className="h-10 w-20 rounded border border-gray-300 dark:border-gray-600"
            />
            <Input
              value={color2}
              onChange={(e) => setColor2(e.target.value)}
              placeholder="#764ba2"
            />
          </div>
        </div>
      </div>

      <div
        className="h-48 rounded-lg"
        style={{ background: css.replace('background: ', '') }}
      />

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Code CSS
          </label>
          <CopyButton text={css} />
        </div>
        <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm">
          {css}
        </div>
      </div>
    </div>
  )
}
