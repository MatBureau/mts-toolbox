'use client'

import { useEffect, useRef, useState } from 'react'
import { safePalletizeOrder } from '@/lib/palette-mixte/engine'
import type { MixedResult, OrderSettings, Reference } from '@/lib/palette-mixte/types'

interface Request {
  id: number
  refs: Reference[]
  settings: OrderSettings
}

/** Saisie qui a produit le résultat affiché (la saisie courante peut déjà avoir changé). */
export interface PalletizationInput {
  refs: Reference[]
  settings: OrderSettings
}

interface State {
  result: MixedResult | null
  input: PalletizationInput | null
  computing: boolean
}

function createWorker(): Worker | null {
  try {
    return new Worker(new URL('../../../lib/palette-mixte/worker.ts', import.meta.url))
  } catch {
    return null
  }
}

/**
 * Recalcule 300 ms après la dernière modification, dans un Web Worker (repli sur le fil
 * principal si le navigateur le refuse ou si le worker plante). Un calcul devenu périmé
 * est abandonné (worker terminé puis recréé) ; les réponses périmées sont ignorées.
 */
export function usePalletization(refs: Reference[] | null, settings: OrderSettings) {
  const [state, setState] = useState<State>({ result: null, input: null, computing: false })
  const workerRef = useRef<Worker | null>(null)
  const busy = useRef(false) // le worker calcule une requête pas encore rendue
  const noWorker = useRef(false) // Worker refusé par le navigateur : fil principal
  const pending = useRef<Request | null>(null) // dernière requête lancée
  const requestId = useRef(0)

  // Les fonctions ci-dessous ne lisent que des refs : leurs versions successives sont équivalentes
  const deliver = (req: Request, result: MixedResult) => {
    if (req.id === requestId.current) setState({ result, input: { refs: req.refs, settings: req.settings }, computing: false })
  }

  const runOnMainThread = (req: Request) => deliver(req, safePalletizeOrder(req.refs, req.settings))

  const spawn = (): Worker | null => {
    const worker = createWorker()
    if (!worker) return null
    worker.onmessage = (e: MessageEvent<{ id: number; result: MixedResult }>) => {
      if (workerRef.current !== worker) return
      busy.current = false
      const req = pending.current
      if (req && e.data.id === req.id) deliver(req, e.data.result)
    }
    // Script introuvable, plantage non rattrapé… : on abandonne ce worker et on calcule ici
    worker.onerror = (e: ErrorEvent) => {
      e.preventDefault()
      if (workerRef.current !== worker) return
      worker.terminate()
      workerRef.current = null
      busy.current = false
      const req = pending.current
      if (req) runOnMainThread(req)
    }
    return worker
  }

  const run = (req: Request) => {
    pending.current = req
    if (!noWorker.current) {
      // Un calcul périmé occupe le worker : on le termine plutôt que de faire attendre la nouvelle requête
      if (workerRef.current && busy.current) {
        workerRef.current.terminate()
        workerRef.current = null
      }
      if (!workerRef.current) workerRef.current = spawn()
      if (workerRef.current) {
        busy.current = true
        workerRef.current.postMessage(req)
        return
      }
      noWorker.current = true
    }
    runOnMainThread(req)
  }

  // Démontage (et double montage de StrictMode) : le worker courant est terminé, un neuf sera créé au besoin
  useEffect(
    () => () => {
      workerRef.current?.terminate()
      workerRef.current = null
      busy.current = false
    },
    []
  )

  const key = JSON.stringify([refs, settings])
  useEffect(() => {
    if (!refs) return
    const id = ++requestId.current
    setState(s => ({ ...s, computing: true }))
    const timer = setTimeout(() => run({ id, refs, settings }), 300)
    return () => clearTimeout(timer)
    // key résume refs et settings ; run ne lit que des refs
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  return state
}
