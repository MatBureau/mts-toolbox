'use client'

import { useState, useRef } from 'react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card'

export default function CompresseurImages() {
  const [image, setImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [quality, setQuality] = useState<number>(80)
  const [originalSize, setOriginalSize] = useState<number>(0)
  const [compressedSize, setCompressedSize] = useState<number>(0)
  const [compressing, setCompressing] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImage(file)
      setOriginalSize(file.size)
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const compressImage = () => {
    if (!image || !canvasRef.current) return

    setCompressing(true)
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx?.drawImage(img, 0, 0)

      canvas.toBlob(
        (blob) => {
          if (blob) {
            setCompressedSize(blob.size)
            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = `compressed_${image.name}`
            link.click()
            URL.revokeObjectURL(url)
          }
          setCompressing(false)
        },
        'image/jpeg',
        quality / 100
      )
    }

    img.src = previewUrl
  }

  const formatSize = (bytes: number) => {
    return (bytes / 1024).toFixed(2) + ' KB'
  }

  const getSavings = () => {
    if (originalSize && compressedSize) {
      const savings = ((originalSize - compressedSize) / originalSize) * 100
      return savings.toFixed(1) + '%'
    }
    return '0%'
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
              <CardTitle>Paramètres de compression</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Qualité: {quality}%
                </label>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={quality}
                  onChange={(e) => setQuality(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>

              {compressedSize > 0 && (
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span>Taille originale:</span>
                    <span className="font-semibold">{formatSize(originalSize)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Taille compressée:</span>
                    <span className="font-semibold">{formatSize(compressedSize)}</span>
                  </div>
                  <div className="flex justify-between text-green-600 dark:text-green-400">
                    <span>Économie:</span>
                    <span className="font-semibold">{getSavings()}</span>
                  </div>
                </div>
              )}

              <Button onClick={compressImage} disabled={compressing} className="w-full">
                {compressing ? 'Compression...' : 'Compresser et télécharger'}
              </Button>
            </CardContent>
          </Card>
        </>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}
