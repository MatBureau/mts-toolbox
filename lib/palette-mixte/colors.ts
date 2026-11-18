// Teintes réparties à l'angle d'or : 30 couleurs distinctes, lisibles sur fond clair et sombre
export function refColorRgb(i: number): [number, number, number] {
  const h = (i * 137.508 + 30) % 360
  const s = 0.62
  const l = 0.6
  const a = s * Math.min(l, 1 - l)
  const f = (n: number) => {
    const k = (n + h / 30) % 12
    return l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1))
  }
  return [f(0), f(8), f(4)]
}

export function refColor(i: number): string {
  return '#' + refColorRgb(i).map(v => Math.round(v * 255).toString(16).padStart(2, '0')).join('')
}
