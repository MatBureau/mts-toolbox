import type { BoxItem, OrderSettings, Reference } from '@/lib/palette-mixte/types'

export const EUR = { length: 1200, width: 800, height: 144, tare: 25 }

export const settings = (over: Partial<OrderSettings> = {}): OrderSettings => ({
  pallet: EUR, maxHeight: 1800, maxLoad: 0, overhang: 0, ...over,
})

export const items = (refId: string, n: number, over: Partial<BoxItem> = {}): BoxItem[] =>
  Array.from({ length: n }, (_, k) => ({
    uid: `${refId}#${k + 1}`, refId, index: k + 1, length: 400, width: 300, height: 250, weight: 5,
    upright: true, fragile: false, maxLoadOnTop: null, keepTogether: false, stop: 1, ...over,
  }))

export const ref = (over: Partial<Reference> & { id: string }): Reference => ({
  name: over.id, length: 400, width: 300, height: 250, quantity: 1, weight: 5,
  upright: true, fragile: false, maxLoadOnTop: null, keepTogether: false, stop: 1, ...over,
})
