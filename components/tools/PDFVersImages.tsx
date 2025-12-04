'use client'

import { useState } from 'react'
import * as pdfjsLib from 'pdfjs-dist'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card'

// Configure le worker PDF.js
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`
}

export default function PDFVersImages() {
  const [file, setFile] = useState<File | null>(null)
  const [totalPages, setTotalPages] = useState<number>(0)
  const [format, setFormat] = useState<string>('png')
  const [converting, setConverting] = useState(false)
  const [progress, setProgress] = useState<number>(0)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      const arrayBuffer = await selectedFile.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
      setTotalPages(pdf.numPages)
    }
  }

  const convertToImages = async () => {
    if (!file) return
    setConverting(true)
    setProgress(0)

    try {
      const arrayBuffer = await file.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum)
        const viewport = page.getViewport({ scale: 2.0 })
        const canvas = document.createElement('canvas')
        const context = canvas.getContext('2d')

        canvas.width = viewport.width
        canvas.height = viewport.height

        if (context) {
          await page.render({
            canvasContext: context,
            viewport: viewport,
          } as any).promise

          canvas.toBlob((blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob)
              const link = document.createElement('a')
              link.href = url
              link.download = `page_${pageNum}.${format}`
              link.click()
              URL.revokeObjectURL(url)
            }
          }, `image/${format}`)
        }

        setProgress(Math.round((pageNum / pdf.numPages) * 100))
      }
    } catch (error) {
      console.error('Erreur lors de la conversion:', error)
      alert('Erreur lors de la conversion du PDF')
    } finally {
      setConverting(false)
      setProgress(0)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Sélectionner un fichier PDF</CardTitle>
        </CardHeader>
        <CardContent>
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileSelect}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
          />
        </CardContent>
      </Card>

      {file && totalPages > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Options de conversion</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Document: {totalPages} pages
            </p>
            <Select
              label="Format d'image"
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              options={[
                { value: 'png', label: 'PNG (meilleure qualité)' },
                { value: 'jpeg', label: 'JPEG (plus petit)' },
              ]}
            />
            {converting && progress > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Conversion en cours...</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
            <Button
              onClick={convertToImages}
              disabled={converting}
              className="w-full"
            >
              {converting ? 'Conversion...' : `Convertir en images (${totalPages} pages)`}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
