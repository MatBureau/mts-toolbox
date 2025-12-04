'use client'

import { useState, useRef } from 'react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card'

export default function GenerateurPlaceholder() {
  const [width, setWidth] = useState<number>(600)
  const [height, setHeight] = useState<number>(400)
  const [bgColor, setBgColor] = useState<string>('#cccccc')
  const [textColor, setTextColor] = useState<string>('#666666')
  const [text, setText] = useState<string>('')
  const [format, setFormat] = useState<string>('png')
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const generatePlaceholder = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = width
    canvas.height = height

    ctx.fillStyle = bgColor
    ctx.fillRect(0, 0, width, height)

    const displayText = text || `${width} × ${height}`
    ctx.fillStyle = textColor
    ctx.font = `${Math.min(width, height) / 10}px Arial`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(displayText, width / 2, height / 2)

    return canvas.toDataURL(`image/${format === 'jpg' ? 'jpeg' : format}`)
  }

  const downloadPlaceholder = () => {
    const dataUrl = generatePlaceholder()
    if (!dataUrl) return

    const link = document.createElement('a')
    link.href = dataUrl
    link.download = `placeholder-${width}x${height}.${format}`
    link.click()
  }

  const previewUrl = generatePlaceholder()

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Dimensions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Largeur (px)"
              type="number"
              value={width}
              onChange={(e) => setWidth(parseInt(e.target.value) || 600)}
              min="1"
            />
            <Input
              label="Hauteur (px)"
              type="number"
              value={height}
              onChange={(e) => setHeight(parseInt(e.target.value) || 400)}
              min="1"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Personnalisation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Couleur de fond
              </label>
              <div className="flex space-x-2">
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="h-10 w-20"
                />
                <Input
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Couleur du texte
              </label>
              <div className="flex space-x-2">
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="h-10 w-20"
                />
                <Input
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                />
              </div>
            </div>
          </div>

          <Input
            label="Texte personnalisé (optionnel)"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={`${width} × ${height}`}
          />

          <Select
            label="Format"
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            options={[
              { value: 'png', label: 'PNG' },
              { value: 'jpg', label: 'JPG' },
            ]}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Aperçu</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {previewUrl && (
            <img src={previewUrl} alt="Preview" className="max-w-full h-auto rounded-lg border border-gray-300 dark:border-gray-600" />
          )}
          <Button onClick={downloadPlaceholder} className="w-full">
            Télécharger le placeholder
          </Button>
        </CardContent>
      </Card>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}
