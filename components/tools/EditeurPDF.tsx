'use client'

import { useState, useRef, useEffect } from 'react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card'

type Tool = 'select' | 'text' | 'draw' | 'rectangle' | 'circle' | 'arrow'

interface Annotation {
  id: string
  type: Tool
  x: number
  y: number
  width?: number
  height?: number
  text?: string
  fontSize?: number
  color?: string
  points?: { x: number; y: number }[]
}

export default function EditeurPDF() {
  const [file, setFile] = useState<File | null>(null)
  const [totalPages, setTotalPages] = useState<number>(0)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [tool, setTool] = useState<Tool>('select')
  const [annotations, setAnnotations] = useState<Annotation[]>([])
  const [isDrawing, setIsDrawing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')

  const [textInput, setTextInput] = useState<string>('')
  const [fontSize, setFontSize] = useState<number>(16)
  const [color, setColor] = useState<string>('#000000')

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pdfDocRef = useRef<any>(null)
  const pdfjsLib = useRef<any>(null)

  useEffect(() => {
    // Charger pdfjs-dist uniquement côté client
    if (typeof window !== 'undefined' && !pdfjsLib.current) {
      import('pdfjs-dist').then((module) => {
        pdfjsLib.current = module
        module.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@4.0.269/build/pdf.worker.min.mjs'
      })
    }
  }, [])

  useEffect(() => {
    if (file && pdfjsLib.current) {
      initializePDF()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file])

  useEffect(() => {
    if (pdfDocRef.current && totalPages > 0 && canvasRef.current && !isDrawing) {
      redrawCanvas()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [annotations, currentPage, totalPages, isDrawing])

  const initializePDF = async () => {
    if (!file || !pdfjsLib.current) return

    setLoading(true)
    setError('')
    setTotalPages(0)

    try {
      const arrayBuffer = await file.arrayBuffer()
      const pdf = await pdfjsLib.current.getDocument({ data: arrayBuffer }).promise
      pdfDocRef.current = pdf
      setTotalPages(pdf.numPages)
      setLoading(false)
    } catch (error) {
      console.error('Erreur lors du chargement:', error)
      setError('Erreur lors du chargement du PDF. Veuillez réessayer.')
      setLoading(false)
      alert('Erreur lors du chargement du PDF. Veuillez vérifier que le fichier est valide.')
    }
  }

  const renderPage = async () => {
    if (!pdfDocRef.current || !canvasRef.current) return

    try {
      const page = await pdfDocRef.current.getPage(currentPage)
      const viewport = page.getViewport({ scale: 1.5 })
      const canvas = canvasRef.current
      const context = canvas.getContext('2d')

      canvas.width = viewport.width
      canvas.height = viewport.height

      if (context) {
        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        } as any
        await page.render(renderContext).promise
      }
    } catch (error) {
      console.error('Erreur lors du rendu:', error)
    }
  }

  const drawSingleAnnotation = (ctx: CanvasRenderingContext2D, ann: Annotation) => {
    if (ann.type === 'text' && ann.text) {
      ctx.font = `${ann.fontSize || 16}px Arial`
      ctx.fillStyle = ann.color || '#000000'
      ctx.fillText(ann.text, ann.x, ann.y)
    } else {
      ctx.strokeStyle = ann.color || '#FF0000'
      ctx.lineWidth = 2

      if (ann.type === 'rectangle' && ann.width && ann.height) {
        ctx.strokeRect(ann.x, ann.y, ann.width, ann.height)
      } else if (ann.type === 'circle' && ann.width) {
        ctx.beginPath()
        ctx.arc(ann.x, ann.y, ann.width / 2, 0, Math.PI * 2)
        ctx.stroke()
      } else if (ann.type === 'draw' && ann.points && ann.points.length > 1) {
        ctx.beginPath()
        ctx.moveTo(ann.points[0].x, ann.points[0].y)
        ann.points.forEach((point) => ctx.lineTo(point.x, point.y))
        ctx.stroke()
      } else if (ann.type === 'arrow' && ann.width && ann.height) {
        const fromX = ann.x
        const fromY = ann.y
        const toX = ann.x + ann.width
        const toY = ann.y + ann.height

        ctx.beginPath()
        ctx.moveTo(fromX, fromY)
        ctx.lineTo(toX, toY)
        ctx.stroke()

        const angle = Math.atan2(toY - fromY, toX - fromX)
        const arrowLength = 15
        ctx.beginPath()
        ctx.moveTo(toX, toY)
        ctx.lineTo(
          toX - arrowLength * Math.cos(angle - Math.PI / 6),
          toY - arrowLength * Math.sin(angle - Math.PI / 6)
        )
        ctx.moveTo(toX, toY)
        ctx.lineTo(
          toX - arrowLength * Math.cos(angle + Math.PI / 6),
          toY - arrowLength * Math.sin(angle + Math.PI / 6)
        )
        ctx.stroke()
      }
    }
  }

  const redrawCanvas = async () => {
    if (!canvasRef.current || !pdfDocRef.current) return

    // Render la page PDF
    await renderPage()

    // Attendre un peu que le PDF soit rendu
    setTimeout(() => {
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      // Dessiner toutes les annotations par-dessus
      annotations.forEach((ann) => drawSingleAnnotation(ctx, ann))
    }, 50)
  }

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return
    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    if (tool === 'text' && textInput) {
      const newAnnotation: Annotation = {
        id: Date.now().toString(),
        type: 'text',
        x,
        y,
        text: textInput,
        fontSize,
        color,
      }
      setAnnotations([...annotations, newAnnotation])
      setTextInput('')
    }
  }

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return
    if (tool === 'select' || tool === 'text') return

    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    setIsDrawing(true)

    if (tool === 'draw') {
      const newAnnotation: Annotation = {
        id: Date.now().toString(),
        type: 'draw',
        x,
        y,
        color,
        points: [{ x, y }],
      }
      setAnnotations([...annotations, newAnnotation])
    } else {
      const newAnnotation: Annotation = {
        id: Date.now().toString(),
        type: tool,
        x,
        y,
        width: 0,
        height: 0,
        color,
      }
      setAnnotations([...annotations, newAnnotation])
    }
  }

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    setAnnotations((prev) => {
      const updated = [...prev]
      const lastAnnotation = updated[updated.length - 1]

      if (tool === 'draw' && lastAnnotation.points) {
        lastAnnotation.points.push({ x, y })
      } else {
        lastAnnotation.width = x - lastAnnotation.x
        lastAnnotation.height = y - lastAnnotation.y
      }

      return updated
    })
  }

  const handleCanvasMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return

    // Finaliser l'annotation pour les formes (pas draw)
    if (tool !== 'draw' && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      setAnnotations((prev) => {
        const updated = [...prev]
        const lastAnnotation = updated[updated.length - 1]
        lastAnnotation.width = x - lastAnnotation.x
        lastAnnotation.height = y - lastAnnotation.y
        return updated
      })
    }

    setIsDrawing(false)
  }

  const savePDF = async () => {
    if (!file || !canvasRef.current) return
    setSaving(true)

    try {
      const { PDFDocument } = await import('pdf-lib')

      // Convertir le canvas (avec annotations) en image PNG
      const canvasDataUrl = canvasRef.current.toDataURL('image/png')
      const imageBytes = await fetch(canvasDataUrl).then(res => res.arrayBuffer())

      // Charger le PDF original
      const arrayBuffer = await file.arrayBuffer()
      const pdfDoc = await PDFDocument.load(arrayBuffer)

      // Embed l'image du canvas
      const pngImage = await pdfDoc.embedPng(imageBytes)

      // Obtenir la page actuelle
      const page = pdfDoc.getPages()[currentPage - 1]
      const { width, height } = page.getSize()

      // Dessiner l'image du canvas par-dessus la page existante
      // L'image doit être inversée verticalement (flipVertical)
      page.drawImage(pngImage, {
        x: 0,
        y: 0,
        width: width,
        height: height,
      })

      const pdfBytes = await pdfDoc.save()
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `edited_${file.name}`
      link.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
      alert('Erreur lors de la sauvegarde du PDF')
    } finally {
      setSaving(false)
    }
  }

  const clearAnnotations = () => {
    setAnnotations([])
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
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
          />
          {loading && (
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Chargement du PDF en cours...
            </p>
          )}
          {error && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          )}
        </CardContent>
      </Card>

      {file && totalPages > 0 && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Outils d&apos;annotation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                <Button
                  variant={tool === 'select' ? undefined : 'outline'}
                  onClick={() => setTool('select')}
                  className="text-sm"
                >
                  👆 Sélection
                </Button>
                <Button
                  variant={tool === 'text' ? undefined : 'outline'}
                  onClick={() => setTool('text')}
                  className="text-sm"
                >
                  📝 Texte
                </Button>
                <Button
                  variant={tool === 'draw' ? undefined : 'outline'}
                  onClick={() => setTool('draw')}
                  className="text-sm"
                >
                  ✏️ Dessin
                </Button>
                <Button
                  variant={tool === 'rectangle' ? undefined : 'outline'}
                  onClick={() => setTool('rectangle')}
                  className="text-sm"
                >
                  ◻️ Rectangle
                </Button>
                <Button
                  variant={tool === 'circle' ? undefined : 'outline'}
                  onClick={() => setTool('circle')}
                  className="text-sm"
                >
                  ⭕ Cercle
                </Button>
                <Button
                  variant={tool === 'arrow' ? undefined : 'outline'}
                  onClick={() => setTool('arrow')}
                  className="text-sm"
                >
                  ➡️ Flèche
                </Button>
              </div>

              {tool === 'text' && (
                <div className="space-y-2">
                  <Input
                    placeholder="Texte à ajouter"
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="number"
                      value={fontSize}
                      onChange={(e) => setFontSize(parseInt(e.target.value))}
                      min="8"
                      max="72"
                      placeholder="Taille"
                    />
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="h-10 w-full rounded"
                    />
                  </div>
                </div>
              )}

              {(tool === 'draw' || tool === 'rectangle' || tool === 'circle' || tool === 'arrow') && (
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="h-10 w-full rounded"
                />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <canvas
                ref={canvasRef}
                onClick={handleCanvasClick}
                onMouseDown={handleCanvasMouseDown}
                onMouseMove={handleCanvasMouseMove}
                onMouseUp={handleCanvasMouseUp}
                onMouseLeave={handleCanvasMouseUp}
                className="w-full border border-gray-300 dark:border-gray-600 rounded cursor-crosshair"
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    variant="outline"
                  >
                    ← Précédent
                  </Button>
                  <span className="text-sm">
                    Page {currentPage} / {totalPages}
                  </span>
                  <Button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    variant="outline"
                  >
                    Suivant →
                  </Button>
                </div>
                <Button onClick={clearAnnotations} variant="outline">
                  🗑️ Effacer tout
                </Button>
              </div>

              <Button onClick={savePDF} disabled={saving} className="w-full">
                {saving ? 'Sauvegarde...' : '💾 Télécharger le PDF annoté'}
              </Button>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
