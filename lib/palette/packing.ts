// Moteur de palettisation : rangement de rectangles identiques dans un rectangle
// (problème du chargement de palette), puis empilement en couches.
//
// Couche : programmation dynamique sur les découpes guillotine aux « points de trame »
// (combinaisons i·a + j·b), plus un motif en moulinet à 4 blocs (non guillotine)
// évalué au niveau supérieur. Couvre les plans homogènes, à 2 blocs et en moulinet,
// qui sont ceux utilisés en pratique sur les palettes.

export interface Rect {
  x: number // position le long de la longueur de la zone
  y: number // position le long de la largeur de la zone
  l: number // emprise le long de la longueur
  w: number // emprise le long de la largeur
}

export interface LayerPattern {
  count: number
  rects: Rect[]
}

type Plan =
  | { kind: 'empty' }
  | { kind: 'grid'; a: number; b: number; nx: number; ny: number }
  | { kind: 'cutX'; at: number; first: Key; second: Key }
  | { kind: 'cutY'; at: number; first: Key; second: Key }

type Key = { X: number; Y: number }

// Au-delà, la trame devient trop fine pour la DP en temps interactif
const MAX_RASTER = 260
// Le moulinet coûte O(n⁴) en points de trame
const MAX_RASTER_PINWHEEL = 36

function rasterPoints(limit: number, a: number, b: number): number[] {
  const points = new Set<number>()
  for (let i = 0; i * a <= limit; i++) {
    for (let j = 0; i * a + j * b <= limit; j++) {
      points.add(i * a + j * b)
    }
  }
  return Array.from(points).sort((p, q) => p - q)
}

// Plus grand point de trame ≤ v (recherche dichotomique)
function floorPoint(points: number[], v: number): number {
  let lo = 0
  let hi = points.length - 1
  let best = 0
  while (lo <= hi) {
    const mid = (lo + hi) >> 1
    if (points[mid] <= v) {
      best = points[mid]
      lo = mid + 1
    } else {
      hi = mid - 1
    }
  }
  return best
}

function homogeneous(X: number, Y: number, a: number, b: number): { count: number; plan: Plan } {
  const n1x = Math.floor(X / a), n1y = Math.floor(Y / b)
  const n2x = Math.floor(X / b), n2y = Math.floor(Y / a)
  if (n1x * n1y === 0 && n2x * n2y === 0) return { count: 0, plan: { kind: 'empty' } }
  return n1x * n1y >= n2x * n2y
    ? { count: n1x * n1y, plan: { kind: 'grid', a, b, nx: n1x, ny: n1y } }
    : { count: n2x * n2y, plan: { kind: 'grid', a: b, b: a, nx: n2x, ny: n2y } }
}

class LayerSolver {
  private memo = new Map<number, { count: number; plan: Plan }>()
  readonly px: number[]
  readonly py: number[]

  constructor(readonly L: number, readonly W: number, readonly a: number, readonly b: number) {
    this.px = rasterPoints(L, a, b)
    this.py = rasterPoints(W, a, b)
  }

  get tooFine() {
    return this.px.length > MAX_RASTER || this.py.length > MAX_RASTER
  }

  best(X: number, Y: number): { count: number; plan: Plan } {
    X = floorPoint(this.px, X)
    Y = floorPoint(this.py, Y)
    const key = X * 1_000_003 + Y
    const cached = this.memo.get(key)
    if (cached) return cached

    let result = homogeneous(X, Y, this.a, this.b)
    // Borne supérieure par la surface : inutile de chercher plus loin si atteinte
    const bound = Math.floor((X * Y) / (this.a * this.b))

    if (result.count < bound) {
      for (const x of this.px) {
        if (x <= 0 || x > X / 2) continue
        const c = this.best(x, Y).count + this.best(X - x, Y).count
        if (c > result.count) {
          result = { count: c, plan: { kind: 'cutX', at: x, first: { X: x, Y }, second: { X: X - x, Y } } }
          if (c >= bound) break
        }
      }
    }
    if (result.count < bound) {
      for (const y of this.py) {
        if (y <= 0 || y > Y / 2) continue
        const c = this.best(X, y).count + this.best(X, Y - y).count
        if (c > result.count) {
          result = { count: c, plan: { kind: 'cutY', at: y, first: { X, Y: y }, second: { X, Y: Y - y } } }
          if (c >= bound) break
        }
      }
    }

    this.memo.set(key, result)
    return result
  }

  rects(X: number, Y: number, ox = 0, oy = 0, out: Rect[] = []): Rect[] {
    const { plan } = this.best(X, Y)
    switch (plan.kind) {
      case 'grid':
        for (let i = 0; i < plan.nx; i++) {
          for (let j = 0; j < plan.ny; j++) {
            out.push({ x: ox + i * plan.a, y: oy + j * plan.b, l: plan.a, w: plan.b })
          }
        }
        break
      case 'cutX':
        this.rects(plan.first.X, plan.first.Y, ox, oy, out)
        this.rects(plan.second.X, plan.second.Y, ox + plan.at, oy, out)
        break
      case 'cutY':
        this.rects(plan.first.X, plan.first.Y, ox, oy, out)
        this.rects(plan.second.X, plan.second.Y, ox, oy + plan.at, out)
        break
    }
    return out
  }
}

// Moulinet à 4 blocs : B1 [0,x1]×[0,y1], B2 [x1,L]×[0,y2], B3 [x3,L]×[y2,W], B4 [0,x3]×[y1,W]
function pinwheel(solver: LayerSolver, best: number): Rect[] | null {
  const { L, W } = solver
  const px = solver.px.filter(p => p > 0 && p < L)
  const py = solver.py.filter(p => p > 0 && p < W)
  if (px.length > MAX_RASTER_PINWHEEL || py.length > MAX_RASTER_PINWHEEL) return null

  let bestCount = best
  let bestParams: [number, number, number, number] | null = null
  for (const x1 of px) {
    for (const x3 of px) {
      for (const y1 of py) {
        const c1 = solver.best(x1, y1).count
        const c4 = solver.best(x3, W - y1).count
        for (const y2 of py) {
          // Blocs B1/B3 et B2/B4 ne doivent pas se chevaucher
          if (x3 < x1 && y2 < y1) continue
          if (x1 < x3 && y1 < y2) continue
          const c = c1 + c4 + solver.best(L - x1, y2).count + solver.best(L - x3, W - y2).count
          if (c > bestCount) {
            bestCount = c
            bestParams = [x1, y1, x3, y2]
          }
        }
      }
    }
  }
  if (!bestParams) return null
  const [x1, y1, x3, y2] = bestParams
  const out: Rect[] = []
  solver.rects(x1, y1, 0, 0, out)
  solver.rects(L - x1, y2, x1, 0, out)
  solver.rects(L - x3, W - y2, x3, y2, out)
  solver.rects(x3, W - y1, 0, y1, out)
  return out
}

/**
 * Meilleure couche de rectangles a×b (rotation à 90° autorisée) dans une zone L×W.
 */
export function bestLayer(L: number, W: number, a: number, b: number): LayerPattern {
  if (!(L > 0 && W > 0 && a > 0 && b > 0)) return { count: 0, rects: [] }
  const solver = new LayerSolver(L, W, a, b)
  if (solver.tooFine) {
    const h = homogeneous(L, W, a, b)
    const rects: Rect[] = []
    if (h.plan.kind === 'grid') {
      const { a: pa, b: pb, nx, ny } = h.plan
      for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) rects.push({ x: i * pa, y: j * pb, l: pa, w: pb })
    }
    return { count: rects.length, rects }
  }
  const guillotine = solver.best(L, W).count
  const pin = pinwheel(solver, guillotine)
  // Numérotation par rangées (ordre de pose) plutôt que par bloc de calcul
  const rects = (pin ?? solver.rects(L, W)).sort((p, q) => p.y - q.y || p.x - q.x)
  return { count: rects.length, rects }
}

/** Couche « naïve » : tous les colis dans le même sens (ce que fait un calcul à la main). */
export function naiveLayerCount(L: number, W: number, a: number, b: number): number {
  if (!(L > 0 && W > 0 && a > 0 && b > 0)) return 0
  return homogeneous(L, W, a, b).count
}

// ---------------------------------------------------------------------------
// Palettisation complète

export interface BoxSpec {
  length: number // mm
  width: number // mm
  height: number // mm
  weight: number // kg
}

export interface PalletSpec {
  length: number // mm
  width: number // mm
  height: number // mm (hauteur du plancher)
  tare: number // kg
}

export interface PalletizationInput {
  box: BoxSpec
  pallet: PalletSpec
  maxHeight: number // mm, hauteur totale palette comprise
  maxLoad: number // kg de marchandise, 0 = illimité
  overhang: number // mm de débord autorisé par côté
  allowTipping: boolean // le colis peut être couché
}

export type LimitingFactor = 'hauteur' | 'poids' | 'aucun-colis'

export interface PalletizationResult {
  valid: boolean
  // Dimensions du colis telles que posées : emprise (footA × footB) et hauteur verticale
  orientation: { footA: number; footB: number; height: number; tipped: boolean }
  layer: LayerPattern // positions relatives au coin de la zone utile (débord inclus)
  perLayer: number
  fullLayers: number
  lastLayerCount: number // colis de la couche incomplète (0 si aucune)
  totalBoxes: number
  naiveTotal: number // même zone et même hauteur, colis à plat, tous dans le même sens
  limitedBy: LimitingFactor
  loadWeight: number // kg de marchandise
  grossWeight: number // kg, palette comprise
  loadHeight: number // mm de chargement
  totalHeight: number // mm, palette comprise
  areaUsage: number // % de la surface de la palette couverte par une couche pleine
  volumeUsage: number // % du volume disponible occupé
  zone: { length: number; width: number; offset: number } // zone utile = palette + débord
}

const EMPTY_LAYER: LayerPattern = { count: 0, rects: [] }

// Centre la couche dans la zone : le jeu restant se répartit des deux côtés, comme sur le quai
export function centerLayer(layer: LayerPattern, L: number, W: number): LayerPattern {
  if (layer.count === 0) return layer
  const maxX = Math.max(...layer.rects.map(r => r.x + r.l))
  const maxY = Math.max(...layer.rects.map(r => r.y + r.w))
  const dx = Math.floor((L - maxX) / 2)
  const dy = Math.floor((W - maxY) / 2)
  if (dx === 0 && dy === 0) return layer
  return { count: layer.count, rects: layer.rects.map(r => ({ ...r, x: r.x + dx, y: r.y + dy })) }
}

function emptyResult(input: PalletizationInput): PalletizationResult {
  return {
    valid: false,
    orientation: { footA: input.box.length, footB: input.box.width, height: input.box.height, tipped: false },
    layer: EMPTY_LAYER,
    perLayer: 0,
    fullLayers: 0,
    lastLayerCount: 0,
    totalBoxes: 0,
    naiveTotal: 0,
    limitedBy: 'aucun-colis',
    loadWeight: 0,
    grossWeight: input.pallet.tare,
    loadHeight: 0,
    totalHeight: input.pallet.height,
    areaUsage: 0,
    volumeUsage: 0,
    zone: { length: input.pallet.length, width: input.pallet.width, offset: 0 },
  }
}

export function validateInput(input: PalletizationInput): string | null {
  const { box, pallet } = input
  if (![box.length, box.width, box.height].every(v => Number.isFinite(v) && v >= 10)) {
    return 'Les dimensions du colis doivent être d’au moins 10 mm.'
  }
  if (![pallet.length, pallet.width].every(v => Number.isFinite(v) && v >= 100)) {
    return 'Les dimensions de la palette doivent être d’au moins 100 mm.'
  }
  if (!(input.maxHeight > pallet.height)) {
    return 'La hauteur maximale doit dépasser la hauteur de la palette.'
  }
  return null
}

export function computePalletization(input: PalletizationInput): PalletizationResult {
  if (validateInput(input)) return emptyResult(input)
  const { box, pallet } = input
  const overhang = Math.max(0, input.overhang || 0)
  const zoneL = pallet.length + 2 * overhang
  const zoneW = pallet.width + 2 * overhang
  const usableHeight = input.maxHeight - pallet.height

  // Orientations verticales candidates : posé à plat, puis couché si autorisé
  const candidates: Array<{ footA: number; footB: number; height: number; tipped: boolean }> = [
    { footA: box.length, footB: box.width, height: box.height, tipped: false },
  ]
  if (input.allowTipping) {
    candidates.push(
      { footA: box.length, footB: box.height, height: box.width, tipped: true },
      { footA: box.width, footB: box.height, height: box.length, tipped: true }
    )
  }

  const maxByWeight = input.maxLoad > 0 && box.weight > 0 ? Math.floor(input.maxLoad / box.weight) : Infinity

  let best: PalletizationResult | null = null
  for (const o of candidates) {
    const layers = Math.floor(usableHeight / o.height)
    if (layers <= 0) continue
    const layer = centerLayer(bestLayer(zoneL, zoneW, o.footA, o.footB), zoneL, zoneW)
    if (layer.count === 0) continue

    const byHeight = layer.count * layers
    const totalBoxes = Math.min(byHeight, maxByWeight)
    if (totalBoxes <= 0) continue
    const fullLayers = Math.floor(totalBoxes / layer.count)
    const lastLayerCount = totalBoxes - fullLayers * layer.count
    const usedLayers = fullLayers + (lastLayerCount > 0 ? 1 : 0)
    const loadHeight = usedLayers * o.height

    const candidate: PalletizationResult = {
      valid: true,
      orientation: o,
      layer,
      perLayer: layer.count,
      fullLayers,
      lastLayerCount,
      totalBoxes,
      naiveTotal: 0,
      limitedBy: maxByWeight < byHeight ? 'poids' : 'hauteur',
      loadWeight: totalBoxes * box.weight,
      grossWeight: totalBoxes * box.weight + pallet.tare,
      loadHeight,
      totalHeight: loadHeight + pallet.height,
      areaUsage: (layer.count * o.footA * o.footB) / (pallet.length * pallet.width) * 100,
      volumeUsage: (totalBoxes * box.length * box.width * box.height) / (pallet.length * pallet.width * usableHeight) * 100,
      zone: { length: zoneL, width: zoneW, offset: overhang },
    }

    // À nombre égal : préférer le colis à plat, puis la charge la moins haute
    if (
      !best ||
      candidate.totalBoxes > best.totalBoxes ||
      (candidate.totalBoxes === best.totalBoxes && candidate.totalHeight < best.totalHeight && candidate.orientation.tipped === best.orientation.tipped)
    ) {
      best = candidate
    }
  }

  if (!best) return emptyResult(input)

  // Référence « calcul à la main » : même zone (débord compris), colis à plat, tous dans le même sens
  const naiveLayers = Math.floor(usableHeight / box.height)
  best.naiveTotal = Math.min(naiveLayerCount(zoneL, zoneW, box.length, box.width) * naiveLayers, maxByWeight)
  return best
}

// ---------------------------------------------------------------------------
// Chargement des palettes dans un véhicule

export interface VehicleSpec {
  id: string
  name: string
  length: number // mm utiles
  width: number // mm utiles
  height: number // mm utiles (hauteur de porte pour les conteneurs)
  payload: number // kg, charge utile indicative
}

export interface VehicleLoad {
  vehicle: VehicleSpec
  floorPallets: number
  stackLevels: number // 0 = palette plus haute que le véhicule, 1 = pas de gerbage
  pallets: number
  boxes: number
  weight: number
  overweight: boolean
  layer: LayerPattern
}

export function computeVehicleLoad(
  vehicle: VehicleSpec,
  palletFootprint: { length: number; width: number },
  palletHeight: number,
  palletWeight: number,
  boxesPerPallet: number,
  stackable: boolean
): VehicleLoad {
  const layer = bestLayer(vehicle.length, vehicle.width, palletFootprint.length, palletFootprint.width)
  const levelsThatFit = palletHeight > 0 ? Math.floor(vehicle.height / palletHeight) : 0
  const stackLevels = stackable ? levelsThatFit : Math.min(1, levelsThatFit)
  const pallets = layer.count * stackLevels
  const weight = pallets * palletWeight
  return {
    vehicle,
    floorPallets: layer.count,
    stackLevels,
    pallets,
    boxes: pallets * boxesPerPallet,
    weight,
    overweight: weight > vehicle.payload,
    layer,
  }
}
