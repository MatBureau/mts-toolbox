'use client'

import { useState } from 'react'
import Textarea from '@/components/ui/Textarea'

export default function CompteurMots() {
  const [text, setText] = useState('')

  const stats = {
    caracteres: text.length,
    caracteresSansEspaces: text.replace(/\s/g, '').length,
    mots: text.trim() ? text.trim().split(/\s+/).length : 0,
    phrases: text.trim() ? text.split(/[.!?]+/).filter(Boolean).length : 0,
    paragraphes: text.trim() ? text.split(/\n\n+/).filter(Boolean).length : 0,
    lignes: text ? text.split(/\n/).length : 0,
  }

  return (
    <div className="space-y-6">
      <Textarea
        label="Entrez votre texte"
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={10}
        placeholder="Tapez ou collez votre texte ici..."
      />

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
          <div className="text-2xl font-bold text-primary-600">{stats.mots}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Mots</div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
          <div className="text-2xl font-bold text-primary-600">{stats.caracteres}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Caractères</div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
          <div className="text-2xl font-bold text-primary-600">{stats.caracteresSansEspaces}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Sans espaces</div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
          <div className="text-2xl font-bold text-primary-600">{stats.phrases}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Phrases</div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
          <div className="text-2xl font-bold text-primary-600">{stats.paragraphes}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Paragraphes</div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
          <div className="text-2xl font-bold text-primary-600">{stats.lignes}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Lignes</div>
        </div>
      </div>
    </div>
  )
}
