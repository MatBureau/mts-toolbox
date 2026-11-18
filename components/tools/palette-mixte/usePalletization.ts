'use client'

import { useEffect, useRef, useState } from 'react'
import { palletizeOrder } from '@/lib/palette-mixte/engine'
import type { MixedResult, OrderSettings, Reference } from '@/lib/palette-mixte/types'

/**
 * Recalcule 300 ms après la dernière modification, dans un Web Worker (repli sur le fil
 * principal si le navigateur le refuse). Les réponses périmées sont ignorées.
 */
export function usePalletization(refs: Reference[] | null, settings: OrderSettings) {
  const [state, setState] = useState<{ result: MixedResult | null; computing: boolean }>({ result: null, computing: false })
  const workerRef = useRef<Worker | null>(null)
  const requestId = useRef(0)

  useEffect(() => {
    let worker: Worker | null = null
    try {
      worker = new Worker(new URL('../../../lib/palette-mixte/worker.ts', import.meta.url))
      worker.onmessage = (e: MessageEvent<{ id: number; result: MixedResult }>) => {
        if (e.data.id === requestId.current) setState({ result: e.data.result, computing: false })
      }
    } catch {
      worker = null
    }
    workerRef.current = worker
    return () => worker?.terminate()
  }, [])

  const key = JSON.stringify([refs, settings])
  useEffect(() => {
    if (!refs) return
    const id = ++requestId.current
    setState(s => ({ ...s, computing: true }))
    const timer = setTimeout(() => {
      const worker = workerRef.current
      if (worker) {
        worker.postMessage({ id, refs, settings })
      } else {
        const result = palletizeOrder(refs, settings)
        if (id === requestId.current) setState({ result, computing: false })
      }
    }, 300)
    return () => clearTimeout(timer)
    // key résume refs et settings
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  return state
}
