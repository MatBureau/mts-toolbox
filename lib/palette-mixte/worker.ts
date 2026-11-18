import { safePalletizeOrder } from './engine'
import type { MixedResult, OrderSettings, Reference } from './types'

interface Request {
  id: number
  refs: Reference[]
  settings: OrderSettings
}

// Le projet compile avec la lib DOM : on type le contexte du worker à la main
const ctx = self as unknown as {
  onmessage: ((e: MessageEvent<Request>) => void) | null
  postMessage: (message: { id: number; result: MixedResult }) => void
}

// Toujours répondre, même sur exception (try/catch dans safePalletizeOrder) :
// sans réponse, l'interface resterait sur « Calcul en cours… »
ctx.onmessage = e => {
  const { id, refs, settings } = e.data
  ctx.postMessage({ id, result: safePalletizeOrder(refs, settings) })
}

export {}
