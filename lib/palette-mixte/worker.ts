import { palletizeOrder } from './engine'
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

ctx.onmessage = e => {
  const { id, refs, settings } = e.data
  ctx.postMessage({ id, result: palletizeOrder(refs, settings) })
}

export {}
