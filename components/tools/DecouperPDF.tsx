'use client'

import { useState } from 'react'
import { PDFDocument } from 'pdf-lib'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card'

export default function DecouperPDF() {
  const [file, setFile] = useState<File | null>(null)
  const [totalPages, setTotalPages] = useState<number>(0)
  const [startPage, setStartPage] = useState<string>('1')
  const [endPage, setEndPage] = useState<string>('')
  const [extracting, setExtracting] = useState(false)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      const arrayBuffer = await selectedFile.arrayBuffer()
      const pdf = await PDFDocument.load(arrayBuffer)
      const pages = pdf.getPageCount()
      setTotalPages(pages)
      setEndPage(String(pages))
    }
  }

  const extractPages = async () => {
    if (!file) return
    setExtracting(true)

    try {
      const start = parseInt(startPage) - 1
      const end = parseInt(endPage)

      if (start < 0 || end > totalPages || start >= end) {
        alert('Plage de pages invalide')
        return
      }

      const arrayBuffer = await file.arrayBuffer()
      const pdfDoc = await PDFDocument.load(arrayBuffer)
      const newPdf = await PDFDocument.create()

      const pages = await newPdf.copyPages(
        pdfDoc,
        Array.from({ length: end - start }, (_, i) => start + i)
      )
      pages.forEach((page) => newPdf.addPage(page))

      const pdfBytes = await newPdf.save()
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `extracted_pages_${startPage}-${endPage}.pdf`
      link.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Erreur lors de l\'extraction:', error)
      alert('Erreur lors de l\'extraction des pages')
    } finally {
      setExtracting(false)
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
            <CardTitle>Sélectionner les pages à extraire</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Document: {totalPages} pages
            </p>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Page de début"
                type="number"
                value={startPage}
                onChange={(e) => setStartPage(e.target.value)}
                min="1"
                max={totalPages}
              />
              <Input
                label="Page de fin"
                type="number"
                value={endPage}
                onChange={(e) => setEndPage(e.target.value)}
                min="1"
                max={totalPages}
              />
            </div>
            <Button
              onClick={extractPages}
              disabled={extracting}
              className="w-full"
            >
              {extracting ? 'Extraction...' : 'Extraire les pages'}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
