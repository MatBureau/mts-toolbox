'use client'

import { Layers } from 'lucide-react'
import { CUSTOM_PALLET_ID, PALLET_PRESETS } from '@/lib/palette/presets'
import { NumberField } from './fields'

export interface PalletFieldsValue {
  palletId: string
  palletLength: string
  palletWidth: string
  palletHeight: string
  palletTare: string
  maxHeight: string
  maxLoad: string
  overhang: string
}

export default function PalletSettingsFields({
  value, onChange, className,
}: {
  value: PalletFieldsValue
  onChange: (patch: Partial<PalletFieldsValue>) => void
  className: string
}) {
  const selectPallet = (id: string) => {
    const preset = PALLET_PRESETS.find(p => p.id === id)
    onChange({
      palletId: id,
      ...(preset && {
        palletLength: String(preset.length),
        palletWidth: String(preset.width),
        palletHeight: String(preset.height),
        palletTare: String(preset.tare),
      }),
    })
  }
  const isCustom = value.palletId === CUSTOM_PALLET_ID

  return (
    <section className={className}>
      <h2 className="text-sm font-semibold mb-3 flex items-center gap-2 text-gray-900 dark:text-gray-100">
        <Layers size={16} className="text-primary-500" /> Palette
      </h2>
      <label className="block mb-3">
        <span className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Type</span>
        <select
          value={value.palletId}
          onChange={e => selectPallet(e.target.value)}
          className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          {PALLET_PRESETS.map(p => (
            <option key={p.id} value={p.id}>{p.name} — {p.length} × {p.width}</option>
          ))}
          <option value={CUSTOM_PALLET_ID}>Personnalisée…</option>
        </select>
      </label>
      {isCustom && (
        <div className="grid grid-cols-2 gap-3 mb-3">
          <NumberField label="Longueur" unit="mm" value={value.palletLength} onChange={v => onChange({ palletLength: v })} />
          <NumberField label="Largeur" unit="mm" value={value.palletWidth} onChange={v => onChange({ palletWidth: v })} />
          <NumberField label="Hauteur" unit="mm" value={value.palletHeight} onChange={v => onChange({ palletHeight: v })} />
          <NumberField label="Tare" unit="kg" value={value.palletTare} onChange={v => onChange({ palletTare: v })} />
        </div>
      )}
      <div className="grid grid-cols-2 gap-3">
        <NumberField label="Hauteur max" unit="mm" value={value.maxHeight} onChange={v => onChange({ maxHeight: v })} hint="palette comprise" />
        <NumberField label="Charge max" unit="kg" value={value.maxLoad} onChange={v => onChange({ maxLoad: v })} hint="0 = sans limite" />
        <NumberField label="Débord" unit="mm" value={value.overhang} onChange={v => onChange({ overhang: v })} hint="par côté" />
      </div>
    </section>
  )
}
