'use client'

import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react'

interface StepPlayerProps {
  current: number
  total: number
  playing: boolean
  onChange: (n: number) => void
  onTogglePlay: () => void
}

export default function StepPlayer({ current, total, playing, onChange, onTogglePlay }: StepPlayerProps) {
  const btn = 'p-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40'
  return (
    <div className="flex items-center gap-2 px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-900/70">
      <button type="button" className={btn} onClick={() => onChange(Math.max(0, current - 1))} disabled={current <= 0} aria-label="Étape précédente">
        <ChevronLeft size={16} />
      </button>
      <button type="button" className={btn} onClick={onTogglePlay} disabled={total === 0} aria-label={playing ? 'Pause' : 'Lecture'}>
        {playing ? <Pause size={16} /> : <Play size={16} />}
      </button>
      <button type="button" className={btn} onClick={() => onChange(Math.min(total, current + 1))} disabled={current >= total} aria-label="Étape suivante">
        <ChevronRight size={16} />
      </button>
      <input
        type="range"
        min={0}
        max={total}
        value={current}
        onChange={e => onChange(Number(e.target.value))}
        className="flex-1 min-w-0 accent-primary-600"
        aria-label="Étape de montage"
      />
      <span className="text-xs tabular-nums w-16 text-right text-gray-700 dark:text-gray-300">{current}/{total}</span>
    </div>
  )
}
