'use client'

import { useEffect, useRef } from 'react'
import type { Step } from '@/lib/palette-mixte/types'

interface StepListProps {
  steps: Step[]
  current: number
  colors: Map<string, string>
  onSelect: (n: number) => void
}

export default function StepList({ steps, current, colors, onSelect }: StepListProps) {
  const listRef = useRef<HTMLOListElement>(null)
  const activeRef = useRef<HTMLButtonElement>(null)

  // Fait défiler la liste seule, jamais la page
  useEffect(() => {
    const list = listRef.current
    const el = activeRef.current
    if (!list || !el) return
    const top = el.offsetTop
    if (top < list.scrollTop || top + el.offsetHeight > list.scrollTop + list.clientHeight) {
      list.scrollTop = top - list.clientHeight / 2
    }
  }, [current])

  return (
    <ol ref={listRef} className="relative max-h-[420px] overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800 text-sm" aria-label="Étapes de montage">
      {steps.map(s => {
        const active = s.number === current
        const done = s.number < current
        return (
          <li key={s.number}>
            <button
              ref={active ? activeRef : undefined}
              type="button"
              onClick={() => onSelect(s.number)}
              aria-current={active ? 'step' : undefined}
              className={`w-full text-left flex items-start gap-2 px-3 py-2 ${active ? 'bg-amber-50 dark:bg-amber-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800/60'} ${done ? 'text-gray-500' : 'text-gray-800 dark:text-gray-200'}`}
            >
              <span className="tabular-nums text-xs w-6 shrink-0 pt-0.5 text-gray-400">{s.number}</span>
              <span className="mt-1.5 h-2.5 w-2.5 rounded-sm shrink-0" style={{ background: colors.get(s.refId) }} aria-hidden="true" />
              <span className={s.kind === 'layer' ? 'font-medium' : ''}>{s.label}</span>
            </button>
          </li>
        )
      })}
    </ol>
  )
}
