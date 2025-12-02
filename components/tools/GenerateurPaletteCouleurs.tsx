'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'
import CopyButton from '@/components/ui/CopyButton'

export default function GenerateurPaletteCouleurs() {
  const [palette, setPalette] = useState<string[]>([])

  const generatePalette = () => {
    const newPalette: string[] = []
    for (let i = 0; i < 5; i++) {
      const color = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')
      newPalette.push(color)
    }
    setPalette(newPalette)
  }

  const generateMonochrome = () => {
    const baseHue = Math.floor(Math.random() * 360)
    const newPalette: string[] = []
    for (let i = 0; i < 5; i++) {
      const lightness = 20 + i * 15
      newPalette.push(`hsl(${baseHue}, 70%, ${lightness}%)`)
    }
    setPalette(newPalette)
  }

  const generateComplementary = () => {
    const baseHue = Math.floor(Math.random() * 360)
    const complementHue = (baseHue + 180) % 360
    const newPalette: string[] = []

    newPalette.push(`hsl(${baseHue}, 70%, 50%)`)
    newPalette.push(`hsl(${baseHue}, 70%, 30%)`)
    newPalette.push(`hsl(${baseHue}, 70%, 70%)`)
    newPalette.push(`hsl(${complementHue}, 70%, 50%)`)
    newPalette.push(`hsl(${complementHue}, 70%, 30%)`)

    setPalette(newPalette)
  }

  const hslToHex = (hsl: string): string => {
    const match = hsl.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/)
    if (!match) return hsl

    const h = parseInt(match[1]) / 360
    const s = parseInt(match[2]) / 100
    const l = parseInt(match[3]) / 100

    let r, g, b

    if (s === 0) {
      r = g = b = l
    } else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1
        if (t > 1) t -= 1
        if (t < 1 / 6) return p + (q - p) * 6 * t
        if (t < 1 / 2) return q
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
        return p
      }

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s
      const p = 2 * l - q
      r = hue2rgb(p, q, h + 1 / 3)
      g = hue2rgb(p, q, h)
      b = hue2rgb(p, q, h - 1 / 3)
    }

    const toHex = (x: number) => {
      const hex = Math.round(x * 255).toString(16)
      return hex.length === 1 ? '0' + hex : hex
    }

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
        <Button onClick={generatePalette}>Palette aléatoire</Button>
        <Button onClick={generateMonochrome} variant="secondary">
          Monochrome
        </Button>
        <Button onClick={generateComplementary} variant="secondary">
          Complémentaire
        </Button>
      </div>

      {palette.length > 0 && (
        <div className="space-y-4">
          <div className="grid grid-cols-5 gap-2 h-48">
            {palette.map((color, index) => (
              <div
                key={index}
                className="rounded-lg shadow-lg relative group cursor-pointer"
                style={{ backgroundColor: color.startsWith('hsl') ? color : color }}
                onClick={() => navigator.clipboard.writeText(color.startsWith('hsl') ? hslToHex(color) : color)}
              >
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/50 rounded-lg transition-opacity">
                  <span className="text-white text-sm font-mono">Copier</span>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            {palette.map((color, index) => {
              const hexColor = color.startsWith('hsl') ? hslToHex(color) : color
              return (
                <div
                  key={index}
                  className="flex items-center justify-between bg-gray-50 dark:bg-gray-900 p-3 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded border border-gray-300 dark:border-gray-600"
                      style={{ backgroundColor: color }}
                    />
                    <code className="font-mono text-sm">{hexColor.toUpperCase()}</code>
                  </div>
                  <CopyButton text={hexColor} />
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
