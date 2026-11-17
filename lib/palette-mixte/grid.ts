import type { Rect2 } from './geometry'

// Taille d'une case de la grille (mm) : de l'ordre d'un petit colis
const CELL = 100

/**
 * Index spatial 2D : grille uniforme de cases. Chaque rectangle est inscrit dans toutes les
 * cases que touche son emprise. Une requête renvoie, sans doublon, tous les rectangles dont
 * l'emprise peut recouvrir la zone demandée : jamais d'oubli, parfois des voisins en trop.
 */
export class Grid<T extends Rect2> {
  private readonly nx: number
  private readonly ny: number
  private readonly cells: number[][]
  private readonly items: T[] = []
  private readonly marks: number[] = []
  private stamp = 0

  constructor(length: number, width: number) {
    this.nx = Math.max(1, Math.ceil(length / CELL))
    this.ny = Math.max(1, Math.ceil(width / CELL))
    this.cells = Array.from({ length: this.nx * this.ny }, () => [])
  }

  // Indices de cases couverts par [a0, a1], bornés à la grille (le bornage est monotone : pas d'oubli)
  private span(a0: number, a1: number, n: number): [number, number] {
    const clamp = (i: number) => Math.min(n - 1, Math.max(0, i))
    return [clamp(Math.floor(a0 / CELL)), clamp(Math.floor(a1 / CELL))]
  }

  add(item: T): void {
    const id = this.items.length
    this.items.push(item)
    this.marks.push(0)
    const [i0, i1] = this.span(item.x, item.x + item.l, this.nx)
    const [j0, j1] = this.span(item.y, item.y + item.w, this.ny)
    for (let i = i0; i <= i1; i++) for (let j = j0; j <= j1; j++) this.cells[i * this.ny + j].push(id)
  }

  query(r: Rect2): T[] {
    const stamp = ++this.stamp
    const out: T[] = []
    const [i0, i1] = this.span(r.x, r.x + r.l, this.nx)
    const [j0, j1] = this.span(r.y, r.y + r.w, this.ny)
    for (let i = i0; i <= i1; i++) {
      for (let j = j0; j <= j1; j++) {
        for (const id of this.cells[i * this.ny + j]) {
          if (this.marks[id] === stamp) continue
          this.marks[id] = stamp
          out.push(this.items[id])
        }
      }
    }
    return out
  }
}
