'use client'

import { useState } from 'react'
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card'

export default function EditeurPDF() {
  const [file, setFile] = useState<File | null>(null)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Éditeur PDF</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            L'éditeur PDF est temporairement en maintenance pour résoudre des problèmes de compatibilité.
          </p>
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
          />
          {file && (
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Fichier sélectionné: {file.name}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
