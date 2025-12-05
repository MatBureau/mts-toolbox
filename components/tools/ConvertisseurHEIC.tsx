'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card'

export default function ConvertisseurHEIC() {
  const [files, setFiles] = useState<File[]>([])
  const [converting, setConverting] = useState(false)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    setFiles(selectedFiles)
  }

  const convertToJPG = async () => {
    if (files.length === 0) return

    setConverting(true)

    // Note: Real HEIC conversion requires a library like heic2any
    // This is a placeholder implementation
    alert('La conversion HEIC nécessite une bibliothèque externe (heic2any). Cette fonctionnalité sera disponible prochainement.')

    setConverting(false)
  }

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Charger des images HEIC</CardTitle>
        </CardHeader>
        <CardContent>
          <input
            type="file"
            accept=".heic,.HEIC"
            multiple
            onChange={handleFileUpload}
            className="block w-full text-sm text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer bg-white dark:bg-gray-800 focus:outline-none p-2"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Sélectionnez un ou plusieurs fichiers HEIC (format iPhone)
          </p>
        </CardContent>
      </Card>

      {files.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Fichiers sélectionnés ({files.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {files.map((file, index) => (
                <li key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{file.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <Button onClick={() => removeFile(index)} variant="secondary" size="sm">
                    Retirer
                  </Button>
                </li>
              ))}
            </ul>

            <div className="mt-4 flex gap-3">
              <Button onClick={convertToJPG} className="flex-1" disabled={converting}>
                {converting ? 'Conversion...' : 'Convertir en JPG'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>💡 À propos du format HEIC</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300 list-disc list-inside">
            <li><strong>HEIC</strong> (High Efficiency Image Container) : format par défaut des iPhone depuis iOS 11</li>
            <li>Occupe 50% moins d'espace qu'un JPEG pour la même qualité</li>
            <li>Non supporté par tous les navigateurs et logiciels</li>
            <li>Conversion en JPG/PNG pour une compatibilité universelle</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>⚙️ Note technique</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            La conversion HEIC nécessite la bibliothèque <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">heic2any</code>.
            Cette fonctionnalité sera intégrée dans une prochaine version.
          </p>
          <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
            En attendant, vous pouvez utiliser des outils en ligne ou activer "Transférer vers Mac/PC" dans les réglages iPhone › Photos › Transférer pour convertir automatiquement.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
