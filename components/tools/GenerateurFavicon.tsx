'use client'

import { useState, useRef } from 'react'
import Button from '@/components/ui/Button'
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card'

export default function GenerateurFavicon() {
  const [image, setImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [generating, setGenerating] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImage(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const generateFavicon = (size: number) => {
    if (!image || !canvasRef.current) return

    setGenerating(true)
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      canvas.width = size
      canvas.height = size
      ctx?.drawImage(img, 0, 0, size, size)

      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download = size === 16 ? 'favicon-16x16.png' : size === 32 ? 'favicon-32x32.png' : `favicon-${size}x${size}.png`
          link.click()
          URL.revokeObjectURL(url)
        }
        setGenerating(false)
      }, 'image/png')
    }

    img.src = previewUrl
  }

  const generateAllSizes = () => {
    const sizes = [16, 32, 48, 64, 128, 256]
    sizes.forEach((size, index) => {
      setTimeout(() => generateFavicon(size), index * 100)
    })
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
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Pour de meilleurs résultats, utilisez une image carrée
          </p>
        </CardContent>
      </Card>

      {previewUrl && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Aperçu</CardTitle>
            </CardHeader>
            <CardContent>
              <img src={previewUrl} alt="Preview" className="max-w-full h-auto rounded-lg" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Générer les favicons</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Button onClick={() => generateFavicon(16)} disabled={generating} variant="outline">
                  16×16
                </Button>
                <Button onClick={() => generateFavicon(32)} disabled={generating} variant="outline">
                  32×32
                </Button>
                <Button onClick={() => generateFavicon(48)} disabled={generating} variant="outline">
                  48×48
                </Button>
                <Button onClick={() => generateFavicon(64)} disabled={generating} variant="outline">
                  64×64
                </Button>
                <Button onClick={() => generateFavicon(128)} disabled={generating} variant="outline">
                  128×128
                </Button>
                <Button onClick={() => generateFavicon(256)} disabled={generating} variant="outline">
                  256×256
                </Button>
              </div>

              <Button onClick={generateAllSizes} disabled={generating} className="w-full">
                {generating ? 'Génération...' : 'Télécharger toutes les tailles'}
              </Button>
            </CardContent>
          </Card>
        </>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}
