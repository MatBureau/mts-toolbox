'use client'

import { useState, useRef } from 'react'
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import CopyButton from '@/components/ui/CopyButton'

export default function ExtracteurPalette() {
  const [image, setImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [colors, setColors] = useState<string[]>([])
  const [extracting, setExtracting] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImage(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string)
        extractColors(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const rgbToHex = (r: number, g: number, b: number): string => {
    return '#' + [r, g, b].map(x => {
      const hex = x.toString(16)
      return hex.length === 1 ? '0' + hex : hex
    }).join('')
  }

  const extractColors = (imageUrl: string) => {
    setExtracting(true)
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx?.drawImage(img, 0, 0)

      const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height)
      if (!imageData) return

      const colorMap = new Map<string, number>()

      for (let i = 0; i < imageData.data.length; i += 4) {
        const r = imageData.data[i]
        const g = imageData.data[i + 1]
        const b = imageData.data[i + 2]
        const hex = rgbToHex(r, g, b)
        colorMap.set(hex, (colorMap.get(hex) || 0) + 1)
      }

      const sortedColors = Array.from(colorMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(entry => entry[0])

      setColors(sortedColors)
      setExtracting(false)
    }

    img.src = imageUrl
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Télécharger une image</CardTitle>
        </CardHeader>
        <CardContent>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
          />
        </CardContent>
      </Card>

      {previewUrl && (
        <Card>
          <CardHeader>
            <CardTitle>Aperçu</CardTitle>
          </CardHeader>
          <CardContent>
            <img src={previewUrl} alt="Preview" className="max-w-full h-auto rounded-lg" />
          </CardContent>
        </Card>
      )}

      {colors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Couleurs dominantes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {colors.map((color, index) => (
                <div key={index} className="space-y-2">
                  <div
                    className="w-full h-20 rounded-lg border border-gray-300 dark:border-gray-600"
                    style={{ backgroundColor: color }}
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-mono">{color}</span>
                    <CopyButton text={color} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}
