'use client'

import { useState } from 'react'
import { leftoverPaste, parsePastedReferences, type PastedRow } from '@/lib/palette-mixte/paste'
import { LIMITS } from '@/lib/palette-mixte/types'

/** onImport renvoie le nombre de lignes refusées faute de place (limite de références). */
export default function PasteImport({ onImport, onClose, room }: { onImport: (rows: PastedRow[]) => number; onClose: () => void; room: number }) {
  const [text, setText] = useState('')
  const [errors, setErrors] = useState<{ line: number; message: string }[]>([])
  const [ignored, setIgnored] = useState(0)

  const run = () => {
    const res = parsePastedReferences(text)
    const refused = res.rows.length > 0 ? onImport(res.rows) : 0
    const imported = res.rows.length - refused
    setIgnored(refused)
    if (imported === 0) {
      setErrors(res.errors)
      return
    }
    // Les lignes importées quittent la zone de collage : un second clic ne crée pas de doublon
    const left = leftoverPaste(text, res, imported)
    setText(left.text)
    setErrors(left.errors)
    if (!left.text) onClose()
  }

  return (
    <div className="rounded-xl border border-primary-200 dark:border-primary-800 bg-primary-50/60 dark:bg-primary-900/10 p-3 space-y-2">
      <label htmlFor="paste-refs" className="block text-xs font-medium text-gray-700 dark:text-gray-300">
        Collez vos lignes depuis Excel : nom, longueur, largeur, hauteur (mm), quantité, poids (kg)
      </label>
      <textarea
        id="paste-refs"
        rows={5}
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder={'Carton A\t600\t400\t400\t12\t15\nCarton B\t400\t300\t250\t20\t6'}
        className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 p-2 font-mono text-xs text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
      />
      {errors.length > 0 && (
        <ul className="text-xs text-red-600 dark:text-red-400 space-y-0.5">
          {errors.slice(0, 5).map(e => (
            <li key={e.line}>Ligne {e.line} : {e.message}</li>
          ))}
          {errors.length > 5 && <li>… et {errors.length - 5} autre(s)</li>}
        </ul>
      )}
      {ignored > 0 && (
        <p className="text-xs text-red-600 dark:text-red-400">
          {ignored} ligne(s) ignorée(s) : limite de {LIMITS.maxReferences} références
        </p>
      )}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-[11px] text-gray-500">{room} référence(s) peuvent encore être ajoutées</span>
        <div className="flex gap-2">
          <button type="button" onClick={onClose} className="h-8 px-3 rounded-md text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">
            Annuler
          </button>
          <button
            type="button"
            onClick={run}
            disabled={!text.trim() || room === 0}
            className="h-8 px-3 rounded-md text-sm bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50"
          >
            Ajouter
          </button>
        </div>
      </div>
    </div>
  )
}
