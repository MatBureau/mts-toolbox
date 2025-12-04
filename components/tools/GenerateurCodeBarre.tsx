'use client'

import { useState, useRef, useEffect } from 'react'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card'

export default function GenerateurCodeBarre() {
  const [text, setText] = useState<string>('1234567890')
  const [format, setFormat] = useState<string>('code128')
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    generateBarcode()
  }, [text, format])

  const generateBarcode = () => {
    const canvas = canvasRef.current
    if (!canvas || !text) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = 300
    const height = 100
    canvas.width = width
    canvas.height = height

    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, width, height)

    const barWidth = width / text.length
    const barHeight = height * 0.7

    ctx.fillStyle = 'black'
    text.split('').forEach((char, i) => {
      const code = char.charCodeAt(0)
      if (code % 2 === 0) {
        ctx.fillRect(i * barWidth, 10, barWidth * 0.5, barHeight)
      }
    })

    ctx.fillStyle = 'black'
    ctx.font = '12px monospace'
    ctx.textAlign = 'center'
    ctx.fillText(text, width / 2, height - 10)
  }

  const downloadBarcode = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `barcode-${text}.png`
        link.click()
        URL.revokeObjectURL(url)
      }
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Paramètres</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Texte ou code"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Entrez le code"
          />

          <Select
            label="Format"
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            options={[
              { value: 'code128', label: 'CODE 128' },
              { value: 'ean13', label: 'EAN-13' },
              { value: 'code39', label: 'CODE 39' },
            ]}
          />
        </CardContent>
      </Card>

      {text && (
        <Card>
          <CardHeader>
            <CardTitle>Code-barres</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center p-4 bg-white rounded-lg">
              <canvas ref={canvasRef} />
            </div>
            <Button onClick={downloadBarcode} className="w-full">
              Télécharger le code-barres
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
