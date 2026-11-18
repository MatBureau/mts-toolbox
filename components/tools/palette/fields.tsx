'use client'

export function NumberField({
  label, value, onChange, unit, hint, min = 0, step = 1,
}: {
  label: string; value: string; onChange: (v: string) => void; unit: string; hint?: string; min?: number; step?: number
}) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{label}</span>
      <span className="flex items-stretch rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus-within:ring-2 focus-within:ring-primary-500 overflow-hidden">
        <input
          type="number"
          inputMode="decimal"
          min={min}
          step={step}
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full min-w-0 px-3 py-2 bg-transparent text-gray-900 dark:text-gray-100 focus:outline-none tabular-nums"
        />
        <span className="px-2 flex items-center text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/60 border-l border-gray-200 dark:border-gray-700">
          {unit}
        </span>
      </span>
      {hint && <span className="block mt-1 text-[11px] text-gray-500 dark:text-gray-500">{hint}</span>}
    </label>
  )
}

export function Toggle({ checked, onChange, label, hint }: { checked: boolean; onChange: (v: boolean) => void; label: string; hint?: string }) {
  return (
    <label className="flex items-start gap-3 cursor-pointer select-none">
      <input
        type="checkbox"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500"
      />
      <span>
        <span className="block text-sm text-gray-800 dark:text-gray-200">{label}</span>
        {hint && <span className="block text-[11px] text-gray-500">{hint}</span>}
      </span>
    </label>
  )
}
