'use client'

import { useState, useRef } from 'react'
import Button from '@/components/ui/Button'
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card'

export default function RecadrageImage() {
  const [image, setImage] = useState<string | null>(null)
  const [croppedImage, setCroppedImage] = useState<string | null>(null)
  const [aspectRatio, setAspectRatio] = useState<string>('free')
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setImage(e.target?.result as string)
        setCroppedImage(null)
      }
      reader.readAsDataURL(file)
    }
  }

  const cropImage = () => {
    if (!imageRef.current || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = imageRef.current
    let width = img.naturalWidth
    let height = img.naturalHeight

    // Apply aspect ratio
    if (aspectRatio === '1:1') {
      const size = Math.min(width, height)
      width = height = size
    } else if (aspectRatio === '16:9') {
      if (width / height > 16 / 9) {
        width = height * (16 / 9)
      } else {
        height = width * (9 / 16)
      }
    } else if (aspectRatio === '4:3') {
      if (width / height > 4 / 3) {
        width = height * (4 / 3)
      } else {
        height = width * (3 / 4)
      }
    }

    canvas.width = width
    canvas.height = height

    // Center crop
    const sx = (img.naturalWidth - width) / 2
    const sy = (img.naturalHeight - height) / 2

    ctx.drawImage(img, sx, sy, width, height, 0, 0, width, height)

    setCroppedImage(canvas.toDataURL('image/png'))
  }

  const downloadImage = () => {
    if (!croppedImage) return

    const link = document.createElement('a')
    link.href = croppedImage
    link.download = 'image-recadree.png'
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
              <CardTitle>Ratio d'aspect</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 flex-wrap">
                <Button
                  onClick={() => setAspectRatio('free')}
                  variant={aspectRatio === 'free' ? 'primary' : 'secondary'}
                  size="sm"
                >
                  Libre
                </Button>
                <Button
                  onClick={() => setAspectRatio('1:1')}
                  variant={aspectRatio === '1:1' ? 'primary' : 'secondary'}
                  size="sm"
                >
                  1:1 (Carré)
                </Button>
                <Button
                  onClick={() => setAspectRatio('16:9')}
                  variant={aspectRatio === '16:9' ? 'primary' : 'secondary'}
                  size="sm"
                >
                  16:9 (HD)
                </Button>
                <Button
                  onClick={() => setAspectRatio('4:3')}
                  variant={aspectRatio === '4:3' ? 'primary' : 'secondary'}
                  size="sm"
                >
                  4:3 (Standard)
                </Button>
              </div>
              <Button onClick={cropImage} className="w-full mt-4">
                Recadrer l'image
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Image originale</CardTitle>
            </CardHeader>
            <CardContent>
              <img
                ref={imageRef}
                src={image}
                alt="Original"
                className="max-w-full h-auto rounded-lg"
              />
            </CardContent>
          </Card>
        </>
      )}

      <canvas ref={canvasRef} className="hidden" />

      {croppedImage && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Image recadrée</CardTitle>
              <Button onClick={downloadImage} size="sm">
                Télécharger
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <img
              src={croppedImage}
              alt="Recadrée"
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
            <li>Utilisez 1:1 pour Instagram, photos de profil</li>
            <li>16:9 pour vidéos YouTube, bannières web</li>
            <li>4:3 pour photos standard, présentations</li>
            <li>Le recadrage est centré automatiquement</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
