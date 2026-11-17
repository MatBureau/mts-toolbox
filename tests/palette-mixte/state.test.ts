import { describe, it, expect } from 'vitest'
import { checkPlacement, commit, newState } from '@/lib/palette-mixte/state'
import type { BoxItem, OrderSettings } from '@/lib/palette-mixte/types'

const settings: OrderSettings = { pallet: { length: 1200, width: 800, height: 144, tare: 25 }, maxHeight: 1800, maxLoad: 1000, overhang: 0 }

const item = (over: Partial<BoxItem> = {}): BoxItem => ({
  uid: 'a#1', refId: 'a', index: 1, length: 400, width: 300, height: 200, weight: 10,
  upright: true, fragile: false, maxLoadOnTop: null, keepTogether: false, stop: 1, ...over,
})

const place = (s: ReturnType<typeof newState>, it: BoxItem, c: { x: number; y: number; z: number; l: number; w: number; h: number }) => {
  const below = checkPlacement(s, it, c)
  if (!below) throw new Error('placement refusé')
  return commit(s, it, c, below, null)
}

describe('contraintes de pose', () => {
  it('accepte un colis posé sur la palette', () => {
    expect(checkPlacement(newState(settings), item(), { x: 0, y: 0, z: 0, l: 400, w: 300, h: 200 })).toEqual([])
  })

  it('refuse un colis hors zone ou trop haut', () => {
    const s = newState(settings)
    expect(checkPlacement(s, item(), { x: 900, y: 0, z: 0, l: 400, w: 300, h: 200 })).toBeNull()
    expect(checkPlacement(s, item(), { x: 0, y: 0, z: 1500, l: 400, w: 300, h: 200 })).toBeNull()
  })

  it('exige 75 % d’appui', () => {
    const s = newState(settings)
    place(s, item(), { x: 0, y: 0, z: 0, l: 400, w: 300, h: 200 })
    const next = item({ uid: 'a#2', index: 2 })
    expect(checkPlacement(s, next, { x: 200, y: 0, z: 200, l: 400, w: 300, h: 200 })).toBeNull() // 50 %
    expect(checkPlacement(s, next, { x: 100, y: 0, z: 200, l: 400, w: 300, h: 200 })).toHaveLength(1) // 75 %
  })

  it('ne pose rien sur un fragile', () => {
    const s = newState(settings)
    place(s, item({ fragile: true }), { x: 0, y: 0, z: 0, l: 400, w: 300, h: 200 })
    expect(checkPlacement(s, item({ uid: 'b#1', refId: 'b' }), { x: 0, y: 0, z: 200, l: 400, w: 300, h: 100 })).toBeNull()
  })

  it('cumule la charge supportée', () => {
    const s = newState(settings)
    place(s, item({ maxLoadOnTop: 15 }), { x: 0, y: 0, z: 0, l: 400, w: 300, h: 200 })
    place(s, item({ uid: 'b#1', refId: 'b', weight: 10 }), { x: 0, y: 0, z: 200, l: 400, w: 300, h: 100 })
    expect(checkPlacement(s, item({ uid: 'c#1', refId: 'c', weight: 10 }), { x: 0, y: 0, z: 300, l: 400, w: 300, h: 100 })).toBeNull()
    expect(checkPlacement(s, item({ uid: 'd#1', refId: 'd', weight: 5 }), { x: 0, y: 0, z: 300, l: 400, w: 300, h: 100 })).toHaveLength(2)
  })

  it('ne glisse jamais un colis sous un autre', () => {
    const s = newState(settings)
    place(s, item(), { x: 0, y: 0, z: 0, l: 400, w: 300, h: 200 })
    place(s, item({ uid: 'a#2', index: 2 }), { x: 100, y: 0, z: 200, l: 400, w: 300, h: 200 }) // déborde de 100 mm
    expect(checkPlacement(s, item({ uid: 'b#1', refId: 'b' }), { x: 400, y: 0, z: 0, l: 100, w: 300, h: 200 })).toBeNull()
  })

  it('respecte la charge maximale de la palette', () => {
    const s = newState(settings)
    s.loadWeight = 995
    expect(checkPlacement(s, item(), { x: 0, y: 0, z: 0, l: 400, w: 300, h: 200 })).toBeNull()
  })
})
