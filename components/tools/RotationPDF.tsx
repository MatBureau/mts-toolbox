'use client'

import { useState } from 'react'
import { PDFDocument, degrees } from 'pdf-lib'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card'

export default function RotationPDF() {
  const [file, setFile] = useState<File | null>(null)
  const [totalPages, setTotalPages] = useState<number>(0)
  const [rotation, setRotation] = useState<string>('90')
  const [rotating, setRotating] = useState(false)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      const arrayBuffer = await selectedFile.arrayBuffer()
      const pdf = await PDFDocument.load(arrayBuffer)
      setTotalPages(pdf.getPageCount())
    }
  }

  const rotatePDF = async () => {
    if (!file) return
    setRotating(true)

    try {
      const arrayBuffer = await file.arrayBuffer()
      const pdfDoc = await PDFDocument.load(arrayBuffer)
      const pages = pdfDoc.getPages()
      const rotationValue = parseInt(rotation)

      pages.forEach((page) => {
        page.setRotation(degrees(rotationValue))
      })

      const pdfBytes = await pdfDoc.save()
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `rotated_${rotation}.pdf`
      link.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Erreur lors de la rotation:', error)
      alert('Erreur lors de la rotation du PDF')
    } finally {
      setRotating(false)
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

      {file && (
        <Card>
          <CardHeader>
            <CardTitle>Rotation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Document: {totalPages} pages
            </p>
            <Select
              label="Angle de rotation"
              value={rotation}
              onChange={(e) => setRotation(e.target.value)}
              options={[
                { value: '90', label: '90° (sens horaire)' },
                { value: '180', label: '180°' },
                { value: '270', label: '270° (sens anti-horaire)' },
              ]}
            />
            <Button
              onClick={rotatePDF}
              disabled={rotating}
              className="w-full"
            >
              {rotating ? 'Rotation...' : 'Appliquer la rotation'}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
