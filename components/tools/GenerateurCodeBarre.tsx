'use client'

import { useState, useRef, useEffect } from 'react'
import JsBarcode from 'jsbarcode'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card'

export default function GenerateurCodeBarre() {
  const [text, setText] = useState<string>('1234567890')
  const [format, setFormat] = useState<string>('CODE128')
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    generateBarcode()
  }, [text, format])

  const generateBarcode = () => {
    const canvas = canvasRef.current
    if (!canvas || !text) return

    try {
      setError('')
      JsBarcode(canvas, text, {
        format: format,
        width: 2,
        height: 80,
        displayValue: true,
        fontSize: 14,
        margin: 10,
      })
    } catch (err) {
      setError('Code invalide pour ce format')
      const ctx = canvas.getContext('2d')
      if (ctx) {
        canvas.width = 300
        canvas.height = 100
        ctx.fillStyle = 'white'
        ctx.fillRect(0, 0, 300, 100)
      }
    }
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
              { value: 'CODE128', label: 'CODE 128' },
              { value: 'EAN13', label: 'EAN-13' },
              { value: 'CODE39', label: 'CODE 39' },
              { value: 'UPC', label: 'UPC' },
              { value: 'ITF14', label: 'ITF-14' },
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
            {error && (
              <div className="p-3 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg text-sm">
                {error}
              </div>
            )}
            <div className="flex justify-center p-4 bg-white rounded-lg">
              <canvas ref={canvasRef} />
            </div>
            <Button onClick={downloadBarcode} className="w-full" disabled={!!error}>
              Télécharger le code-barres
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
