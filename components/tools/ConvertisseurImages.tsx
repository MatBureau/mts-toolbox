'use client'

import { useState, useRef } from 'react'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card'

export default function ConvertisseurImages() {
  const [image, setImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [outputFormat, setOutputFormat] = useState<string>('png')
  const [converting, setConverting] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const downloadLinkRef = useRef<HTMLAnchorElement>(null)

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

  const convertImage = () => {
    if (!image || !canvasRef.current) return

    setConverting(true)
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx?.drawImage(img, 0, 0)

      const mimeType = `image/${outputFormat === 'jpg' ? 'jpeg' : outputFormat}`
      const quality = outputFormat === 'jpg' ? 0.9 : undefined

      canvas.toBlob(
        (blob) => {
          if (blob && downloadLinkRef.current) {
            const url = URL.createObjectURL(blob)
            const link = downloadLinkRef.current
            link.href = url
            link.download = `converted.${outputFormat}`
            link.click()
            URL.revokeObjectURL(url)
          }
          setConverting(false)
        },
        mimeType,
        quality
      )
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Format de sortie</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select
                value={outputFormat}
                onChange={(e) => setOutputFormat(e.target.value)}
                options={[
                  { value: 'png', label: 'PNG' },
                  { value: 'jpg', label: 'JPG' },
                  { value: 'webp', label: 'WebP' },
                ]}
              />
              <Button onClick={convertImage} disabled={converting} className="w-full">
                {converting ? 'Conversion...' : 'Convertir et télécharger'}
              </Button>
            </CardContent>
          </Card>
        </>
      )}

      <canvas ref={canvasRef} className="hidden" />
      <a ref={downloadLinkRef} className="hidden" />
    </div>
  )
}
