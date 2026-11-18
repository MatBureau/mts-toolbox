'use client'

import { ChevronDown, Copy, Trash2 } from 'lucide-react'
import { NumberField, Toggle } from '../palette/fields'
import type { RefForm } from '@/lib/palette-mixte/form'

interface ReferenceCardProps {
  value: RefForm
  color: string
  onChange: (patch: Partial<RefForm>) => void
  onDuplicate: () => void
  onRemove: () => void
  canDuplicate: boolean
}

export default function ReferenceCard({ value, color, onChange, onDuplicate, onRemove, canDuplicate }: ReferenceCardProps) {
  // Options avancées ouvertes d'office si l'une d'elles est renseignée
  const advancedSet = value.maxLoadOnTop !== '' || value.keepTogether || (value.stop !== '' && value.stop !== '1')

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/60 p-3">
      <div className="flex items-center gap-2 mb-3">
        <span className="h-3 w-3 rounded-sm shrink-0" style={{ background: color }} aria-hidden="true" />
        <input
          value={value.name}
          onChange={e => onChange({ name: e.target.value.slice(0, 40) })}
          aria-label="Nom du colis"
          className="flex-1 min-w-0 bg-transparent font-medium text-sm text-gray-900 dark:text-gray-100 border-b border-transparent focus:border-primary-500 focus:outline-none"
        />
        <button
          type="button"
          onClick={onDuplicate}
          disabled={!canDuplicate}
          title="Dupliquer"
          aria-label={`Dupliquer ${value.name}`}
          className="p-1.5 rounded text-gray-500 hover:text-primary-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40"
        >
          <Copy size={15} />
        </button>
        <button
          type="button"
          onClick={onRemove}
          title="Supprimer"
          aria-label={`Supprimer ${value.name}`}
          className="p-1.5 rounded text-gray-500 hover:text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <Trash2 size={15} />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <NumberField label="Longueur" unit="mm" value={value.length} onChange={v => onChange({ length: v })} />
        <NumberField label="Largeur" unit="mm" value={value.width} onChange={v => onChange({ width: v })} />
        <NumberField label="Hauteur" unit="mm" value={value.height} onChange={v => onChange({ height: v })} />
        <NumberField label="Quantité" unit="u." min={1} value={value.quantity} onChange={v => onChange({ quantity: v })} />
        <NumberField label="Poids" unit="kg" step={0.1} value={value.weight} onChange={v => onChange({ weight: v })} hint="facultatif" />
      </div>

      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
        <Toggle checked={value.upright} onChange={v => onChange({ upright: v })} label="Ce côté vers le haut" />
        <Toggle checked={value.fragile} onChange={v => onChange({ fragile: v })} label="Fragile, rien dessus" />
      </div>

      <details className="mt-3 group" open={advancedSet}>
        <summary className="cursor-pointer select-none list-none text-xs font-medium text-primary-600 dark:text-primary-400 flex items-center gap-1">
          <ChevronDown size={14} className="transition-transform group-open:rotate-180" /> Options avancées
        </summary>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <NumberField label="Charge max dessus" unit="kg" value={value.maxLoadOnTop} onChange={v => onChange({ maxLoadOnTop: v })} hint="vide = sans limite" />
          <NumberField label="Client / arrêt" unit="n°" min={1} value={value.stop} onChange={v => onChange({ stop: v })} hint="1 = livré en premier" />
          <div className="col-span-2">
            <Toggle
              checked={value.keepTogether}
              onChange={v => onChange({ keepTogether: v })}
              label="Garder ensemble"
              hint="Ne pas répartir sur plusieurs palettes si elle tient sur une seule"
            />
          </div>
        </div>
      </details>
    </div>
  )
}
