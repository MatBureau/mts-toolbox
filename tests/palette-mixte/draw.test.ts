import { describe, it, expect } from 'vitest'
import { refColor } from '@/lib/palette-mixte/colors'
import { isoOrder } from '@/lib/palette-mixte/iso'
import { sanitizeForPDF } from '@/lib/pdf/sanitize'

describe('couleurs', () => {
  it('30 couleurs distinctes au format #rrggbb', () => {
    const colors = Array.from({ length: 30 }, (_, i) => refColor(i))
    expect(colors.every(c => /^#[0-9a-f]{6}$/.test(c))).toBe(true)
    expect(new Set(colors).size).toBe(30)
  })
})

describe('ordre de dessin isométrique', () => {
  const box = (x: number, y: number, z: number, id: string) => ({ id, x, y, z, l: 100, w: 100, h: 100 })

  it('dessine d’abord ce qui est derrière', () => {
    expect(isoOrder([box(100, 0, 0, 'devant'), box(0, 0, 0, 'derriere')]).map(b => b.id)).toEqual(['derriere', 'devant'])
  })

  it('dessine le bas avant le haut', () => {
    expect(isoOrder([box(0, 0, 100, 'haut'), box(0, 0, 0, 'bas')]).map(b => b.id)).toEqual(['bas', 'haut'])
  })
})

describe('texte PDF', () => {
  it('remplace les caractères hors WinAnsi', () => {
    expect(sanitizeForPDF('Carton 📦 n° 1 — œuf')).toBe('Carton ? n° 1 - œuf')
  })
})
