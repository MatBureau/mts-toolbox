import { describe, it, expect } from 'vitest'
import { Grid } from '@/lib/palette-mixte/grid'
import { footprintOverlap, type Rect2 } from '@/lib/palette-mixte/geometry'

// Générateur pseudo-aléatoire à graine fixe
function rng(seed: number) {
  return () => {
    seed = (seed * 1103515245 + 12345) % 2147483648
    return seed / 2147483648
  }
}

describe('grille spatiale', () => {
  it('renvoie tout rectangle qui recouvre la zone demandée, sans doublon', () => {
    const r = rng(42)
    const grid = new Grid<Rect2>(1240, 840)
    const all: Rect2[] = []
    for (let k = 0; k < 400; k++) {
      const rect = { x: r() * 1200, y: r() * 800, l: 10 + r() * 300, w: 10 + r() * 300 }
      all.push(rect)
      grid.add(rect)
    }
    for (let k = 0; k < 400; k++) {
      const q = { x: r() * 1240 - 20, y: r() * 840 - 20, l: 1 + r() * 400, w: 1 + r() * 400 }
      const found = grid.query(q)
      expect(new Set(found).size).toBe(found.length)
      for (const rect of all) if (footprintOverlap(rect, q) > 0) expect(found).toContain(rect)
    }
  })

  it('accepte des rectangles qui débordent de la grille', () => {
    const grid = new Grid<Rect2>(100, 100)
    const big = { x: -50, y: -50, l: 500, w: 500 }
    grid.add(big)
    expect(grid.query({ x: 90, y: 90, l: 5, w: 5 })).toEqual([big])
  })
})
