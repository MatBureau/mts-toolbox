'use client'

import { useState, useRef } from 'react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card'

export default function RedimensionneurImages() {
  const [image, setImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [width, setWidth] = useState<number>(0)
  const [height, setHeight] = useState<number>(0)
  const [originalWidth, setOriginalWidth] = useState<number>(0)
  const [originalHeight, setOriginalHeight] = useState<number>(0)
  const [maintainAspectRatio, setMaintainAspectRatio] = useState<boolean>(true)
  const [resizing, setResizing] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImage(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          setOriginalWidth(img.width)
          setOriginalHeight(img.height)
          setWidth(img.width)
          setHeight(img.height)
        }
        img.src = e.target?.result as string
        setPreviewUrl(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleWidthChange = (value: number) => {
    setWidth(value)
    if (maintainAspectRatio && originalWidth > 0) {
      const ratio = originalHeight / originalWidth
      setHeight(Math.round(value * ratio))
    }
  }

  const handleHeightChange = (value: number) => {
    setHeight(value)
    if (maintainAspectRatio && originalHeight > 0) {
      const ratio = originalWidth / originalHeight
      setWidth(Math.round(value * ratio))
    }
  }

  const resizeImage = () => {
    if (!image || !canvasRef.current || width <= 0 || height <= 0) return

    setResizing(true)
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      canvas.width = width
      canvas.height = height
      ctx?.drawImage(img, 0, 0, width, height)

      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download = `resized_${image.name}`
          link.click()
          URL.revokeObjectURL(url)
        }
        setResizing(false)
      }, 'image/png')
    }

    img.src = previewUrl
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
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                Dimensions originales: {originalWidth} × {originalHeight} px
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Nouvelles dimensions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Largeur (px)"
                  type="number"
                  value={width}
                  onChange={(e) => handleWidthChange(parseInt(e.target.value) || 0)}
                  min="1"
                />
                <Input
                  label="Hauteur (px)"
                  type="number"
                  value={height}
                  onChange={(e) => handleHeightChange(parseInt(e.target.value) || 0)}
                  min="1"
                />
              </div>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={maintainAspectRatio}
                  onChange={(e) => setMaintainAspectRatio(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">Conserver les proportions</span>
              </label>

              <Button onClick={resizeImage} disabled={resizing} className="w-full">
                {resizing ? 'Redimensionnement...' : 'Redimensionner et télécharger'}
              </Button>
            </CardContent>
          </Card>
        </>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}
