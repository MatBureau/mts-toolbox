'use client'

import { useState } from 'react'
import Input from '@/components/ui/Input'
import CopyButton from '@/components/ui/CopyButton'

export default function GenerateurBoxShadow() {
  const [horizontalOffset, setHorizontalOffset] = useState('0')
  const [verticalOffset, setVerticalOffset] = useState('10')
  const [blur, setBlur] = useState('20')
  const [spread, setSpread] = useState('0')
  const [color, setColor] = useState('#000000')
  const [opacity, setOpacity] = useState('0.2')

  const generateCSS = () => {
    const rgba = hexToRgba(color, parseFloat(opacity))
    return `box-shadow: ${horizontalOffset}px ${verticalOffset}px ${blur}px ${spread}px ${rgba};`
  }

  const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }

  const css = generateCSS()

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Input
          label="Horizontal (px)"
          type="number"
          value={horizontalOffset}
          onChange={(e) => setHorizontalOffset(e.target.value)}
        />
        <Input
          label="Vertical (px)"
          type="number"
          value={verticalOffset}
          onChange={(e) => setVerticalOffset(e.target.value)}
        />
        <Input
          label="Flou (px)"
          type="number"
          value={blur}
          onChange={(e) => setBlur(e.target.value)}
          min={0}
        />
        <Input
          label="Étendue (px)"
          type="number"
          value={spread}
          onChange={(e) => setSpread(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Couleur
          </label>
          <div className="flex gap-2">
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="h-10 w-20 rounded border border-gray-300 dark:border-gray-600"
            />
            <Input value={color} onChange={(e) => setColor(e.target.value)} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Opacité
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={opacity}
            onChange={(e) => setOpacity(e.target.value)}
            className="w-full"
          />
          <div className="text-center text-sm text-gray-600 dark:text-gray-400 mt-1">
            {opacity}
          </div>
        </div>
      </div>

      <div className="bg-gray-100 dark:bg-gray-900 p-12 rounded-lg flex items-center justify-center">
        <div
          className="w-48 h-48 bg-white dark:bg-gray-800 rounded-lg"
          style={{ boxShadow: css.replace('box-shadow: ', '').replace(';', '') }}
        />
      </div>

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
