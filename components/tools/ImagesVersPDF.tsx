'use client'

import { useState } from 'react'
import { PDFDocument } from 'pdf-lib'
import Button from '@/components/ui/Button'
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card'

export default function ImagesVersPDF() {
  const [images, setImages] = useState<File[]>([])
  const [creating, setCreating] = useState(false)

  const handleImagesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(Array.from(e.target.files))
    }
  }

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
  }

  const moveImage = (index: number, direction: 'up' | 'down') => {
    const newImages = [...images]
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= images.length) return
    [newImages[index], newImages[newIndex]] = [newImages[newIndex], newImages[index]]
    setImages(newImages)
  }

  const createPDF = async () => {
    if (images.length === 0) return
    setCreating(true)

    try {
      const pdfDoc = await PDFDocument.create()

      for (const image of images) {
        const arrayBuffer = await image.arrayBuffer()
        const imageType = image.type

        let embeddedImage
        if (imageType === 'image/png') {
          embeddedImage = await pdfDoc.embedPng(arrayBuffer)
        } else if (imageType === 'image/jpeg' || imageType === 'image/jpg') {
          embeddedImage = await pdfDoc.embedJpg(arrayBuffer)
        } else {
          continue
        }

        const page = pdfDoc.addPage([embeddedImage.width, embeddedImage.height])
        page.drawImage(embeddedImage, {
          x: 0,
          y: 0,
          width: embeddedImage.width,
          height: embeddedImage.height,
        })
      }

      const pdfBytes = await pdfDoc.save()
      const blob = new Blob([pdfBytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'images.pdf'
      link.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Erreur lors de la création:', error)
      alert('Erreur lors de la création du PDF')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Sélectionner les images</CardTitle>
        </CardHeader>
        <CardContent>
          <input
            type="file"
            accept="image/png,image/jpeg,image/jpg"
            multiple
            onChange={handleImagesSelect}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
          />
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Formats acceptés: PNG, JPG
          </p>
        </CardContent>
      </Card>

      {images.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Images sélectionnées ({images.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {images.map((image, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">🖼️</span>
                    <div>
                      <div className="font-medium">{image.name}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {(image.size / 1024).toFixed(2)} KB
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => moveImage(index, 'up')}
                      disabled={index === 0}
                      className="p-1 text-gray-600 hover:text-gray-900 disabled:opacity-30"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => moveImage(index, 'down')}
                      disabled={index === images.length - 1}
                      className="p-1 text-gray-600 hover:text-gray-900 disabled:opacity-30"
                    >
                      ↓
                    </button>
                    <button
                      onClick={() => removeImage(index)}
                      className="p-1 text-red-600 hover:text-red-900"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <Button
              onClick={createPDF}
              disabled={creating}
              className="w-full mt-4"
            >
              {creating ? 'Création...' : `Créer le PDF (${images.length} images)`}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
