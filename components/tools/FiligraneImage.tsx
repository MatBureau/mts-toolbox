'use client'

import { useState, useRef } from 'react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card'

export default function FiligraneImage() {
  const [image, setImage] = useState<string | null>(null)
  const [watermarkText, setWatermarkText] = useState('© Mon Filigrane')
  const [fontSize, setFontSize] = useState(40)
  const [opacity, setOpacity] = useState(0.5)
  const [position, setPosition] = useState<'center' | 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'>('bottom-right')
  const [result, setResult] = useState<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setImage(e.target?.result as string)
        setResult(null)
      }
      reader.readAsDataURL(file)
    }
  }

  const applyWatermark = () => {
    if (!image || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = new Image()
    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height

      // Draw original image
      ctx.drawImage(img, 0, 0)

      // Configure watermark
      ctx.font = `${fontSize}px Arial`
      ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`
      ctx.strokeStyle = `rgba(0, 0, 0, ${opacity * 0.3})`
      ctx.lineWidth = 2

      const textMetrics = ctx.measureText(watermarkText)
      const textWidth = textMetrics.width
      const textHeight = fontSize

      let x = 0
      let y = 0

      // Position calculation
      switch (position) {
        case 'center':
          x = (canvas.width - textWidth) / 2
          y = canvas.height / 2
          break
        case 'bottom-right':
          x = canvas.width - textWidth - 20
          y = canvas.height - 20
          break
        case 'bottom-left':
          x = 20
          y = canvas.height - 20
          break
        case 'top-right':
          x = canvas.width - textWidth - 20
          y = textHeight + 20
          break
        case 'top-left':
          x = 20
          y = textHeight + 20
          break
      }

      // Draw watermark with stroke (outline)
      ctx.strokeText(watermarkText, x, y)
      ctx.fillText(watermarkText, x, y)

      setResult(canvas.toDataURL('image/png'))
    }
    img.src = image
  }

  const downloadImage = () => {
    if (!result) return

    const link = document.createElement('a')
    link.href = result
    link.download = 'image-filigrane.png'
    link.click()
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Charger une image</CardTitle>
        </CardHeader>
        <CardContent>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="block w-full text-sm text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer bg-white dark:bg-gray-800 focus:outline-none p-2"
          />
        </CardContent>
      </Card>

      {image && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Configuration du filigrane</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Texte du filigrane"
                value={watermarkText}
                onChange={(e) => setWatermarkText(e.target.value)}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Taille : {fontSize}px
                </label>
                <input
                  type="range"
                  min="20"
                  max="100"
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Opacité : {Math.round(opacity * 100)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={opacity}
                  onChange={(e) => setOpacity(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Position
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    onClick={() => setPosition('top-left')}
                    variant={position === 'top-left' ? 'primary' : 'secondary'}
                    size="sm"
                  >
                    ↖ Haut gauche
                  </Button>
                  <Button
                    onClick={() => setPosition('center')}
                    variant={position === 'center' ? 'primary' : 'secondary'}
                    size="sm"
                  >
                    • Centre
                  </Button>
                  <Button
                    onClick={() => setPosition('top-right')}
                    variant={position === 'top-right' ? 'primary' : 'secondary'}
                    size="sm"
                  >
                    ↗ Haut droite
                  </Button>
                  <Button
                    onClick={() => setPosition('bottom-left')}
                    variant={position === 'bottom-left' ? 'primary' : 'secondary'}
                    size="sm"
                  >
                    ↙ Bas gauche
                  </Button>
                  <div></div>
                  <Button
                    onClick={() => setPosition('bottom-right')}
                    variant={position === 'bottom-right' ? 'primary' : 'secondary'}
                    size="sm"
                  >
                    ↘ Bas droite
                  </Button>
                </div>
              </div>

              <Button onClick={applyWatermark} className="w-full">
                Appliquer le filigrane
              </Button>
            </CardContent>
          </Card>
        </>
      )}

      <canvas ref={canvasRef} className="hidden" />

      {result && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Image avec filigrane</CardTitle>
              <Button onClick={downloadImage} size="sm">
                Télécharger
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <img
              src={result}
              alt="Avec filigrane"
              className="max-w-full h-auto rounded-lg"
            />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>💡 Conseils</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300 list-disc list-inside">
            <li>Utilisez une opacité entre 30-50% pour ne pas masquer l'image</li>
            <li>Positionnez le filigrane sur une zone peu importante de l'image</li>
            <li>Un filigrane discret protège sans gêner la visualisation</li>
            <li>Préférez un coin pour les photos de paysage, le centre pour les portraits</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
