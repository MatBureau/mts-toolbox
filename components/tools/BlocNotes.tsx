'use client'

import { useState, useEffect, useCallback } from 'react'
import Textarea from '@/components/ui/Textarea'
import Button from '@/components/ui/Button'
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card'

export default function BlocNotes() {
  const [notes, setNotes] = useState('')
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [autoSave, setAutoSave] = useState(true)

  // Load notes from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('mts-notes')
    if (saved) {
      setNotes(saved)
      const savedDate = localStorage.getItem('mts-notes-date')
      if (savedDate) {
        setLastSaved(new Date(savedDate))
      }
    }
  }, [])

  // Save notes to localStorage
  const saveNotes = useCallback(() => {
    localStorage.setItem('mts-notes', notes)
    const now = new Date()
    localStorage.setItem('mts-notes-date', now.toISOString())
    setLastSaved(now)
  }, [notes])

  // Auto-save with debounce
  useEffect(() => {
    if (!autoSave) return

    const timer = setTimeout(() => {
      saveNotes()
    }, 1000)

    return () => clearTimeout(timer)
  }, [notes, autoSave, saveNotes])

  const clearNotes = () => {
    if (confirm('Êtes-vous sûr de vouloir effacer toutes vos notes ?')) {
      setNotes('')
      localStorage.removeItem('mts-notes')
      localStorage.removeItem('mts-notes-date')
      setLastSaved(null)
    }
  }

  const downloadNotes = () => {
    const blob = new Blob([notes], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `notes-${new Date().toISOString().split('T')[0]}.txt`
    link.click()
    URL.revokeObjectURL(url)
  }

  const wordCount = notes.trim().split(/\s+/).filter(w => w.length > 0).length
  const charCount = notes.length
  const lineCount = notes.split('\n').length

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Vos notes</CardTitle>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <input
                  type="checkbox"
                  checked={autoSave}
                  onChange={(e) => setAutoSave(e.target.checked)}
                  className="rounded"
                />
                Auto-sauvegarde
              </label>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Écrivez vos notes ici... Elles seront sauvegardées automatiquement dans votre navigateur."
            rows={15}
          />

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-4 text-xs text-gray-500 dark:text-gray-400">
              <span>{wordCount} mots</span>
              <span>{charCount} caractères</span>
              <span>{lineCount} lignes</span>
            </div>

            {lastSaved && (
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Dernière sauvegarde : {lastSaved.toLocaleTimeString('fr-FR')}
              </div>
            )}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Button onClick={saveNotes} variant="secondary" size="sm">
              Sauvegarder maintenant
            </Button>
            <Button onClick={downloadNotes} variant="secondary" size="sm">
              Télécharger (.txt)
            </Button>
            <Button onClick={clearNotes} variant="secondary" size="sm">
              Effacer tout
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>💡 À propos</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300 list-disc list-inside">
            <li>Vos notes sont sauvegardées localement dans votre navigateur</li>
            <li>Elles restent disponibles même après fermeture du navigateur</li>
            <li>Les données ne sont jamais envoyées sur internet</li>
            <li>Pensez à télécharger vos notes importantes en backup</li>
            <li>Effacer les données du navigateur supprimera vos notes</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>⌨️ Raccourcis clavier</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
            <li><kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">Ctrl</kbd> + <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">S</kbd> : Sauvegarder (navigateur)</li>
            <li><kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">Ctrl</kbd> + <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">A</kbd> : Tout sélectionner</li>
            <li><kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">Ctrl</kbd> + <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">Z</kbd> : Annuler</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
