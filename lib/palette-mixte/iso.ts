export interface IsoBox {
  x: number
  y: number
  z: number
  l: number
  w: number
  h: number
}

const E = 0.5

// Vue depuis +x, +y, +z : a est derrière b s'il est du côté bas sur un axe qui les sépare
function behind(a: IsoBox, b: IsoBox): boolean {
  return a.x + a.l <= b.x + E || a.y + a.w <= b.y + E || a.z + a.h <= b.z + E
}

/** Tri topologique « derrière avant devant » ; en cas de cycle, le plus proche de l'origine d'abord. */
export function isoOrder<T extends IsoBox>(boxes: T[]): T[] {
  const n = boxes.length
  const indegree = new Array<number>(n).fill(0)
  const next: number[][] = boxes.map(() => [])
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const ij = behind(boxes[i], boxes[j])
      const ji = behind(boxes[j], boxes[i])
      if (ij && !ji) {
        next[i].push(j)
        indegree[j] += 1
      } else if (ji && !ij) {
        next[j].push(i)
        indegree[i] += 1
      }
    }
  }
  const depth = (b: IsoBox) => b.x + b.y + b.z
  const done = new Array<boolean>(n).fill(false)
  const out: T[] = []
  while (out.length < n) {
    let pick = -1
    for (let k = 0; k < n; k++) {
      if (!done[k] && indegree[k] === 0 && (pick < 0 || depth(boxes[k]) < depth(boxes[pick]))) pick = k
    }
    if (pick < 0) {
      for (let k = 0; k < n; k++) if (!done[k] && (pick < 0 || depth(boxes[k]) < depth(boxes[pick]))) pick = k
    }
    done[pick] = true
    out.push(boxes[pick])
    for (const s of next[pick]) indegree[s] -= 1
  }
  return out
}
