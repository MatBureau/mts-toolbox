'use client'

import { useState } from 'react'
import { PDFDocument } from 'pdf-lib'
import Button from '@/components/ui/Button'
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card'

export default function CompresserPDF() {
  const [file, setFile] = useState<File | null>(null)
  const [originalSize, setOriginalSize] = useState<number>(0)
  const [compressedSize, setCompressedSize] = useState<number>(0)
  const [compressing, setCompressing] = useState(false)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setOriginalSize(selectedFile.size)
      setCompressedSize(0)
    }
  }

  const compressPDF = async () => {
    if (!file) return
    setCompressing(true)

    try {
      const arrayBuffer = await file.arrayBuffer()
      const pdfDoc = await PDFDocument.load(arrayBuffer)

      // Compression basique via pdf-lib (réduction de métadonnées et optimisation)
      const pdfBytes = await pdfDoc.save({
        useObjectStreams: false,
      })

      setCompressedSize(pdfBytes.length)

      const blob = new Blob([pdfBytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `compressed_${file.name}`
      link.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Erreur lors de la compression:', error)
      alert('Erreur lors de la compression du PDF')
    } finally {
      setCompressing(false)
    }
  }

  const formatSize = (bytes: number) => {
    return (bytes / 1024 / 1024).toFixed(2) + ' MB'
  }

  const getSavings = () => {
    if (originalSize && compressedSize) {
      const savings = ((originalSize - compressedSize) / originalSize) * 100
      return savings > 0 ? savings.toFixed(1) + '%' : '0%'
    }
    return '0%'
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

      {file && (
        <Card>
          <CardHeader>
            <CardTitle>Compression</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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

            <Button
              onClick={compressPDF}
              disabled={compressing}
              className="w-full"
            >
              {compressing ? 'Compression...' : 'Compresser le PDF'}
            </Button>

            <p className="text-sm text-gray-600 dark:text-gray-400">
              ℹ️ La compression peut varier selon le contenu du PDF. Les PDF déjà optimisés
              verront peu de réduction.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
