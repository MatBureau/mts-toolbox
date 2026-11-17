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

  it('un voisin latéral au recouvrement sous la tolérance n’est ni dessus ni dessous (fragile)', () => {
    const s = newState(settings)
    place(s, item({ fragile: true }), { x: 0, y: 0, z: 0, l: 400, w: 300, h: 200 })
    expect(checkPlacement(s, item({ uid: 'b#1', refId: 'b' }), { x: 399.9999, y: 0, z: 0, l: 400, w: 300, h: 200 })).toEqual([])
  })

  it('un voisin latéral sous la tolérance ne reçoit pas de charge', () => {
    const s = newState(settings)
    const first = place(s, item({ maxLoadOnTop: 0 }), { x: 0, y: 0, z: 0, l: 400, w: 300, h: 200 })
    const next = item({ uid: 'b#1', refId: 'b', weight: 10 })
    const c = { x: 399.9999, y: 0, z: 0, l: 400, w: 300, h: 200 }
    const below = checkPlacement(s, next, c)
    expect(below).toEqual([])
    commit(s, next, c, below!, null)
    expect(first.loadAbove).toBe(0)
  })
})

describe('appui sur la palette avec débord', () => {
  const withOverhang: OrderSettings = { ...settings, overhang: 50 }
  const check = (c: { x: number; y: number; z: number; l: number; w: number; h: number }) =>
    checkPlacement(newState(withOverhang), item(), c)

  it('centre sur le plateau : accepté', () => {
    expect(check({ x: 0, y: 50, z: 0, l: 400, w: 300, h: 200 })).toEqual([])
  })

  it('moins de 75 % sur le plateau mais centre sur le plateau : accepté', () => {
    expect(check({ x: 0, y: 50, z: 0, l: 180, w: 300, h: 200 })).toEqual([]) // centre x = 90 ≥ 50
  })

  it('centre sur le débord : refusé', () => {
    expect(check({ x: 0, y: 50, z: 0, l: 90, w: 300, h: 200 })).toBeNull() // centre x = 45 < 50
  })

  it('colis d’angle débordant sur deux côtés : accepté', () => {
    expect(check({ x: 0, y: 0, z: 0, l: 300, w: 200, h: 200 })).toEqual([])
  })

  it('entièrement sur le débord : refusé', () => {
    expect(check({ x: 0, y: 0, z: 0, l: 40, w: 40, h: 100 })).toBeNull()
  })
})
