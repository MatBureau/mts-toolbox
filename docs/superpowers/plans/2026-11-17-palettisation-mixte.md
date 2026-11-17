# Palettisation mixte — plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ajouter la page `/logistique/palettisation-mixte` : une commande multi-références est répartie sur autant de palettes que nécessaire, chaque palette reçoit un rangement optimisé (couches pleines puis chapeau) et ses étapes de montage animées en 3D.

**Architecture:** Moteur pur TypeScript dans `lib/palette-mixte/` (types, géométrie, état de palette, couches, chapeau à points extrêmes, enchaînement des palettes, étapes, véhicules, collage Excel, lien partageable, PDF), exécuté dans un Web Worker. Interface React dans `components/tools/PalettisationMixte.tsx` et `components/tools/palette-mixte/`, qui réutilise la vue 3D extraite en composant générique `BoxScene3D` partagé avec l'outil actuel.

**Tech Stack:** Next.js 15 (App Router), React 19, TypeScript 5.9, Tailwind 3, three.js 0.182, pdf-lib, Vitest 3 (ajouté).

**Spec:** `docs/superpowers/specs/2026-11-17-palettisation-mixte-design.md`

**Règles git :** commits locaux uniquement. **Aucun push** sans feu vert explicite de Mathis. Chaque message de commit se termine par :

```
Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01RVeUVHqWyQ8YRzVwvntfRT
```

---

## Structure des fichiers

| Fichier | Rôle |
|---|---|
| `vitest.config.ts` | Configuration Vitest, alias `@/` |
| `lib/palette/packing.ts` (modif.) | `centerLayer` exporté |
| `lib/palette-mixte/types.ts` | Types, constantes (limites, appui 75 %, densité estimée, libellés de refus) |
| `lib/palette-mixte/geometry.ts` | Orientations, zone utile, recouvrements, masse estimée |
| `lib/palette-mixte/state.ts` | État d'une palette, contrôle et validation d'un placement |
| `lib/palette-mixte/layers.ts` | Phase des couches pleines |
| `lib/palette-mixte/cap.ts` | Phase du chapeau (points extrêmes) |
| `lib/palette-mixte/pallet.ts` | Construction d'une palette (tri, couches, 4 essais de chapeau) |
| `lib/palette-mixte/steps.ts` | Étapes de montage et libellés de position |
| `lib/palette-mixte/engine.ts` | Validation de la commande, palettes successives, arrêts, garder ensemble, fusion, synthèse |
| `lib/palette-mixte/vehicles.ts` | Véhicules nécessaires pour la commande |
| `lib/palette-mixte/paste.ts` | Analyse du collage Excel |
| `lib/palette-mixte/form.ts` | Saisie (texte) ↔ entrées du moteur |
| `lib/palette-mixte/url-state.ts` | Lien partageable compressé |
| `lib/palette-mixte/colors.ts` | Couleur par référence |
| `lib/palette-mixte/iso.ts` | Ordre de dessin isométrique (PDF) |
| `lib/palette-mixte/pdf.ts` | PDF multi-palettes |
| `lib/palette-mixte/worker.ts` | Web Worker |
| `lib/pdf/draw-plan.ts` | Plan de couche PDF partagé (extrait de `lib/palette/pdf.ts`) |
| `lib/pdf/sanitize.ts` (modif.) | Repli `?` pour les caractères hors WinAnsi |
| `components/tools/palette/fields.tsx` | `NumberField`, `Toggle` (extraits de `VisualiseurPalette.tsx`) |
| `components/tools/palette/PalletSettingsFields.tsx` | Carte « Palette » partagée |
| `components/tools/palette/CrossLink.tsx` | Bandeau de lien entre les deux pages |
| `components/tools/palette/BoxScene3D.tsx` | Vue 3D générique (liste de colis) |
| `components/tools/palette/PalletScene3D.tsx` (modif.) | Adaptateur vers `BoxScene3D` |
| `components/tools/VisualiseurPalette.tsx` (modif.) | Utilise les composants extraits, bandeau croisé |
| `components/tools/palette-mixte/usePalletization.ts` | Calcul via le worker, anti-rebond 300 ms |
| `components/tools/palette-mixte/ReferenceCard.tsx` | Carte d'une référence |
| `components/tools/palette-mixte/PasteImport.tsx` | Zone de collage Excel |
| `components/tools/palette-mixte/StepPlayer.tsx` | Lecteur d'étapes |
| `components/tools/palette-mixte/StepList.tsx` | Liste d'étapes cliquable |
| `components/tools/PalettisationMixte.tsx` | Page outil |
| `lib/tools-config.ts`, `app/(site)/[category]/[tool]/page.tsx`, `lib/tool-seo-data.ts`, `components/seo/ToolContent.tsx` (modif.) | Enregistrement et SEO |
| `tests/palette/packing.test.ts` | Non-régression du moteur actuel |
| `tests/palette-mixte/*.test.ts`, `tests/palette-mixte/helpers.ts` | Tests du nouveau moteur |

Coordonnées utilisées partout : `x` le long de la longueur de la zone utile, `y` le long de sa largeur, `z` depuis le dessus du plancher de la palette, en mm. La zone utile = palette + débord ; son origine est le coin du débord (comme `lib/palette/packing.ts`).

---

### Task 1: Vitest et non-régression du moteur actuel

**Files:**
- Create: `vitest.config.ts`
- Create: `tests/palette/packing.test.ts`
- Modify: `package.json` (script `test`, dépendance de dev)

- [ ] **Step 1: Installer Vitest**

Run: `npm install -D vitest@3.2.4`
Expected: `added … packages`, `package.json` contient `"vitest": "^3.2.4"` dans `devDependencies`.

- [ ] **Step 2: Configurer**

Create `vitest.config.ts` :

```ts
import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  resolve: {
    alias: [{ find: /^@\//, replacement: fileURLToPath(new URL('./', import.meta.url)) }],
  },
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
  },
})
```

Dans `package.json`, section `scripts`, ajouter après `"lint": "next lint"` :

```json
    "lint": "next lint",
    "test": "vitest run"
```

- [ ] **Step 3: Écrire les tests de non-régression**

Create `tests/palette/packing.test.ts` :

```ts
import { describe, it, expect } from 'vitest'
import { bestLayer, computePalletization, computeVehicleLoad } from '@/lib/palette/packing'
import { PALLET_PRESETS, VEHICLE_PRESETS } from '@/lib/palette/presets'

const vehicle = (id: string) => {
  const v = VEHICLE_PRESETS.find(x => x.id === id)
  if (!v) throw new Error(`véhicule ${id} absent`)
  return v
}

describe('moteur de couche (références métier)', () => {
  it.each([
    { name: 'EUR en semi-remorque', id: 'semi', a: 1200, b: 800, expected: 33 },
    { name: 'EUR 2 en semi-remorque', id: 'semi', a: 1200, b: 1000, expected: 26 },
    { name: 'EUR en conteneur 20 pieds', id: 'c20', a: 1200, b: 800, expected: 11 },
    { name: 'EUR en conteneur 40 pieds', id: 'c40', a: 1200, b: 800, expected: 25 },
  ])('$name : $expected', ({ id, a, b, expected }) => {
    const v = vehicle(id)
    expect(bestLayer(v.length, v.width, a, b).count).toBe(expected)
  })

  it('carton 500 × 300 sur palette Europe : 6 par couche (4 en rangement simple)', () => {
    expect(bestLayer(1200, 800, 500, 300).count).toBe(6)
  })

  it('moulinet 50 × 50 / 30 × 20 : 4', () => {
    expect(bestLayer(50, 50, 30, 20).count).toBe(4)
  })

  it('400 × 300 × 250 sur Europe à 1,80 m : 48 colis, 8 par couche', () => {
    const r = computePalletization({
      box: { length: 400, width: 300, height: 250, weight: 5 },
      pallet: PALLET_PRESETS[0],
      maxHeight: 1800,
      maxLoad: 1000,
      overhang: 0,
      allowTipping: false,
    })
    expect(r.totalBoxes).toBe(48)
    expect(r.perLayer).toBe(8)
  })

  it('palettes de 1,35 m gerbables en semi-remorque : 66', () => {
    const load = computeVehicleLoad(vehicle('semi'), { length: 1200, width: 800 }, 1350, 600, 40, true)
    expect(load.pallets).toBe(66)
  })
})
```

- [ ] **Step 4: Lancer**

Run: `npm test`
Expected: `Test Files  1 passed`, `Tests  8 passed`.

- [ ] **Step 5: Commit**

```bash
git add vitest.config.ts tests/palette/packing.test.ts package.json package-lock.json
git commit -m "Test: Vitest et non-régression du moteur de palettisation" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01RVeUVHqWyQ8YRzVwvntfRT"
```

---

### Task 2: Types et géométrie

**Files:**
- Modify: `lib/palette/packing.ts` (exporter `centerLayer`)
- Create: `lib/palette-mixte/types.ts`
- Create: `lib/palette-mixte/geometry.ts`
- Test: `tests/palette-mixte/geometry.test.ts`

- [ ] **Step 1: Écrire le test**

Create `tests/palette-mixte/geometry.test.ts` :

```ts
import { describe, it, expect } from 'vitest'
import { boxesIntersect, footprintOverlap, massOf, orientations, zoneOf } from '@/lib/palette-mixte/geometry'

describe('géométrie', () => {
  it('colis à plat : deux orientations au sol', () => {
    expect(orientations({ length: 400, width: 300, height: 200, upright: true })).toEqual([
      { l: 400, w: 300, h: 200 },
      { l: 300, w: 400, h: 200 },
    ])
  })

  it('colis couchable : six orientations distinctes', () => {
    expect(orientations({ length: 400, width: 300, height: 200, upright: false })).toHaveLength(6)
  })

  it('cube : une seule orientation', () => {
    expect(orientations({ length: 300, width: 300, height: 300, upright: false })).toEqual([{ l: 300, w: 300, h: 300 }])
  })

  it('recouvrement au sol', () => {
    expect(footprintOverlap({ x: 0, y: 0, l: 100, w: 100 }, { x: 50, y: 50, l: 100, w: 100 })).toBe(2500)
    expect(footprintOverlap({ x: 0, y: 0, l: 100, w: 100 }, { x: 100, y: 0, l: 100, w: 100 })).toBe(0)
  })

  it('deux colis qui se touchent ne se chevauchent pas', () => {
    const a = { x: 0, y: 0, z: 0, l: 100, w: 100, h: 100 }
    expect(boxesIntersect(a, { ...a, x: 100 })).toBe(false)
    expect(boxesIntersect(a, { ...a, z: 100 })).toBe(false)
    expect(boxesIntersect(a, { ...a, x: 50, z: 50 })).toBe(true)
  })

  it('zone utile avec débord', () => {
    expect(zoneOf({ pallet: { length: 1200, width: 800, height: 144, tare: 25 }, maxHeight: 1800, maxLoad: 0, overhang: 20 })).toEqual({
      length: 1240,
      width: 840,
      offset: 20,
      usableHeight: 1656,
      palletLength: 1200,
      palletWidth: 800,
    })
  })

  it('masse estimée sans poids : 200 kg/m³', () => {
    expect(massOf(12, 1e9)).toBe(12)
    expect(massOf(0, 1e9)).toBe(200)
  })
})
```

- [ ] **Step 2: Vérifier l'échec**

Run: `npx vitest run tests/palette-mixte/geometry.test.ts`
Expected: FAIL, module `@/lib/palette-mixte/geometry` introuvable.

- [ ] **Step 3: Exporter `centerLayer`**

Dans `lib/palette/packing.ts`, remplacer :

```ts
function centerLayer(layer: LayerPattern, L: number, W: number): LayerPattern {
```

par :

```ts
export function centerLayer(layer: LayerPattern, L: number, W: number): LayerPattern {
```

- [ ] **Step 4: Écrire les types**

Create `lib/palette-mixte/types.ts` :

```ts
import type { PalletSpec } from '@/lib/palette/packing'

// Une référence de la commande (« Colis 1 », « Colis 2 »…)
export interface Reference {
  id: string
  name: string
  length: number // mm
  width: number // mm
  height: number // mm
  quantity: number
  weight: number | null // kg par colis, null = inconnu
  upright: boolean // ce côté vers le haut
  fragile: boolean // rien dessus
  maxLoadOnTop: number | null // kg admissibles au-dessus, null = sans limite
  keepTogether: boolean
  stop: number // 1 = livré en premier
}

export interface OrderSettings {
  pallet: PalletSpec
  maxHeight: number // mm, palette comprise
  maxLoad: number // kg de marchandise, 0 = sans limite
  overhang: number // mm de débord par côté
}

// Un colis individuel issu d'une référence
export interface BoxItem {
  uid: string
  refId: string
  index: number // 1..quantité
  length: number
  width: number
  height: number
  weight: number // 0 si inconnu
  upright: boolean
  fragile: boolean
  maxLoadOnTop: number | null
  keepTogether: boolean
  stop: number
}

export interface Placement {
  uid: string
  refId: string
  index: number
  x: number
  y: number
  z: number
  l: number
  w: number
  h: number
  weight: number
  fragile: boolean
  maxLoadOnTop: number | null
  loadAbove: number // kg posés au-dessus (modèle prudent)
  stop: number
  layer: number | null // indice de couche pleine, null pour le chapeau
}

export type Step =
  | { kind: 'layer'; number: number; layer: number; refId: string; uids: string[]; label: string }
  | { kind: 'box'; number: number; uid: string; refId: string; label: string }

export interface PalletPlan {
  index: number
  placements: Placement[]
  steps: Step[]
  loadWeight: number // kg de marchandise
  grossWeight: number // kg, palette comprise
  totalHeight: number // mm, palette comprise
  volumeUsage: number // % du volume utile
  stops: number[]
  cogWarning: boolean
  topHasFragile: boolean
}

export type RejectReason = 'invalide' | 'trop-grand' | 'trop-haut' | 'trop-lourd'

export interface Rejected {
  refId: string
  count: number
  reason: RejectReason
}

export interface MixedResult {
  error: string | null
  pallets: PalletPlan[]
  rejected: Rejected[]
  totalBoxes: number
  placedBoxes: number
  totalWeight: number // kg, palettes comprises
  missingWeight: boolean
}

export const LIMITS = { maxReferences: 30, maxBoxes: 3000 }

// Part minimale de la base d'un colis qui doit reposer sur un support
export const SUPPORT_RATIO = 0.75

// Tolérance géométrique (mm)
export const EPS = 0.5

// Densité estimée d'un colis sans poids (kg/m³), pour trier et équilibrer
export const ESTIMATED_DENSITY = 200

export const REJECT_LABELS: Record<RejectReason, string> = {
  invalide: 'dimensions invalides (10 mm minimum)',
  'trop-grand': 'plus grand que la palette',
  'trop-haut': 'plus haut que la hauteur disponible',
  'trop-lourd': 'plus lourd que la charge maximale',
}
```

- [ ] **Step 5: Écrire la géométrie**

Create `lib/palette-mixte/geometry.ts` :

```ts
import type { OrderSettings } from './types'
import { EPS, ESTIMATED_DENSITY } from './types'

export interface Rect2 {
  x: number
  y: number
  l: number
  w: number
}

export interface Box3 extends Rect2 {
  z: number
  h: number
}

export interface Orientation {
  l: number
  w: number
  h: number
}

export interface Zone {
  length: number // zone utile = palette + débord
  width: number
  offset: number // débord par côté
  usableHeight: number // hauteur disponible au-dessus du plancher
  palletLength: number
  palletWidth: number
}

// Orientations distinctes : à plat (deux sens au sol) ou toutes si le colis peut être couché
export function orientations(item: { length: number; width: number; height: number; upright: boolean }): Orientation[] {
  const { length: a, width: b, height: c } = item
  const all: Orientation[] = item.upright
    ? [{ l: a, w: b, h: c }, { l: b, w: a, h: c }]
    : [
        { l: a, w: b, h: c },
        { l: b, w: a, h: c },
        { l: a, w: c, h: b },
        { l: c, w: a, h: b },
        { l: b, w: c, h: a },
        { l: c, w: b, h: a },
      ]
  const seen = new Set<string>()
  return all.filter(o => {
    const key = `${o.l}x${o.w}x${o.h}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

export function zoneOf(settings: OrderSettings): Zone {
  const offset = Math.max(0, settings.overhang || 0)
  return {
    length: settings.pallet.length + 2 * offset,
    width: settings.pallet.width + 2 * offset,
    offset,
    usableHeight: settings.maxHeight - settings.pallet.height,
    palletLength: settings.pallet.length,
    palletWidth: settings.pallet.width,
  }
}

export function overlap1D(a0: number, a1: number, b0: number, b1: number): number {
  return Math.max(0, Math.min(a1, b1) - Math.max(a0, b0))
}

export function footprintOverlap(a: Rect2, b: Rect2): number {
  return overlap1D(a.x, a.x + a.l, b.x, b.x + b.l) * overlap1D(a.y, a.y + a.w, b.y, b.y + b.w)
}

export function boxesIntersect(a: Box3, b: Box3): boolean {
  return (
    a.x < b.x + b.l - EPS && b.x < a.x + a.l - EPS &&
    a.y < b.y + b.w - EPS && b.y < a.y + a.w - EPS &&
    a.z < b.z + b.h - EPS && b.z < a.z + a.h - EPS
  )
}

// Masse utilisée pour trier et équilibrer : poids saisi, sinon estimation par le volume
export function massOf(weight: number, volumeMm3: number): number {
  return weight > 0 ? weight : (volumeMm3 / 1e9) * ESTIMATED_DENSITY
}
```

- [ ] **Step 6: Vérifier**

Run: `npx vitest run tests/palette-mixte/geometry.test.ts`
Expected: `Tests  7 passed`.

- [ ] **Step 7: Commit**

```bash
git add lib/palette/packing.ts lib/palette-mixte/types.ts lib/palette-mixte/geometry.ts tests/palette-mixte/geometry.test.ts
git commit -m "Feat(palette-mixte): types et géométrie" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01RVeUVHqWyQ8YRzVwvntfRT"
```

---

### Task 3: État de palette et contraintes de pose

**Files:**
- Create: `lib/palette-mixte/state.ts`
- Test: `tests/palette-mixte/state.test.ts`

- [ ] **Step 1: Écrire le test**

Create `tests/palette-mixte/state.test.ts` :

```ts
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
```

- [ ] **Step 2: Vérifier l'échec**

Run: `npx vitest run tests/palette-mixte/state.test.ts`
Expected: FAIL, module `@/lib/palette-mixte/state` introuvable.

- [ ] **Step 3: Implémenter**

Create `lib/palette-mixte/state.ts` :

```ts
import type { BoxItem, OrderSettings, Placement } from './types'
import { EPS, SUPPORT_RATIO } from './types'
import { boxesIntersect, footprintOverlap, zoneOf, type Box3, type Zone } from './geometry'

export interface PalletState {
  zone: Zone
  maxLoad: number
  placements: Placement[]
  loadWeight: number
}

export function newState(settings: OrderSettings): PalletState {
  return { zone: zoneOf(settings), maxLoad: Math.max(0, settings.maxLoad || 0), placements: [], loadWeight: 0 }
}

export function cloneState(s: PalletState): PalletState {
  return { zone: s.zone, maxLoad: s.maxLoad, placements: s.placements.map(p => ({ ...p })), loadWeight: s.loadWeight }
}

export function topOf(s: PalletState): number {
  return s.placements.reduce((m, p) => Math.max(m, p.z + p.h), 0)
}

/**
 * Contrôle un placement. Renvoie les colis situés dessous (qui porteront son poids),
 * ou null si une règle est violée : zone, hauteur, charge de palette, chevauchement,
 * pose sous un colis existant, fragile dessous, charge supportée, appui < 75 %.
 */
export function checkPlacement(state: PalletState, item: BoxItem, c: Box3): Placement[] | null {
  const { zone } = state
  if (c.x < -EPS || c.y < -EPS || c.x + c.l > zone.length + EPS || c.y + c.w > zone.width + EPS) return null
  if (c.z < -EPS || c.z + c.h > zone.usableHeight + EPS) return null
  if (state.maxLoad > 0 && state.loadWeight + item.weight > state.maxLoad + 1e-9) return null

  let support = 0
  const below: Placement[] = []
  for (const p of state.placements) {
    const overlap = footprintOverlap(p, c)
    if (overlap <= 0) continue
    if (boxesIntersect(p, c)) return null
    // Même emprise sans chevauchement : p est entièrement au-dessus ou au-dessous
    if (p.z >= c.z + c.h - EPS) return null
    if (p.fragile) return null
    if (p.maxLoadOnTop !== null && p.loadAbove + item.weight > p.maxLoadOnTop + 1e-9) return null
    below.push(p)
    if (Math.abs(p.z + p.h - c.z) <= EPS) support += overlap
  }
  if (c.z <= EPS) {
    // Sur le plancher : seule la palette porte, pas le débord
    support = footprintOverlap({ x: zone.offset, y: zone.offset, l: zone.palletLength, w: zone.palletWidth }, c)
  }
  if (support < SUPPORT_RATIO * c.l * c.w - 1e-6) return null
  return below
}

export function commit(state: PalletState, item: BoxItem, c: Box3, below: Placement[], layer: number | null): Placement {
  for (const p of below) p.loadAbove += item.weight
  const placement: Placement = {
    uid: item.uid,
    refId: item.refId,
    index: item.index,
    x: c.x,
    y: c.y,
    z: c.z,
    l: c.l,
    w: c.w,
    h: c.h,
    weight: item.weight,
    fragile: item.fragile,
    maxLoadOnTop: item.maxLoadOnTop,
    loadAbove: 0,
    stop: item.stop,
    layer,
  }
  state.placements.push(placement)
  state.loadWeight += item.weight
  return placement
}
```

- [ ] **Step 4: Vérifier**

Run: `npx vitest run tests/palette-mixte/state.test.ts`
Expected: `Tests  7 passed`.

- [ ] **Step 5: Commit**

```bash
git add lib/palette-mixte/state.ts tests/palette-mixte/state.test.ts
git commit -m "Feat(palette-mixte): contraintes de pose (appui, fragiles, charges)" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01RVeUVHqWyQ8YRzVwvntfRT"
```

---

### Task 4: Phase des couches pleines

**Files:**
- Create: `lib/palette-mixte/layers.ts`
- Create: `tests/palette-mixte/fixtures.ts`
- Test: `tests/palette-mixte/layers.test.ts`

- [ ] **Step 1: Écrire les données de test partagées**

Create `tests/palette-mixte/fixtures.ts` :

```ts
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
```

- [ ] **Step 2: Écrire le test**

Create `tests/palette-mixte/layers.test.ts` :

```ts
import { describe, it, expect } from 'vitest'
import { layerPhase } from '@/lib/palette-mixte/layers'
import { newState } from '@/lib/palette-mixte/state'
import { items, settings } from './fixtures'

describe('couches pleines', () => {
  it('empile des couches jusqu’à la hauteur maximale', () => {
    const s = newState(settings())
    layerPhase(s, items('a', 100))
    expect(s.placements).toHaveLength(48)
    expect(new Set(s.placements.map(p => p.layer)).size).toBe(6)
  })

  it('ne forme jamais de couche incomplète', () => {
    const s = newState(settings())
    layerPhase(s, items('a', 12))
    expect(s.placements).toHaveLength(8)
  })

  it('laisse les fragiles au chapeau', () => {
    const s = newState(settings())
    layerPhase(s, items('f', 20, { fragile: true }))
    expect(s.placements).toHaveLength(0)
  })

  it('s’arrête avant de dépasser la charge maximale', () => {
    const s = newState(settings({ maxLoad: 1000 }))
    layerPhase(s, items('a', 100, { weight: 30 }))
    expect(s.placements).toHaveLength(32)
  })

  it('enchaîne deux références dans l’ordre reçu', () => {
    const s = newState(settings())
    layerPhase(s, [...items('a', 8, { length: 600, width: 400, height: 400, weight: 15 }), ...items('b', 8)])
    const b = s.placements.filter(p => p.refId === 'b')
    expect(b).toHaveLength(8)
    expect(b.every(p => p.z === 800)).toBe(true)
  })
})
```

- [ ] **Step 3: Vérifier l'échec**

Run: `npx vitest run tests/palette-mixte/layers.test.ts`
Expected: FAIL, module `@/lib/palette-mixte/layers` introuvable.

- [ ] **Step 4: Implémenter**

Create `lib/palette-mixte/layers.ts` :

```ts
import { bestLayer, centerLayer, type LayerPattern } from '@/lib/palette/packing'
import type { BoxItem } from './types'
import { orientations } from './geometry'
import { checkPlacement, cloneState, commit, topOf, type PalletState } from './state'

// Les mêmes dimensions reviennent d'une palette à l'autre : on garde les plans calculés
const patternCache = new Map<string, LayerPattern>()

function layerPattern(L: number, W: number, l: number, w: number): LayerPattern {
  const key = `${L}x${W}:${l}x${w}`
  let pattern = patternCache.get(key)
  if (!pattern) {
    pattern = centerLayer(bestLayer(L, W, l, w), L, W)
    patternCache.set(key, pattern)
  }
  return pattern
}

/**
 * Pose des couches pleines et homogènes, référence par référence, dans l'ordre reçu
 * (déjà trié : dernier client, non fragiles, lourds d'abord). Une couche n'est posée
 * que si tous ses colis respectent les contraintes. Les fragiles sont laissés au chapeau.
 */
export function layerPhase(state: PalletState, items: BoxItem[]): void {
  const groups = new Map<string, BoxItem[]>()
  for (const item of items) {
    if (item.fragile) continue
    const group = groups.get(item.refId)
    if (group) group.push(item)
    else groups.set(item.refId, [item])
  }

  const { zone } = state
  let layerIndex = 0
  for (const group of groups.values()) {
    // Orientation qui pose le plus de colis en couches pleines, puis la plus basse
    const available = zone.usableHeight - topOf(state)
    let best: { pattern: LayerPattern; h: number; score: number } | null = null
    const seen = new Set<string>()
    for (const o of orientations(group[0])) {
      const key = `${Math.min(o.l, o.w)}x${Math.max(o.l, o.w)}x${o.h}`
      if (seen.has(key)) continue
      seen.add(key)
      const pattern = layerPattern(zone.length, zone.width, o.l, o.w)
      if (pattern.count === 0) continue
      const layers = Math.min(Math.floor(group.length / pattern.count), Math.floor(available / o.h))
      const score = layers * pattern.count
      if (score === 0) continue
      if (!best || score > best.score || (score === best.score && o.h < best.h)) best = { pattern, h: o.h, score }
    }
    if (!best) continue

    let cursor = 0
    while (group.length - cursor >= best.pattern.count) {
      const z = topOf(state)
      const trial = cloneState(state)
      let ok = true
      for (let i = 0; i < best.pattern.count; i++) {
        const r = best.pattern.rects[i]
        const c = { x: r.x, y: r.y, z, l: r.l, w: r.w, h: best.h }
        const below = checkPlacement(trial, group[cursor + i], c)
        if (!below) {
          ok = false
          break
        }
        commit(trial, group[cursor + i], c, below, layerIndex)
      }
      if (!ok) break
      state.placements = trial.placements
      state.loadWeight = trial.loadWeight
      cursor += best.pattern.count
      layerIndex += 1
    }
  }
}
```

- [ ] **Step 5: Vérifier**

Run: `npx vitest run tests/palette-mixte/layers.test.ts`
Expected: `Tests  5 passed`.

- [ ] **Step 6: Commit**

```bash
git add lib/palette-mixte/layers.ts tests/palette-mixte/fixtures.ts tests/palette-mixte/layers.test.ts
git commit -m "Feat(palette-mixte): phase des couches pleines" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01RVeUVHqWyQ8YRzVwvntfRT"
```

---

### Task 5: Phase du chapeau (points extrêmes)

**Files:**
- Create: `lib/palette-mixte/cap.ts`
- Test: `tests/palette-mixte/cap.test.ts`

- [ ] **Step 1: Écrire le test**

Create `tests/palette-mixte/cap.test.ts` :

```ts
import { describe, it, expect } from 'vitest'
import { capPhase, sortForCap } from '@/lib/palette-mixte/cap'
import { checkPlacement, commit, newState } from '@/lib/palette-mixte/state'
import { items, settings } from './fixtures'

describe('chapeau', () => {
  it('pose le premier colis au fond à gauche sur la palette', () => {
    const s = newState(settings())
    capPhase(s, items('a', 1, { height: 200 }), 'volume')
    expect(s.placements[0]).toMatchObject({ x: 0, y: 0, z: 0, layer: null })
  })

  it('remplit le plancher avant de monter', () => {
    const s = newState(settings())
    capPhase(s, items('a', 7, { height: 200 }), 'volume')
    expect(s.placements.filter(p => p.z === 0)).toHaveLength(6)
    expect(s.placements[6]).toMatchObject({ x: 0, y: 0, z: 200 })
  })

  it('tourne le colis quand le sens d’origine ne passe pas', () => {
    const s = newState(settings())
    capPhase(s, items('a', 1, { length: 500, width: 900, height: 200 }), 'volume')
    expect(s.placements[0]).toMatchObject({ l: 900, w: 500 })
  })

  it('ne pose rien sur un fragile', () => {
    const s = newState(settings())
    const [fragile] = items('f', 1, { length: 1200, width: 800, height: 200, fragile: true })
    const c = { x: 0, y: 0, z: 0, l: 1200, w: 800, h: 200 }
    commit(s, fragile, c, checkPlacement(s, fragile, c)!, null)
    capPhase(s, items('a', 3), 'volume')
    expect(s.placements).toHaveLength(1)
  })

  it('respecte la charge maximale', () => {
    const s = newState(settings({ maxLoad: 25 }))
    capPhase(s, items('a', 5, { weight: 10 }), 'volume')
    expect(s.placements).toHaveLength(2)
  })

  it('trie : dernier client, puis non fragiles, puis le critère choisi', () => {
    const list = [
      ...items('petit', 1, { length: 100, width: 100, height: 100 }),
      ...items('fragile', 1, { length: 600, width: 400, height: 400, fragile: true }),
      ...items('grand', 1, { length: 600, width: 400, height: 400 }),
      ...items('client2', 1, { length: 100, width: 100, height: 100, stop: 2 }),
    ]
    expect(sortForCap(list, 'volume').map(i => i.refId)).toEqual(['client2', 'grand', 'petit', 'fragile'])
  })
})
```

- [ ] **Step 2: Vérifier l'échec**

Run: `npx vitest run tests/palette-mixte/cap.test.ts`
Expected: FAIL, module `@/lib/palette-mixte/cap` introuvable.

- [ ] **Step 3: Implémenter**

Create `lib/palette-mixte/cap.ts` :

```ts
import type { BoxItem, Placement } from './types'
import { EPS } from './types'
import { massOf, orientations, type Box3 } from './geometry'
import { checkPlacement, commit, type PalletState } from './state'

export type CapOrder = 'volume' | 'base' | 'height' | 'weight'
export const CAP_ORDERS: CapOrder[] = ['volume', 'base', 'height', 'weight']

const volume = (i: BoxItem) => i.length * i.width * i.height

export function heaviness(i: BoxItem): number {
  return massOf(i.weight, volume(i))
}

const KEY: Record<CapOrder, (i: BoxItem) => number> = {
  volume,
  base: i => i.length * i.width,
  height: i => i.height,
  weight: heaviness,
}

// Dernier client d'abord (en bas), fragiles en dernier, puis le critère, puis un ordre stable
export function sortForCap(items: BoxItem[], order: CapOrder): BoxItem[] {
  const key = KEY[order]
  return [...items].sort(
    (a, b) =>
      b.stop - a.stop ||
      Number(a.fragile) - Number(b.fragile) ||
      key(b) - key(a) ||
      (a.refId < b.refId ? -1 : a.refId > b.refId ? 1 : 0) ||
      a.index - b.index
  )
}

interface Point {
  x: number
  y: number
  z: number
}

const cmp = (a: Point, b: Point) => a.z - b.z || a.y - b.y || a.x - b.x
const keyOf = (p: Point) => `${p.x}|${p.y}|${p.z}`

function inside(p: Point, b: Box3): boolean {
  return (
    p.x >= b.x - EPS && p.x < b.x + b.l - EPS &&
    p.y >= b.y - EPS && p.y < b.y + b.w - EPS &&
    p.z >= b.z - EPS && p.z < b.z + b.h - EPS
  )
}

function pointsOf(p: Box3): Point[] {
  return [
    { x: p.x + p.l, y: p.y, z: p.z },
    { x: p.x, y: p.y + p.w, z: p.z },
    { x: p.x, y: p.y, z: p.z + p.h },
  ]
}

// Ajoute des points candidats : hors zone et déjà occupés écartés, sans doublon, triés
function addPoints(pts: Point[], fresh: Point[], state: PalletState): Point[] {
  const { zone } = state
  const keys = new Set(pts.map(keyOf))
  const out = [...pts]
  for (const p of fresh) {
    if (p.x >= zone.length - EPS || p.y >= zone.width - EPS || p.z >= zone.usableHeight - EPS) continue
    const key = keyOf(p)
    if (keys.has(key) || state.placements.some(b => inside(p, b))) continue
    keys.add(key)
    out.push(p)
  }
  return out.sort(cmp)
}

/**
 * Pose les colis un à un au point candidat le plus bas, puis le plus au fond, puis le plus
 * à gauche, dans l'ordre de tri demandé. Une référence qui ne passe plus est abandonnée
 * pour cette palette : l'état ne fait que se remplir, ses colis suivants échoueraient aussi.
 */
export function capPhase(state: PalletState, items: BoxItem[], order: CapOrder): void {
  let pts = addPoints([], [{ x: 0, y: 0, z: 0 }, ...state.placements.flatMap(pointsOf)], state)
  const failed = new Set<string>()

  for (const item of sortForCap(items, order)) {
    if (failed.has(item.refId)) continue
    if (state.maxLoad > 0 && state.loadWeight + item.weight > state.maxLoad + 1e-9) {
      failed.add(item.refId)
      continue
    }

    let best: { pt: Point; c: Box3; below: Placement[] } | null = null
    for (const o of orientations(item)) {
      for (const pt of pts) {
        if (best && cmp(pt, best.pt) >= 0) break
        if (pt.z + o.h > state.zone.usableHeight + EPS) break
        const c = { x: pt.x, y: pt.y, z: pt.z, l: o.l, w: o.w, h: o.h }
        const below = checkPlacement(state, item, c)
        if (below) {
          best = { pt, c, below }
          break
        }
      }
    }

    if (!best) {
      failed.add(item.refId)
      continue
    }
    const placed = commit(state, item, best.c, best.below, null)
    pts = addPoints(pts.filter(p => !inside(p, placed)), pointsOf(placed), state)
  }
}
```

- [ ] **Step 4: Vérifier**

Run: `npx vitest run tests/palette-mixte/cap.test.ts`
Expected: `Tests  6 passed`.

- [ ] **Step 5: Commit**

```bash
git add lib/palette-mixte/cap.ts tests/palette-mixte/cap.test.ts
git commit -m "Feat(palette-mixte): chapeau par points extrêmes" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01RVeUVHqWyQ8YRzVwvntfRT"
```

---

### Task 6: Construction d'une palette

**Files:**
- Create: `lib/palette-mixte/pallet.ts`
- Test: `tests/palette-mixte/pallet.test.ts`

- [ ] **Step 1: Écrire le test**

Create `tests/palette-mixte/pallet.test.ts` :

```ts
import { describe, it, expect } from 'vitest'
import { computePalletization } from '@/lib/palette/packing'
import { buildPallet, sortItems } from '@/lib/palette-mixte/pallet'
import { EUR, items, settings } from './fixtures'

const simple = (weight: number, maxLoad: number) =>
  computePalletization({
    box: { length: 400, width: 300, height: 250, weight },
    pallet: EUR,
    maxHeight: 1800,
    maxLoad,
    overhang: 0,
    allowTipping: false,
  }).totalBoxes

describe('construction d’une palette', () => {
  it('trie : dernier client, non fragiles, lourds d’abord', () => {
    const list = [
      ...items('a', 1, { weight: 5 }),
      ...items('b', 1, { weight: 20 }),
      ...items('c', 1, { weight: 50, fragile: true }),
      ...items('d', 1, { weight: 1, stop: 2 }),
    ]
    expect(sortItems(list).map(i => i.refId)).toEqual(['d', 'b', 'a', 'c'])
  })

  it('égale la palettisation simple, limite de hauteur', () => {
    const s = buildPallet(items('a', 200), settings())
    expect(s.placements).toHaveLength(simple(5, 0))
  })

  it('égale la palettisation simple, limite de poids (couche incomplète)', () => {
    const s = buildPallet(items('a', 200, { weight: 30 }), settings({ maxLoad: 1000 }))
    expect(simple(30, 1000)).toBe(33)
    expect(s.placements).toHaveLength(33)
  })

  it('pose le reste en chapeau au-dessus des couches', () => {
    const s = buildPallet(
      [...items('a', 8, { length: 600, width: 400, height: 400, weight: 15 }), ...items('b', 3, { length: 300, width: 200, height: 150, weight: 2 })],
      settings()
    )
    const b = s.placements.filter(p => p.refId === 'b')
    expect(b).toHaveLength(3)
    expect(b.every(p => p.z === 800 && p.layer === null)).toBe(true)
  })
})
```

- [ ] **Step 2: Vérifier l'échec**

Run: `npx vitest run tests/palette-mixte/pallet.test.ts`
Expected: FAIL, module `@/lib/palette-mixte/pallet` introuvable.

- [ ] **Step 3: Implémenter**

Create `lib/palette-mixte/pallet.ts` :

```ts
import type { BoxItem, OrderSettings } from './types'
import { massOf } from './geometry'
import { layerPhase } from './layers'
import { CAP_ORDERS, capPhase, heaviness } from './cap'
import { cloneState, newState, type PalletState } from './state'

// Dernier client d'abord (en bas), non fragiles avant fragiles, lourds avant légers
export function sortItems(items: BoxItem[]): BoxItem[] {
  return [...items].sort(
    (a, b) =>
      b.stop - a.stop ||
      Number(a.fragile) - Number(b.fragile) ||
      heaviness(b) - heaviness(a) ||
      (a.refId < b.refId ? -1 : a.refId > b.refId ? 1 : 0) ||
      a.index - b.index
  )
}

function centerOfMassZ(s: PalletState): number {
  let mass = 0
  let moment = 0
  for (const p of s.placements) {
    const m = massOf(p.weight, p.l * p.w * p.h)
    mass += m
    moment += m * (p.z + p.h / 2)
  }
  return mass > 0 ? moment / mass : 0
}

/**
 * Une palette : couches pleines, puis chapeau. Quatre ordres de chapeau sont essayés ;
 * on garde celui qui pose le plus de colis, puis le centre de gravité le plus bas.
 */
export function buildPallet(items: BoxItem[], settings: OrderSettings): PalletState {
  const base = newState(settings)
  const sorted = sortItems(items)
  layerPhase(base, sorted)

  const placed = new Set(base.placements.map(p => p.uid))
  const rest = sorted.filter(i => !placed.has(i.uid))
  if (rest.length === 0) return base

  let best: PalletState | null = null
  for (const order of CAP_ORDERS) {
    const trial = cloneState(base)
    capPhase(trial, rest, order)
    if (
      !best ||
      trial.placements.length > best.placements.length ||
      (trial.placements.length === best.placements.length && centerOfMassZ(trial) < centerOfMassZ(best))
    ) {
      best = trial
    }
  }
  return best ?? base
}
```

- [ ] **Step 4: Vérifier**

Run: `npx vitest run tests/palette-mixte/pallet.test.ts`
Expected: `Tests  4 passed`.

- [ ] **Step 5: Commit**

```bash
git add lib/palette-mixte/pallet.ts tests/palette-mixte/pallet.test.ts
git commit -m "Feat(palette-mixte): construction d'une palette, équivalence avec l'outil simple" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01RVeUVHqWyQ8YRzVwvntfRT"
```

---

### Task 7: Étapes de montage

**Files:**
- Create: `lib/palette-mixte/steps.ts`
- Test: `tests/palette-mixte/steps.test.ts`

- [ ] **Step 1: Écrire le test**

Create `tests/palette-mixte/steps.test.ts` :

```ts
import { describe, it, expect } from 'vitest'
import { buildPallet } from '@/lib/palette-mixte/pallet'
import { buildSteps, positionLabel } from '@/lib/palette-mixte/steps'
import { zoneOf } from '@/lib/palette-mixte/geometry'
import { items, settings } from './fixtures'

const zone = zoneOf(settings())

describe('étapes', () => {
  it('couches puis colis du chapeau, avec support et position en mots', () => {
    const s = buildPallet(
      [...items('a', 4, { length: 600, width: 400, height: 400, weight: 15 }), ...items('b', 1, { length: 300, width: 200, height: 150, weight: 2 })],
      settings()
    )
    const steps = buildSteps(s.placements, new Map([['a', 'Carton A'], ['b', 'Carton B']]), s.zone)
    expect(steps).toHaveLength(2)
    expect(steps[0]).toMatchObject({ kind: 'layer', number: 1, layer: 0, refId: 'a', label: 'Couche 1 : 4 × Carton A' })
    expect(steps[1]).toMatchObject({ kind: 'box', number: 2, refId: 'b', label: 'Carton B n° 1 — posé sur Carton A, au fond, à gauche' })
  })

  it('positions par tiers de palette', () => {
    expect(positionLabel({ x: 500, y: 300, l: 200, w: 200 }, zone)).toBe('au centre')
    expect(positionLabel({ x: 500, y: 700, l: 200, w: 100 }, zone)).toBe('devant')
    expect(positionLabel({ x: 1000, y: 0, l: 200, w: 100 }, zone)).toBe('au fond, à droite')
  })
})
```

- [ ] **Step 2: Vérifier l'échec**

Run: `npx vitest run tests/palette-mixte/steps.test.ts`
Expected: FAIL, module `@/lib/palette-mixte/steps` introuvable.

- [ ] **Step 3: Implémenter**

Create `lib/palette-mixte/steps.ts` :

```ts
import type { Placement, Step } from './types'
import { EPS } from './types'
import { footprintOverlap, type Rect2, type Zone } from './geometry'

// Position par tiers de la palette, vue de dessus : y faible = fond, x faible = gauche
export function positionLabel(p: Rect2, zone: Zone): string {
  const cx = p.x + p.l / 2 - zone.offset
  const cy = p.y + p.w / 2 - zone.offset
  const side = cx < zone.palletLength / 3 ? 'à gauche' : cx > (2 * zone.palletLength) / 3 ? 'à droite' : null
  const depth = cy < zone.palletWidth / 3 ? 'au fond' : cy > (2 * zone.palletWidth) / 3 ? 'devant' : null
  if (!side && !depth) return 'au centre'
  return [depth, side].filter(Boolean).join(', ')
}

/**
 * Ordre de montage : couches de bas en haut, puis chapeau trié par hauteur, fond, gauche.
 * Un colis n'est donc jamais posé avant ce qui le porte.
 */
export function buildSteps(placements: Placement[], names: Map<string, string>, zone: Zone): Step[] {
  const name = (refId: string) => names.get(refId) ?? 'Colis'
  const layers = new Map<number, Placement[]>()
  const cap: Placement[] = []
  for (const p of placements) {
    if (p.layer === null) {
      cap.push(p)
    } else {
      const layer = layers.get(p.layer)
      if (layer) layer.push(p)
      else layers.set(p.layer, [p])
    }
  }

  const steps: Step[] = []
  for (const layer of [...layers.keys()].sort((a, b) => a - b)) {
    const ps = layers.get(layer) ?? []
    steps.push({
      kind: 'layer',
      number: steps.length + 1,
      layer,
      refId: ps[0].refId,
      uids: ps.map(p => p.uid),
      label: `Couche ${layer + 1} : ${ps.length} × ${name(ps[0].refId)}`,
    })
  }

  cap.sort((a, b) => a.z - b.z || a.y - b.y || a.x - b.x)
  for (const p of cap) {
    const supports =
      p.z <= EPS
        ? 'la palette'
        : [...new Set(placements.filter(q => Math.abs(q.z + q.h - p.z) <= EPS && footprintOverlap(q, p) > 0).map(q => name(q.refId)))].join(' et ')
    steps.push({
      kind: 'box',
      number: steps.length + 1,
      uid: p.uid,
      refId: p.refId,
      label: `${name(p.refId)} n° ${p.index} — posé sur ${supports}, ${positionLabel(p, zone)}`,
    })
  }
  return steps
}
```

- [ ] **Step 4: Vérifier**

Run: `npx vitest run tests/palette-mixte/steps.test.ts`
Expected: `Tests  2 passed`.

- [ ] **Step 5: Commit**

```bash
git add lib/palette-mixte/steps.ts tests/palette-mixte/steps.test.ts
git commit -m "Feat(palette-mixte): étapes de montage" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01RVeUVHqWyQ8YRzVwvntfRT"
```

---

### Task 8: Moteur de commande (palettes, clients, garder ensemble, refus)

**Files:**
- Create: `lib/palette-mixte/engine.ts`
- Create: `tests/palette-mixte/helpers.ts`
- Test: `tests/palette-mixte/engine.test.ts`

- [ ] **Step 1: Écrire l'aide aux invariants**

Create `tests/palette-mixte/helpers.ts` :

```ts
import type { MixedResult, OrderSettings, PalletPlan, Reference } from '@/lib/palette-mixte/types'
import { EPS, SUPPORT_RATIO } from '@/lib/palette-mixte/types'
import { boxesIntersect, footprintOverlap, zoneOf } from '@/lib/palette-mixte/geometry'

// Générateur pseudo-aléatoire à graine fixe (mulberry32)
export function mulberry32(seed: number): () => number {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function randomOrder(seed: number): { refs: Reference[]; settings: OrderSettings } {
  const rnd = mulberry32(seed)
  const pick = (a: number, b: number, step = 10) => a + Math.floor(rnd() * ((b - a) / step + 1)) * step
  const n = 1 + Math.floor(rnd() * 8)
  const refs: Reference[] = Array.from({ length: n }, (_, i) => ({
    id: `r${i}`,
    name: `Colis ${i + 1}`,
    length: pick(150, 700),
    width: pick(150, 600),
    height: pick(100, 500),
    quantity: 1 + Math.floor(rnd() * 30),
    weight: rnd() < 0.2 ? null : pick(1, 25, 1),
    upright: rnd() < 0.8,
    fragile: rnd() < 0.15,
    maxLoadOnTop: rnd() < 0.2 ? pick(20, 150) : null,
    keepTogether: rnd() < 0.2,
    stop: 1 + Math.floor(rnd() * 3),
  }))
  const settings: OrderSettings = {
    pallet: { length: 1200, width: 800, height: 144, tare: 25 },
    maxHeight: 1800,
    maxLoad: rnd() < 0.5 ? 1000 : 0,
    overhang: rnd() < 0.3 ? 20 : 0,
  }
  return { refs, settings }
}

// Recalcule toutes les règles depuis les placements finaux, sans réutiliser le code du moteur
export function palletViolations(plan: PalletPlan, settings: OrderSettings): string[] {
  const zone = zoneOf(settings)
  const ps = plan.placements
  const errors: string[] = []
  const deck = { x: zone.offset, y: zone.offset, l: zone.palletLength, w: zone.palletWidth }

  ps.forEach((p, i) => {
    if (p.x < -EPS || p.y < -EPS || p.x + p.l > zone.length + EPS || p.y + p.w > zone.width + EPS) errors.push(`${p.uid} hors zone`)
    if (p.z + p.h > zone.usableHeight + EPS) errors.push(`${p.uid} trop haut`)
    for (let j = i + 1; j < ps.length; j++) if (boxesIntersect(p, ps[j])) errors.push(`${p.uid} chevauche ${ps[j].uid}`)

    if (p.z <= EPS) {
      // Plancher : le centre de la base doit être au-dessus de la palette (le débord autorisé est accepté)
      const cx = p.x + p.l / 2
      const cy = p.y + p.w / 2
      if (cx < deck.x - EPS || cx > deck.x + deck.l + EPS || cy < deck.y - EPS || cy > deck.y + deck.w + EPS) errors.push(`${p.uid} centre hors palette`)
    } else {
      const support = ps.filter(q => Math.abs(q.z + q.h - p.z) <= EPS).reduce((sum, q) => sum + footprintOverlap(q, p), 0)
      if (support < SUPPORT_RATIO * p.l * p.w - 1e-6) errors.push(`${p.uid} appui ${Math.round((support / (p.l * p.w)) * 100)} %`)
    }

    const above = ps.filter(q => q !== p && q.z >= p.z + p.h - EPS && footprintOverlap(q, p) > 0)
    if (p.fragile && above.length > 0) errors.push(`${p.uid} fragile recouvert`)
    if (p.maxLoadOnTop !== null) {
      const load = above.reduce((sum, q) => sum + q.weight, 0)
      if (load > p.maxLoadOnTop + 1e-6) errors.push(`${p.uid} écrasé (${load} kg)`)
    }
  })

  if (settings.maxLoad > 0 && plan.loadWeight > settings.maxLoad + 1e-6) errors.push('charge maximale dépassée')

  const stepOf = new Map<string, number>()
  for (const s of plan.steps) for (const uid of s.kind === 'layer' ? s.uids : [s.uid]) stepOf.set(uid, s.number)
  if (stepOf.size !== ps.length) errors.push('étapes incomplètes')
  for (const p of ps) {
    if (p.z <= EPS) continue
    for (const q of ps) {
      if (Math.abs(q.z + q.h - p.z) <= EPS && footprintOverlap(q, p) > 0 && (stepOf.get(q.uid) ?? 0) >= (stepOf.get(p.uid) ?? 0)) {
        errors.push(`${p.uid} posé avant son support ${q.uid}`)
      }
    }
  }
  return errors
}

export const rejectedCount = (r: MixedResult) => r.rejected.reduce((sum, x) => sum + x.count, 0)
```

- [ ] **Step 2: Écrire le test**

Create `tests/palette-mixte/engine.test.ts` :

```ts
import { describe, it, expect } from 'vitest'
import { palletizeOrder } from '@/lib/palette-mixte/engine'
import { palletViolations, randomOrder, rejectedCount } from './helpers'
import { ref, settings } from './fixtures'

const big = { length: 600, width: 400, height: 400, weight: 15 }

describe('palettisation d’une commande', () => {
  it('respecte toutes les règles sur des commandes aléatoires', () => {
    for (let seed = 1; seed <= 15; seed++) {
      const { refs, settings: s } = randomOrder(seed)
      const r = palletizeOrder(refs, s)
      expect(r.error).toBeNull()
      for (const p of r.pallets) expect(palletViolations(p, s), `graine ${seed}, palette ${p.index + 1}`).toEqual([])
      expect(r.placedBoxes + rejectedCount(r)).toBe(r.totalBoxes)
    }
  }, 120_000)

  it('refuse les colis impossibles avec la bonne raison', () => {
    const r = palletizeOrder(
      [
        ref({ id: 'grand', length: 1300, width: 900, height: 100 }),
        ref({ id: 'haut', length: 500, width: 500, height: 2000, upright: false }),
        ref({ id: 'lourd', weight: 1200 }),
        ref({ id: 'minuscule', length: 5 }),
        ref({ id: 'ok', quantity: 3 }),
      ],
      settings({ maxLoad: 1000 })
    )
    expect(r.rejected).toEqual(
      expect.arrayContaining([
        { refId: 'grand', count: 1, reason: 'trop-grand' },
        { refId: 'haut', count: 1, reason: 'trop-haut' },
        { refId: 'lourd', count: 1, reason: 'trop-lourd' },
        { refId: 'minuscule', count: 1, reason: 'invalide' },
      ])
    )
    expect(r.placedBoxes).toBe(3)
    expect(r.totalBoxes).toBe(7)
  })

  it('applique les limites de saisie', () => {
    expect(palletizeOrder(Array.from({ length: 31 }, (_, i) => ref({ id: `r${i}` })), settings()).error).toMatch(/30 références/)
    expect(palletizeOrder([ref({ id: 'a', quantity: 3001 })], settings()).error).toMatch(/colis au maximum/)
  })

  it('sépare les clients et regroupe les fins de commande, dernier livré en bas', () => {
    const r = palletizeOrder(
      [ref({ id: 'a', ...big, quantity: 40, stop: 1 }), ref({ id: 'b', ...big, quantity: 40, stop: 2 })],
      settings()
    )
    expect(r.pallets).toHaveLength(5)
    const mixed = r.pallets.filter(p => p.stops.length > 1)
    expect(mixed).toHaveLength(1)
    const zA = mixed[0].placements.filter(p => p.refId === 'a').map(p => p.z)
    const zB = mixed[0].placements.filter(p => p.refId === 'b').map(p => p.z)
    expect(Math.max(...zB)).toBeLessThan(Math.min(...zA))
  })

  it('garde une référence ensemble quand elle tient sur une palette', () => {
    const order = (keepTogether: boolean) =>
      palletizeOrder(
        [ref({ id: 'a', ...big, quantity: 12 }), ref({ id: 'k', length: 600, width: 400, height: 300, weight: 10, quantity: 8, keepTogether })],
        settings()
      )
    const together = order(true)
    expect(together.pallets[0].placements.every(p => p.refId === 'a')).toBe(true)
    expect(together.pallets[1].placements.filter(p => p.refId === 'k')).toHaveLength(8)
    const split = order(false)
    expect(split.pallets[0].placements.filter(p => p.refId === 'k')).toHaveLength(4)
  })

  it('signale les poids manquants', () => {
    expect(palletizeOrder([ref({ id: 'a', weight: null })], settings()).missingWeight).toBe(true)
    expect(palletizeOrder([ref({ id: 'a' })], settings()).missingWeight).toBe(false)
  })

  it('reste rapide sur une grosse commande (30 références, 3 000 colis)', () => {
    const refs = Array.from({ length: 30 }, (_, i) =>
      ref({ id: `r${i}`, length: 200 + (i % 6) * 60, width: 150 + (i % 5) * 50, height: 120 + (i % 4) * 70, weight: 2 + (i % 7), quantity: 100 })
    )
    const start = Date.now()
    const r = palletizeOrder(refs, settings({ maxLoad: 1000 }))
    expect(r.placedBoxes).toBe(3000)
    expect(Date.now() - start).toBeLessThan(8000)
  }, 30_000)
})
```

- [ ] **Step 3: Vérifier l'échec**

Run: `npx vitest run tests/palette-mixte/engine.test.ts`
Expected: FAIL, module `@/lib/palette-mixte/engine` introuvable.

- [ ] **Step 4: Implémenter**

Create `lib/palette-mixte/engine.ts` :

```ts
import type { BoxItem, MixedResult, OrderSettings, PalletPlan, Reference, Rejected, RejectReason } from './types'
import { EPS, LIMITS } from './types'
import { massOf, orientations, zoneOf, type Zone } from './geometry'
import { buildPallet } from './pallet'
import { buildSteps } from './steps'
import type { PalletState } from './state'

// Fin de client regroupable si remplie à moins de la moitié du volume utile
const UNDERFILLED = 0.5

const quantityOf = (r: Reference) => Math.max(1, Math.floor(r.quantity || 1))

function rejectReason(ref: Reference, settings: OrderSettings, zone: Zone): RejectReason | null {
  if (![ref.length, ref.width, ref.height].every(v => Number.isFinite(v) && v >= 10)) return 'invalide'
  if (settings.maxLoad > 0 && (ref.weight ?? 0) > settings.maxLoad) return 'trop-lourd'
  const fits = orientations(ref).filter(o => (o.l <= zone.length && o.w <= zone.width) || (o.w <= zone.length && o.l <= zone.width))
  if (fits.length === 0) return 'trop-grand'
  if (!fits.some(o => o.h <= zone.usableHeight)) return 'trop-haut'
  return null
}

export function prepare(refs: Reference[], settings: OrderSettings): { items: BoxItem[]; rejected: Rejected[]; error: string | null } {
  const fail = (error: string) => ({ items: [], rejected: [], error })
  if (refs.length > LIMITS.maxReferences) return fail(`${LIMITS.maxReferences} références au maximum (${refs.length} saisies).`)
  const total = refs.reduce((sum, r) => sum + quantityOf(r), 0)
  if (total > LIMITS.maxBoxes) {
    return fail(`${LIMITS.maxBoxes.toLocaleString('fr-FR')} colis au maximum (${total.toLocaleString('fr-FR')} saisis).`)
  }
  if (!(settings.pallet.length >= 100 && settings.pallet.width >= 100)) return fail('Les dimensions de la palette doivent être d’au moins 100 mm.')
  if (!(settings.maxHeight > settings.pallet.height)) return fail('La hauteur maximale doit dépasser la hauteur de la palette.')

  const zone = zoneOf(settings)
  const items: BoxItem[] = []
  const rejected: Rejected[] = []
  for (const ref of refs) {
    const quantity = quantityOf(ref)
    const reason = rejectReason(ref, settings, zone)
    if (reason) {
      rejected.push({ refId: ref.id, count: quantity, reason })
      continue
    }
    for (let k = 1; k <= quantity; k++) {
      items.push({
        uid: `${ref.id}#${k}`,
        refId: ref.id,
        index: k,
        length: ref.length,
        width: ref.width,
        height: ref.height,
        weight: ref.weight && ref.weight > 0 ? ref.weight : 0,
        upright: ref.upright,
        fragile: ref.fragile,
        maxLoadOnTop: ref.maxLoadOnTop,
        keepTogether: ref.keepTogether,
        stop: Math.max(1, Math.floor(ref.stop || 1)),
      })
    }
  }
  return { items, rejected, error: null }
}

// Palettes successives d'un même client, avec la règle « garder ensemble »
function buildSeries(items: BoxItem[], settings: OrderSettings): { pallets: PalletState[]; leftover: BoxItem[] } {
  const pallets: PalletState[] = []
  const fitsAloneCache = new Map<string, boolean>()
  const fitsAlone = (refId: string, refItems: BoxItem[]) => {
    let fits = fitsAloneCache.get(refId)
    if (fits === undefined) {
      fits = buildPallet(refItems, settings).placements.length === refItems.length
      fitsAloneCache.set(refId, fits)
    }
    return fits
  }

  let remaining = items
  while (remaining.length > 0) {
    const excluded = new Set<string>()
    let state = buildPallet(remaining, settings)

    // Une référence « ensemble » coupée en deux, qui tiendrait entière sur une palette neuve, est reportée
    for (;;) {
      const placed = new Set(state.placements.map(p => p.uid))
      const split: string[] = []
      for (const refId of new Set(remaining.filter(i => i.keepTogether).map(i => i.refId))) {
        if (excluded.has(refId)) continue
        const refItems = remaining.filter(i => i.refId === refId)
        const onPallet = refItems.filter(i => placed.has(i.uid)).length
        if (onPallet > 0 && onPallet < refItems.length && fitsAlone(refId, refItems)) split.push(refId)
      }
      if (split.length === 0) break
      split.forEach(refId => excluded.add(refId))
      const candidates = remaining.filter(i => !excluded.has(i.refId))
      if (candidates.length === 0) break
      const next = buildPallet(candidates, settings)
      if (next.placements.length === 0) break
      state = next
    }

    if (state.placements.length === 0) break // ne doit pas arriver après prepare : garde-fou
    pallets.push(state)
    const placed = new Set(state.placements.map(p => p.uid))
    remaining = remaining.filter(i => !placed.has(i.uid))
  }
  return { pallets, leftover: remaining }
}

function volumeRatio(s: PalletState): number {
  const volume = s.placements.reduce((sum, p) => sum + p.l * p.w * p.h, 0)
  return volume / (s.zone.palletLength * s.zone.palletWidth * s.zone.usableHeight)
}

function finalize(s: PalletState, index: number, settings: OrderSettings, names: Map<string, string>): PalletPlan {
  const z = s.zone
  const top = s.placements.reduce((m, p) => Math.max(m, p.z + p.h), 0)
  let mass = 0
  let mx = 0
  let my = 0
  for (const p of s.placements) {
    const m = massOf(p.weight, p.l * p.w * p.h)
    mass += m
    mx += m * (p.x + p.l / 2)
    my += m * (p.y + p.w / 2)
  }
  const cx = z.offset + z.palletLength / 2
  const cy = z.offset + z.palletWidth / 2
  return {
    index,
    placements: s.placements,
    steps: buildSteps(s.placements, names, z),
    loadWeight: s.loadWeight,
    grossWeight: s.loadWeight + settings.pallet.tare,
    totalHeight: settings.pallet.height + top,
    volumeUsage: volumeRatio(s) * 100,
    stops: [...new Set(s.placements.map(p => p.stop))].sort((a, b) => a - b),
    cogWarning: mass > 0 && (Math.abs(mx / mass - cx) > 0.1 * z.palletLength || Math.abs(my / mass - cy) > 0.1 * z.palletWidth),
    topHasFragile: s.placements.some(p => p.fragile && Math.abs(p.z + p.h - top) <= EPS),
  }
}

export function palletizeOrder(refs: Reference[], settings: OrderSettings): MixedResult {
  const totalBoxes = refs.reduce((sum, r) => sum + quantityOf(r), 0)
  const prep = prepare(refs, settings)
  if (prep.error) {
    return { error: prep.error, pallets: [], rejected: [], totalBoxes, placedBoxes: 0, totalWeight: 0, missingWeight: false }
  }

  const itemByUid = new Map(prep.items.map(i => [i.uid, i]))
  const stops = [...new Set(prep.items.map(i => i.stop))].sort((a, b) => a - b)
  const full: PalletState[] = []
  const partial: PalletState[] = []
  const leftover: BoxItem[] = []

  for (const stop of stops) {
    const series = buildSeries(prep.items.filter(i => i.stop === stop), settings)
    leftover.push(...series.leftover)
    series.pallets.forEach((p, k) => {
      const isLast = k === series.pallets.length - 1
      if (isLast && stops.length > 1 && volumeRatio(p) < UNDERFILLED) partial.push(p)
      else full.push(p)
    })
  }

  // Fusion gloutonne des fins de client, dans l'ordre des arrêts (le tri met le dernier livré en bas)
  const merged: PalletState[] = []
  let current: PalletState | null = null
  for (const p of partial) {
    if (!current) {
      current = p
      continue
    }
    const union = [...current.placements, ...p.placements].map(pl => itemByUid.get(pl.uid)).filter((i): i is BoxItem => !!i)
    const trial = buildPallet(union, settings)
    if (trial.placements.length === union.length) {
      current = trial
    } else {
      merged.push(current)
      current = p
    }
  }
  if (current) merged.push(current)

  const minStop = (s: PalletState) => Math.min(...s.placements.map(p => p.stop))
  const states = [...full, ...merged].sort((a, b) => minStop(a) - minStop(b))
  const names = new Map(refs.map(r => [r.id, r.name]))
  const pallets = states.map((s, i) => finalize(s, i, settings, names))

  const leftoverByRef = new Map<string, number>()
  for (const i of leftover) leftoverByRef.set(i.refId, (leftoverByRef.get(i.refId) ?? 0) + 1)
  const rejected: Rejected[] = [
    ...prep.rejected,
    ...[...leftoverByRef].map(([refId, count]): Rejected => ({ refId, count, reason: 'trop-grand' })),
  ]

  return {
    error: null,
    pallets,
    rejected,
    totalBoxes,
    placedBoxes: pallets.reduce((sum, p) => sum + p.placements.length, 0),
    totalWeight: pallets.reduce((sum, p) => sum + p.grossWeight, 0),
    missingWeight: prep.items.some(i => i.weight === 0),
  }
}
```

- [ ] **Step 5: Vérifier**

Run: `npx vitest run tests/palette-mixte/engine.test.ts`
Expected: `Tests  7 passed`. Si un invariant échoue, le message donne la graine et la palette : corriger le moteur, ne pas assouplir le test.

- [ ] **Step 6: Commit**

```bash
git add lib/palette-mixte/engine.ts tests/palette-mixte/helpers.ts tests/palette-mixte/engine.test.ts
git commit -m "Feat(palette-mixte): moteur de commande multi-palettes" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01RVeUVHqWyQ8YRzVwvntfRT"
```

---

### Task 9: Véhicules nécessaires

**Files:**
- Create: `lib/palette-mixte/vehicles.ts`
- Test: `tests/palette-mixte/vehicles.test.ts`

- [ ] **Step 1: Écrire le test**

Create `tests/palette-mixte/vehicles.test.ts` :

```ts
import { describe, it, expect } from 'vitest'
import { orderVehicleLoad } from '@/lib/palette-mixte/vehicles'
import { VEHICLE_PRESETS } from '@/lib/palette/presets'

const semi = VEHICLE_PRESETS.find(v => v.id === 'semi')!
const eur = { length: 1200, width: 800 }
const pal = (totalHeight: number, topHasFragile = false, grossWeight = 500) => ({ totalHeight, grossWeight, topHasFragile })

describe('véhicules', () => {
  it('places au sol et nombre de véhicules', () => {
    expect(orderVehicleLoad(semi, eur, [pal(1300), pal(1200), pal(900)], false)).toMatchObject({
      floorCapacity: 33, positions: 3, vehiclesNeeded: 1, tooTall: 0,
    })
  })

  it('gerbe la palette la plus haute avec la plus haute qui tient', () => {
    expect(orderVehicleLoad(semi, eur, [pal(1300), pal(1200), pal(900)], true).positions).toBe(2)
  })

  it('une palette au dessus fragile peut être posée dessus, jamais dessous', () => {
    expect(orderVehicleLoad(semi, eur, [pal(1500, true), pal(1200)], true).positions).toBe(1)
    expect(orderVehicleLoad(semi, eur, [pal(1500, true), pal(1200, true)], true).positions).toBe(2)
  })

  it('signale les palettes trop hautes', () => {
    expect(orderVehicleLoad(semi, eur, [pal(2800), pal(1000)], false)).toMatchObject({ tooTall: 1, positions: 1 })
  })

  it('tient compte de la charge utile', () => {
    const many = Array.from({ length: 30 }, () => pal(1000, false, 1000))
    expect(orderVehicleLoad(semi, eur, many, false).vehiclesNeeded).toBe(2)
  })
})
```

- [ ] **Step 2: Vérifier l'échec**

Run: `npx vitest run tests/palette-mixte/vehicles.test.ts`
Expected: FAIL, module `@/lib/palette-mixte/vehicles` introuvable.

- [ ] **Step 3: Implémenter**

Create `lib/palette-mixte/vehicles.ts` :

```ts
import { bestLayer, type VehicleSpec } from '@/lib/palette/packing'

export interface PalletForVehicle {
  totalHeight: number
  grossWeight: number
  topHasFragile: boolean
}

export interface OrderVehicleLoad {
  vehicle: VehicleSpec
  floorCapacity: number // palettes au sol par véhicule
  positions: number // emplacements au sol utilisés par la commande
  vehiclesNeeded: number | null // null : la palette ne rentre pas au sol
  tooTall: number // palettes plus hautes que le véhicule
  totalWeight: number
}

/**
 * Gerbage glouton : chaque palette porteuse (sans fragile au sommet), de la plus haute
 * à la plus basse, reçoit la plus haute palette restante dont la hauteur cumulée tient.
 */
export function orderVehicleLoad(
  vehicle: VehicleSpec,
  footprint: { length: number; width: number },
  pallets: PalletForVehicle[],
  stackable: boolean
): OrderVehicleLoad {
  const floorCapacity = bestLayer(vehicle.length, vehicle.width, footprint.length, footprint.width).count
  const fit = pallets.filter(p => p.totalHeight <= vehicle.height)
  const tooTall = pallets.length - fit.length

  let pairs = 0
  if (stackable) {
    const byHeight = [...fit].sort((a, b) => b.totalHeight - a.totalHeight)
    const used = new Set<number>()
    byHeight.forEach((bottom, i) => {
      if (used.has(i) || bottom.topHasFragile) return
      used.add(i)
      const j = byHeight.findIndex((top, k) => !used.has(k) && bottom.totalHeight + top.totalHeight <= vehicle.height)
      if (j >= 0) {
        used.add(j)
        pairs += 1
      }
    })
  }

  const positions = fit.length - pairs
  const totalWeight = fit.reduce((sum, p) => sum + p.grossWeight, 0)
  const byFloor = floorCapacity > 0 ? Math.ceil(positions / floorCapacity) : null
  const byWeight = Math.ceil(totalWeight / vehicle.payload)
  return {
    vehicle,
    floorCapacity,
    positions,
    vehiclesNeeded: positions === 0 ? 0 : byFloor === null ? null : Math.max(byFloor, byWeight),
    tooTall,
    totalWeight,
  }
}
```

- [ ] **Step 4: Vérifier**

Run: `npx vitest run tests/palette-mixte/vehicles.test.ts`
Expected: `Tests  5 passed`.

- [ ] **Step 5: Commit**

```bash
git add lib/palette-mixte/vehicles.ts tests/palette-mixte/vehicles.test.ts
git commit -m "Feat(palette-mixte): véhicules nécessaires pour la commande" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01RVeUVHqWyQ8YRzVwvntfRT"
```

---

### Task 10: Collage depuis Excel

**Files:**
- Create: `lib/palette-mixte/paste.ts`
- Test: `tests/palette-mixte/paste.test.ts`

- [ ] **Step 1: Écrire le test**

Create `tests/palette-mixte/paste.test.ts` :

```ts
import { describe, it, expect } from 'vitest'
import { parsePastedReferences } from '@/lib/palette-mixte/paste'

describe('collage Excel', () => {
  it('lit des lignes tabulées (copie depuis Excel)', () => {
    expect(parsePastedReferences('Carton A\t600\t400\t400\t12\t15').rows).toEqual([
      { name: 'Carton A', length: '600', width: '400', height: '400', quantity: '12', weight: '15' },
    ])
  })

  it('ignore l’en-tête et lit les décimales à virgule', () => {
    const r = parsePastedReferences('nom;L;l;H;quantité;poids\nCarton B;400;300;250;5;6,5')
    expect(r.rows).toEqual([{ name: 'Carton B', length: '400', width: '300', height: '250', quantity: '5', weight: '6.5' }])
    expect(r.errors).toEqual([])
  })

  it('accepte une ligne sans nom, séparée par des virgules', () => {
    expect(parsePastedReferences('500,300,200,3').rows).toEqual([
      { name: '', length: '500', width: '300', height: '200', quantity: '3', weight: '' },
    ])
  })

  it('quantité absente : 1', () => {
    expect(parsePastedReferences('C\t100\t100\t100').rows[0].quantity).toBe('1')
  })

  it('signale les lignes illisibles avec leur numéro', () => {
    const r = parsePastedReferences('A\t100\t100\t100\nn’importe quoi\nB\t200\t200\t200')
    expect(r.rows).toHaveLength(2)
    expect(r.errors).toEqual([{ line: 2, message: 'trois dimensions numériques attendues (L, l, H en mm)' }])
  })
})
```

- [ ] **Step 2: Vérifier l'échec**

Run: `npx vitest run tests/palette-mixte/paste.test.ts`
Expected: FAIL, module `@/lib/palette-mixte/paste` introuvable.

- [ ] **Step 3: Implémenter**

Create `lib/palette-mixte/paste.ts` :

```ts
export interface PastedRow {
  name: string
  length: string
  width: string
  height: string
  quantity: string
  weight: string
}

export interface PasteResult {
  rows: PastedRow[]
  errors: { line: number; message: string }[]
}

const numeric = (cell: string | undefined): string | null => {
  if (cell === undefined) return null
  const t = cell.replace(/\s/g, '').replace(',', '.')
  return /^\d+(\.\d+)?$/.test(t) ? t : null
}

/**
 * Lignes « nom ; L ; l ; H ; quantité ; poids » (nom facultatif). Séparateur : tabulation,
 * sinon point-virgule, sinon virgule (les décimales doivent alors utiliser le point).
 * Une première ligne illisible est prise pour un en-tête et ignorée.
 */
export function parsePastedReferences(text: string): PasteResult {
  const rows: PastedRow[] = []
  const errors: PasteResult['errors'] = []
  let first = true

  text.split(/\r?\n/).forEach((raw, i) => {
    const line = raw.trim()
    if (!line) return
    const sep = line.includes('\t') ? '\t' : line.includes(';') ? ';' : ','
    const cells = line.split(sep).map(c => c.trim())
    const hasName = numeric(cells[0]) === null
    const values = hasName ? cells.slice(1) : cells
    const nums = values.map(numeric)
    const readable = values.length >= 3 && nums.slice(0, 3).every(v => v !== null)

    if (!readable) {
      if (!first) errors.push({ line: i + 1, message: 'trois dimensions numériques attendues (L, l, H en mm)' })
      first = false
      return
    }
    first = false
    rows.push({
      name: hasName ? cells[0].slice(0, 40) : '',
      length: nums[0] as string,
      width: nums[1] as string,
      height: nums[2] as string,
      quantity: nums[3] ?? '1',
      weight: nums[4] ?? '',
    })
  })
  return { rows, errors }
}
```

- [ ] **Step 4: Vérifier**

Run: `npx vitest run tests/palette-mixte/paste.test.ts`
Expected: `Tests  5 passed`.

- [ ] **Step 5: Commit**

```bash
git add lib/palette-mixte/paste.ts tests/palette-mixte/paste.test.ts
git commit -m "Feat(palette-mixte): collage des références depuis Excel" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01RVeUVHqWyQ8YRzVwvntfRT"
```

---

### Task 11: Saisie et lien partageable

**Files:**
- Create: `lib/palette-mixte/form.ts`
- Create: `lib/palette-mixte/url-state.ts`
- Test: `tests/palette-mixte/form.test.ts`

- [ ] **Step 1: Écrire le test**

Create `tests/palette-mixte/form.test.ts` :

```ts
import { describe, it, expect } from 'vitest'
import { defaultOrder, emptyRef, formToEngine, type OrderForm } from '@/lib/palette-mixte/form'
import { decodeOrder, encodeOrder, unpackOrder } from '@/lib/palette-mixte/url-state'

const withoutIds = (o: OrderForm) => ({ ...o, refs: o.refs.map(({ id: _id, ...rest }) => rest) })

describe('saisie', () => {
  it('convertit la saisie en entrées du moteur', () => {
    const { refs, settings, incomplete } = formToEngine(defaultOrder())
    expect(refs).toHaveLength(3)
    expect(refs[0]).toMatchObject({ name: 'Colis 1', length: 600, width: 400, height: 400, quantity: 12, weight: 15, upright: true, maxLoadOnTop: null, stop: 1 })
    expect(settings).toEqual({ pallet: { length: 1200, width: 800, height: 144, tare: 25 }, maxHeight: 1800, maxLoad: 1000, overhang: 0 })
    expect(incomplete).toBe(0)
  })

  it('ignore les références incomplètes ; poids vide = inconnu ; quantité vide = 1', () => {
    const form = defaultOrder()
    form.refs.push(emptyRef(4))
    form.refs[1] = { ...form.refs[1], weight: '', quantity: '' }
    const { refs, incomplete } = formToEngine(form)
    expect(incomplete).toBe(1)
    expect(refs[1]).toMatchObject({ weight: null, quantity: 1 })
  })
})

describe('lien partageable', () => {
  it('aller-retour sans perte', async () => {
    const form = defaultOrder()
    form.refs[1] = { ...form.refs[1], maxLoadOnTop: '40', stop: '2', keepTogether: true, upright: false }
    const back = await decodeOrder(await encodeOrder(form))
    expect(back).not.toBeNull()
    expect(withoutIds(back!)).toEqual(withoutIds(form))
  })

  it('refuse un lien corrompu', async () => {
    expect(await decodeOrder('xabc')).toBeNull()
    expect(await decodeOrder('j!!!')).toBeNull()
  })

  it('assainit les valeurs reçues', () => {
    const o = unpackOrder({ v: 1, p: ['eur', '1', '1', '1', '1', '2000', 'abc', '5', 0], r: [['X'.repeat(60), '600', '400', '<b>', '2', '', 1, 0, '', 0, '1']] })
    expect(o).not.toBeNull()
    expect(o!.palletLength).toBe('1200')
    expect(o!.maxLoad).toBe('')
    expect(o!.refs[0].name).toHaveLength(40)
    expect(o!.refs[0].height).toBe('')
  })
})
```

- [ ] **Step 2: Vérifier l'échec**

Run: `npx vitest run tests/palette-mixte/form.test.ts`
Expected: FAIL, modules introuvables.

- [ ] **Step 3: Implémenter la saisie**

Create `lib/palette-mixte/form.ts` :

```ts
import { PALLET_PRESETS } from '@/lib/palette/presets'
import { parseNumber } from '@/lib/palette/url-state'
import type { OrderSettings, Reference } from './types'

// Saisie conservée en texte, pour qu'un champ puisse être vidé pendant la frappe
export interface RefForm {
  id: string
  name: string
  length: string
  width: string
  height: string
  quantity: string
  weight: string
  upright: boolean
  fragile: boolean
  maxLoadOnTop: string
  keepTogether: boolean
  stop: string
}

export interface OrderForm {
  palletId: string
  palletLength: string
  palletWidth: string
  palletHeight: string
  palletTare: string
  maxHeight: string
  maxLoad: string
  overhang: string
  stackable: boolean
  refs: RefForm[]
}

let counter = 0
export function newRefId(): string {
  counter += 1
  return `r${Date.now().toString(36)}${counter.toString(36)}`
}

export function emptyRef(n: number): RefForm {
  return {
    id: newRefId(),
    name: `Colis ${n}`,
    length: '',
    width: '',
    height: '',
    quantity: '1',
    weight: '',
    upright: true,
    fragile: false,
    maxLoadOnTop: '',
    keepTogether: false,
    stop: '1',
  }
}

// Exemple de départ : deux palettes, un chapeau et un fragile, pour montrer l'outil en action
export function defaultOrder(): OrderForm {
  const eur = PALLET_PRESETS[0]
  return {
    palletId: eur.id,
    palletLength: String(eur.length),
    palletWidth: String(eur.width),
    palletHeight: String(eur.height),
    palletTare: String(eur.tare),
    maxHeight: '1800',
    maxLoad: '1000',
    overhang: '0',
    stackable: false,
    refs: [
      { ...emptyRef(1), length: '600', width: '400', height: '400', quantity: '12', weight: '15' },
      { ...emptyRef(2), length: '400', width: '300', height: '250', quantity: '20', weight: '6' },
      { ...emptyRef(3), length: '300', width: '200', height: '150', quantity: '10', weight: '2', fragile: true },
    ],
  }
}

export function formToEngine(form: OrderForm): { refs: Reference[]; settings: OrderSettings; incomplete: number } {
  const settings: OrderSettings = {
    pallet: {
      length: parseNumber(form.palletLength),
      width: parseNumber(form.palletWidth),
      height: parseNumber(form.palletHeight),
      tare: parseNumber(form.palletTare),
    },
    maxHeight: parseNumber(form.maxHeight),
    maxLoad: parseNumber(form.maxLoad),
    overhang: parseNumber(form.overhang),
  }
  const complete = form.refs.filter(r => r.length.trim() !== '' && r.width.trim() !== '' && r.height.trim() !== '')
  const refs = complete.map((r, i): Reference => {
    const weight = parseNumber(r.weight)
    return {
      id: r.id,
      name: r.name.trim() || `Colis ${i + 1}`,
      length: parseNumber(r.length),
      width: parseNumber(r.width),
      height: parseNumber(r.height),
      quantity: Math.max(1, Math.floor(parseNumber(r.quantity) || 1)),
      weight: weight > 0 ? weight : null,
      upright: r.upright,
      fragile: r.fragile,
      maxLoadOnTop: r.maxLoadOnTop.trim() === '' ? null : Math.max(0, parseNumber(r.maxLoadOnTop)),
      keepTogether: r.keepTogether,
      stop: Math.max(1, Math.floor(parseNumber(r.stop) || 1)),
    }
  })
  return { refs, settings, incomplete: form.refs.length - complete.length }
}
```

- [ ] **Step 4: Implémenter le lien**

Create `lib/palette-mixte/url-state.ts` :

```ts
import { CUSTOM_PALLET_ID, PALLET_PRESETS } from '@/lib/palette/presets'
import { defaultOrder, newRefId, type OrderForm } from './form'
import { LIMITS } from './types'

type Flag = 0 | 1
type PackedRef = [string, string, string, string, string, string, Flag, Flag, string, Flag, string]
interface Packed {
  v: 1
  p: [string, string, string, string, string, string, string, string, Flag]
  r: PackedRef[]
}

const flag = (b: boolean): Flag => (b ? 1 : 0)

// Format compact : des tableaux plutôt que des objets, pour un lien court
export function packOrder(f: OrderForm): Packed {
  return {
    v: 1,
    p: [f.palletId, f.palletLength, f.palletWidth, f.palletHeight, f.palletTare, f.maxHeight, f.maxLoad, f.overhang, flag(f.stackable)],
    r: f.refs.map(r => [r.name, r.length, r.width, r.height, r.quantity, r.weight, flag(r.upright), flag(r.fragile), r.maxLoadOnTop, flag(r.keepTogether), r.stop]),
  }
}

const NUM = /^\d{0,6}([.,]\d{0,3})?$/
const num = (v: unknown): string => (typeof v === 'string' && NUM.test(v) ? v : '')

// Un lien vient de n'importe où : chaque valeur est revérifiée
export function unpackOrder(data: unknown): OrderForm | null {
  if (!data || typeof data !== 'object') return null
  const d = data as { v?: unknown; p?: unknown; r?: unknown }
  if (d.v !== 1 || !Array.isArray(d.p) || !Array.isArray(d.r)) return null
  const p = d.p as unknown[]
  const base = defaultOrder()
  const id = typeof p[0] === 'string' && (p[0] === CUSTOM_PALLET_ID || PALLET_PRESETS.some(x => x.id === p[0])) ? p[0] : base.palletId
  const order: OrderForm = {
    palletId: id,
    palletLength: num(p[1]) || base.palletLength,
    palletWidth: num(p[2]) || base.palletWidth,
    palletHeight: num(p[3]) || base.palletHeight,
    palletTare: num(p[4]) || base.palletTare,
    maxHeight: num(p[5]) || base.maxHeight,
    maxLoad: num(p[6]),
    overhang: num(p[7]),
    stackable: p[8] === 1,
    refs: [],
  }
  const preset = PALLET_PRESETS.find(x => x.id === id)
  if (preset) {
    order.palletLength = String(preset.length)
    order.palletWidth = String(preset.width)
    order.palletHeight = String(preset.height)
    order.palletTare = String(preset.tare)
  }
  order.refs = (d.r as unknown[])
    .filter((r): r is unknown[] => Array.isArray(r))
    .slice(0, LIMITS.maxReferences)
    .map((r, i) => ({
      id: newRefId(),
      name: typeof r[0] === 'string' ? r[0].slice(0, 40) : `Colis ${i + 1}`,
      length: num(r[1]),
      width: num(r[2]),
      height: num(r[3]),
      quantity: num(r[4]) || '1',
      weight: num(r[5]),
      upright: r[6] !== 0,
      fragile: r[7] === 1,
      maxLoadOnTop: num(r[8]),
      keepTogether: r[9] === 1,
      stop: num(r[10]) || '1',
    }))
  return order
}

function toBase64Url(bytes: Uint8Array): string {
  let bin = ''
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i])
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fromBase64Url(s: string): Uint8Array<ArrayBuffer> {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4)
  return Uint8Array.from(atob(b64), c => c.charCodeAt(0))
}

/** « z… » : JSON compressé (deflate-raw) ; « j… » : JSON brut si la compression manque. */
export async function encodeOrder(f: OrderForm): Promise<string> {
  const json = new TextEncoder().encode(JSON.stringify(packOrder(f)))
  if (typeof CompressionStream !== 'undefined') {
    try {
      const stream = new Blob([json]).stream().pipeThrough(new CompressionStream('deflate-raw'))
      return 'z' + toBase64Url(new Uint8Array(await new Response(stream).arrayBuffer()))
    } catch {
      // repli sans compression
    }
  }
  return 'j' + toBase64Url(json)
}

export async function decodeOrder(code: string): Promise<OrderForm | null> {
  try {
    let bytes = fromBase64Url(code.slice(1))
    if (code[0] === 'z') {
      const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate-raw'))
      bytes = new Uint8Array(await new Response(stream).arrayBuffer())
    } else if (code[0] !== 'j') {
      return null
    }
    return unpackOrder(JSON.parse(new TextDecoder().decode(bytes)))
  } catch {
    return null
  }
}
```

- [ ] **Step 5: Vérifier**

Run: `npx vitest run tests/palette-mixte/form.test.ts`
Expected: `Tests  5 passed`.

- [ ] **Step 6: Commit**

```bash
git add lib/palette-mixte/form.ts lib/palette-mixte/url-state.ts tests/palette-mixte/form.test.ts
git commit -m "Feat(palette-mixte): saisie et lien partageable compressé" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01RVeUVHqWyQ8YRzVwvntfRT"
```

---

### Task 12: Couleurs, ordre isométrique, texte PDF

**Files:**
- Create: `lib/palette-mixte/colors.ts`
- Create: `lib/palette-mixte/iso.ts`
- Modify: `lib/pdf/sanitize.ts`
- Test: `tests/palette-mixte/draw.test.ts`

- [ ] **Step 1: Écrire le test**

Create `tests/palette-mixte/draw.test.ts` :

```ts
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
```

- [ ] **Step 2: Vérifier l'échec**

Run: `npx vitest run tests/palette-mixte/draw.test.ts`
Expected: FAIL, modules introuvables.

- [ ] **Step 3: Implémenter les couleurs**

Create `lib/palette-mixte/colors.ts` :

```ts
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
```

- [ ] **Step 4: Implémenter l'ordre isométrique**

Create `lib/palette-mixte/iso.ts` :

```ts
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
```

- [ ] **Step 5: Repli WinAnsi**

Dans `lib/pdf/sanitize.ts`, remplacer :

```ts
    .replace(/\u00F7/g, '/')  // Division sign → /
}
```

par :

```ts
    .replace(/\u00F7/g, '/')  // Division sign → /
    // Tout autre caractère hors WinAnsi (emoji, autres alphabets) ferait échouer pdf-lib
    .replace(/[^\u0000-\u00FF\u0152\u0153\u0160\u0161\u0178\u017D\u017E\u0192\u02C6\u02DC\u2020-\u2022\u2030\u2039\u203A\u20AC\u2122]/gu, '?')
}
```

- [ ] **Step 6: Vérifier**

Run: `npx vitest run tests/palette-mixte/draw.test.ts`
Expected: `Tests  4 passed`.

- [ ] **Step 7: Commit**

```bash
git add lib/palette-mixte/colors.ts lib/palette-mixte/iso.ts lib/pdf/sanitize.ts tests/palette-mixte/draw.test.ts
git commit -m "Feat(palette-mixte): couleurs, ordre isométrique, repli WinAnsi des PDF" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01RVeUVHqWyQ8YRzVwvntfRT"
```

---

### Task 13: PDF multi-palettes

**Files:**
- Create: `lib/pdf/draw-plan.ts`
- Modify: `lib/palette/pdf.ts`
- Create: `lib/palette-mixte/pdf.ts`
- Test: `tests/palette-mixte/pdf.test.ts`

- [ ] **Step 1: Écrire le test**

Create `tests/palette-mixte/pdf.test.ts` :

```ts
import { describe, it, expect } from 'vitest'
import { defaultOrder, formToEngine } from '@/lib/palette-mixte/form'
import { palletizeOrder } from '@/lib/palette-mixte/engine'
import { generateOrderPDF } from '@/lib/palette-mixte/pdf'

describe('PDF', () => {
  it('génère un PDF même avec un nom exotique', async () => {
    const form = defaultOrder()
    form.refs[0] = { ...form.refs[0], name: 'Carton 📦 spécial' }
    const { refs, settings } = formToEngine(form)
    const result = palletizeOrder(refs, settings)
    const blob = await generateOrderPDF({
      refs,
      settings,
      palletName: 'Europe EUR / EPAL 1',
      result,
      vehicles: [],
      colorOf: () => [0.8, 0.6, 0.4],
      shareUrl: 'https://mts-toolbox.com/logistique/palettisation-mixte#c=x',
    })
    const head = new TextDecoder().decode(new Uint8Array(await blob.arrayBuffer()).slice(0, 5))
    expect(head).toBe('%PDF-')
    expect(blob.size).toBeGreaterThan(2000)
  }, 30_000)
})
```

- [ ] **Step 2: Vérifier l'échec**

Run: `npx vitest run tests/palette-mixte/pdf.test.ts`
Expected: FAIL, module `@/lib/palette-mixte/pdf` introuvable.

- [ ] **Step 3: Extraire le plan de couche PDF**

Create `lib/pdf/draw-plan.ts` en y déplaçant **sans changement** la fonction `drawPlan` et ses trois alias de type depuis `lib/palette/pdf.ts`, avec ces en-têtes :

```ts
import type { Rect } from '@/lib/palette/packing'
import { sanitizeForPDF } from './sanitize'

type PdfPage = import('pdf-lib').PDFPage
type RgbFn = typeof import('pdf-lib').rgb
type PdfFont = import('pdf-lib').PDFFont

// Plan de couche coté, vue de dessus (longueur à l'horizontale), dans le rectangle (x, y, w, h)
export function drawPlan(
```

Le corps de la fonction est celui actuellement en fin de `lib/palette/pdf.ts` (de `function drawPlan(` jusqu'à la dernière accolade du fichier).

Puis, dans `lib/palette/pdf.ts` :
- supprimer le bloc qui commence à `type PdfPage = import('pdf-lib').PDFPage` jusqu'à la fin du fichier ;
- remplacer `import type { PalletizationInput, PalletizationResult, VehicleLoad, Rect } from './packing'` par `import type { PalletizationInput, PalletizationResult, VehicleLoad } from './packing'` ;
- ajouter sous `import { sanitizeForPDF } from '@/lib/pdf/sanitize'` : `import { drawPlan } from '@/lib/pdf/draw-plan'`.

Run: `npx tsc --noEmit 2>&1 | grep -v "^\.next/"`
Expected: aucune sortie.

- [ ] **Step 4: Implémenter le PDF de commande**

Create `lib/palette-mixte/pdf.ts` :

```ts
import type { MixedResult, OrderSettings, PalletPlan, Reference } from './types'
import { REJECT_LABELS } from './types'
import type { OrderVehicleLoad } from './vehicles'
import { isoOrder, type IsoBox } from './iso'
import { sanitizeForPDF } from '@/lib/pdf/sanitize'
import { drawPlan } from '@/lib/pdf/draw-plan'

type RGB = [number, number, number]
type PdfPage = import('pdf-lib').PDFPage
type RgbFn = typeof import('pdf-lib').rgb

export interface OrderPdfOptions {
  refs: Reference[]
  settings: OrderSettings
  palletName: string
  result: MixedResult
  vehicles: OrderVehicleLoad[]
  colorOf: (refId: string) => RGB
  shareUrl: string
}

const fmt = (n: number, d = 0) => n.toLocaleString('fr-FR', { minimumFractionDigits: d, maximumFractionDigits: d })
const PAGE: [number, number] = [595, 842]
const MARGIN = 40

// Couches consécutives d'une même référence : un seul plan « Couches 1 à 4 »
function layerGroups(p: PalletPlan) {
  const out: { from: number; to: number; refId: string; uids: string[] }[] = []
  for (const s of p.steps) {
    if (s.kind !== 'layer') continue
    const last = out[out.length - 1]
    if (last && last.refId === s.refId && last.to === s.layer) last.to = s.layer + 1
    else out.push({ from: s.layer + 1, to: s.layer + 1, refId: s.refId, uids: s.uids })
  }
  return out
}

// Vue isométrique vectorielle (faces dessus, avant, droite), dessinée de l'arrière vers l'avant
function drawIsometric(
  page: PdfPage,
  rgb: RgbFn,
  region: { x: number; top: number; w: number; h: number },
  boxes: Array<IsoBox & { color: RGB }>,
  pallet: { length: number; width: number; height: number; offset: number }
) {
  const C = Math.cos(Math.PI / 6)
  const S = Math.sin(Math.PI / 6)
  const proj = (x: number, y: number, z: number) => ({ u: (x - y) * C, v: z - (x + y) * S })
  const deck = { x: pallet.offset, y: pallet.offset, z: -pallet.height, l: pallet.length, w: pallet.width, h: pallet.height, color: [0.71, 0.54, 0.35] as RGB }
  const all = [deck, ...isoOrder(boxes)]

  let uMin = Infinity, uMax = -Infinity, vMin = Infinity, vMax = -Infinity
  for (const b of all) {
    for (const x of [b.x, b.x + b.l]) for (const y of [b.y, b.y + b.w]) for (const z of [b.z, b.z + b.h]) {
      const p = proj(x, y, z)
      uMin = Math.min(uMin, p.u); uMax = Math.max(uMax, p.u)
      vMin = Math.min(vMin, p.v); vMax = Math.max(vMax, p.v)
    }
  }
  const scale = Math.min(region.w / (uMax - uMin), region.h / (vMax - vMin))
  const offX = (region.w - (uMax - uMin) * scale) / 2
  const offY = (region.h - (vMax - vMin) * scale) / 2
  // Coordonnées SVG (y vers le bas) depuis le coin haut gauche de la région
  const pt = (x: number, y: number, z: number) => {
    const p = proj(x, y, z)
    return `${((p.u - uMin) * scale + offX).toFixed(2)} ${((vMax - p.v) * scale + offY).toFixed(2)}`
  }
  const face = (pts: number[][], color: RGB, k: number) =>
    page.drawSvgPath(`M ${pts.map(q => pt(q[0], q[1], q[2])).join(' L ')} Z`, {
      x: region.x,
      y: region.top,
      color: rgb(color[0] * k, color[1] * k, color[2] * k),
      borderColor: rgb(0.25, 0.2, 0.15),
      borderWidth: 0.3,
    })

  for (const b of all) {
    const x0 = b.x, x1 = b.x + b.l, y0 = b.y, y1 = b.y + b.w, z0 = b.z, z1 = b.z + b.h
    face([[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]], b.color, 1)
    face([[x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]], b.color, 0.8)
    face([[x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [x1, y0, z1]], b.color, 0.65)
  }
}

/** Synthèse de la commande, puis une page (ou plus) par palette : vue 3D, plans de couche, étapes. */
export async function generateOrderPDF(o: OrderPdfOptions): Promise<Blob> {
  const { PDFDocument, rgb, StandardFonts } = await import('pdf-lib')
  const pdf = await PDFDocument.create()
  const font = await pdf.embedFont(StandardFonts.Helvetica)
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold)
  const ink = rgb(0.12, 0.12, 0.14)
  const muted = rgb(0.45, 0.45, 0.5)
  const rule = rgb(0.85, 0.85, 0.88)
  const alert = rgb(0.75, 0.25, 0.1)
  const width = PAGE[0]
  const names = new Map(o.refs.map(r => [r.id, r.name]))
  const r = o.result

  let page = pdf.addPage(PAGE)
  let y = PAGE[1] - MARGIN
  const text = (s: string, x: number, yy: number, size = 9, f = font, color = ink) =>
    page.drawText(sanitizeForPDF(s), { x, y: yy, size, font: f, color })
  const fit = (s: string, size: number, maxWidth: number, f = font) => {
    const full = sanitizeForPDF(s)
    let t = full
    while (t.length > 3 && f.widthOfTextAtSize(t, size) > maxWidth) t = t.slice(0, -2)
    return t === full ? t : `${t}...`
  }
  const ensure = (space: number, header?: string) => {
    if (y - space >= 60) return
    page = pdf.addPage(PAGE)
    y = PAGE[1] - MARGIN
    if (header) {
      text(header, MARGIN, y - 12, 11, bold)
      y -= 28
    }
  }
  const heading = (s: string) => {
    ensure(40)
    text(s, MARGIN, y, 12, bold)
    y -= 6
    page.drawLine({ start: { x: MARGIN, y }, end: { x: width - MARGIN, y }, thickness: 0.6, color: rule })
    y -= 14
  }

  // Synthèse
  text('Plan de palettisation mixte', MARGIN, y - 16, 18, bold)
  text(`Généré le ${new Date().toLocaleDateString('fr-FR')} - mts-toolbox.com`, MARGIN, y - 32, 8, font, muted)
  y -= 50
  const rejected = r.rejected.reduce((sum, x) => sum + x.count, 0)
  const kpis: [string, string][] = [
    ['Palettes', fmt(r.pallets.length)],
    ['Colis placés', `${fmt(r.placedBoxes)} / ${fmt(r.totalBoxes)}`],
    ['Poids total', `${fmt(r.totalWeight)} kg`],
    ['Non palettisés', fmt(rejected)],
  ]
  const kw = (width - 2 * MARGIN) / kpis.length
  kpis.forEach(([label, value], i) => {
    const x = MARGIN + i * kw
    page.drawRectangle({ x: x + 2, y: y - 44, width: kw - 4, height: 44, color: rgb(0.96, 0.95, 0.92), borderColor: rule, borderWidth: 0.6 })
    text(value, x + 8, y - 22, 14, bold)
    text(label, x + 8, y - 36, 7.5, font, muted)
  })
  y -= 64
  const s = o.settings
  text(
    fit(`Palette : ${o.palletName} - ${fmt(s.pallet.length)} x ${fmt(s.pallet.width)} mm ; hauteur max ${fmt(s.maxHeight)} mm ; charge max ${s.maxLoad > 0 ? `${fmt(s.maxLoad)} kg` : 'non limitée'} ; débord ${fmt(s.overhang)} mm/côté`, 8.5, width - 2 * MARGIN),
    MARGIN, y, 8.5, font, muted
  )
  y -= 22

  heading('Références')
  const rc = [MARGIN, MARGIN + 150, MARGIN + 270, MARGIN + 310, MARGIN + 360]
  ;['Référence', 'Dimensions (mm)', 'Qté', 'Poids', 'Contraintes'].forEach((h, i) => text(h, rc[i], y, 8, bold, muted))
  y -= 13
  for (const ref of o.refs) {
    ensure(14)
    const [cr, cg, cb] = o.colorOf(ref.id)
    page.drawRectangle({ x: rc[0], y: y - 1, width: 7, height: 7, color: rgb(cr, cg, cb) })
    text(fit(ref.name, 9, 135), rc[0] + 11, y, 9)
    text(`${fmt(ref.length)} x ${fmt(ref.width)} x ${fmt(ref.height)}`, rc[1], y, 9)
    text(fmt(ref.quantity), rc[2], y, 9)
    text(ref.weight ? `${fmt(ref.weight, 1)} kg` : '-', rc[3], y, 9)
    const tags = [
      ref.upright ? 'sens imposé' : 'couchable',
      ref.fragile ? 'fragile' : '',
      ref.maxLoadOnTop !== null ? `max ${fmt(ref.maxLoadOnTop)} kg dessus` : '',
      ref.keepTogether ? 'ensemble' : '',
      ref.stop > 1 ? `client ${ref.stop}` : '',
    ].filter(Boolean).join(', ')
    text(fit(tags, 8, width - MARGIN - rc[4]), rc[4], y, 8, font, muted)
    y -= 13
  }
  y -= 8

  if (r.rejected.length > 0) {
    heading('Colis non palettisables')
    for (const rej of r.rejected) {
      ensure(14)
      text(`${names.get(rej.refId) ?? rej.refId} : ${rej.count} colis (${REJECT_LABELS[rej.reason]})`, MARGIN, y, 9, font, alert)
      y -= 13
    }
    y -= 8
  }

  heading('Palettes')
  const pc = [MARGIN, MARGIN + 70, MARGIN + 130, MARGIN + 210, MARGIN + 290, MARGIN + 370]
  ;['Palette', 'Colis', 'Poids brut', 'Hauteur', 'Remplissage', 'Clients'].forEach((h, i) => text(h, pc[i], y, 8, bold, muted))
  y -= 13
  for (const p of r.pallets) {
    ensure(14)
    text(`Palette ${p.index + 1}`, pc[0], y, 9, bold)
    text(fmt(p.placements.length), pc[1], y, 9)
    text(`${fmt(p.grossWeight)} kg`, pc[2], y, 9)
    text(`${fmt(p.totalHeight)} mm`, pc[3], y, 9)
    text(`${fmt(p.volumeUsage, 1)} %`, pc[4], y, 9)
    text(`${p.stops.join(', ')}${p.cogWarning ? '  (centre de gravité décentré)' : ''}`, pc[5], y, 9, font, p.cogWarning ? alert : ink)
    y -= 13
  }
  y -= 8

  if (o.vehicles.length > 0) {
    heading('Véhicules')
    const vc = [MARGIN, MARGIN + 170, MARGIN + 250, MARGIN + 340]
    ;['Véhicule', 'Places au sol', 'Emplacements', 'Véhicules nécessaires'].forEach((h, i) => text(h, vc[i], y, 8, bold, muted))
    y -= 13
    for (const v of o.vehicles) {
      ensure(14)
      text(v.vehicle.name, vc[0], y, 9)
      text(fmt(v.floorCapacity), vc[1], y, 9)
      text(fmt(v.positions), vc[2], y, 9)
      text(v.vehiclesNeeded === null ? '-' : fmt(v.vehiclesNeeded), vc[3], y, 9, bold)
      if (v.tooTall > 0) text(`${v.tooTall} palette(s) trop haute(s)`, vc[3] + 40, y, 8, font, alert)
      y -= 13
    }
  }

  // Une page par palette
  const offset = Math.max(0, s.overhang)
  const zone = { length: s.pallet.length + 2 * offset, width: s.pallet.width + 2 * offset, offset }
  for (const p of r.pallets) {
    page = pdf.addPage(PAGE)
    y = PAGE[1] - MARGIN
    const title = `Palette ${p.index + 1} / ${r.pallets.length}`
    text(title, MARGIN, y - 14, 16, bold)
    const clients = p.stops.length > 1 || p.stops[0] > 1 ? ` - client(s) ${p.stops.join(', ')}` : ''
    text(`${fmt(p.placements.length)} colis - ${fmt(p.grossWeight)} kg brut - ${fmt(p.totalHeight)} mm - remplissage ${fmt(p.volumeUsage, 1)} %${clients}`, MARGIN, y - 30, 9, font, muted)
    y -= 46

    page.drawRectangle({ x: MARGIN, y: y - 300, width: 300, height: 300, color: rgb(0.95, 0.96, 0.98) })
    drawIsometric(
      page,
      rgb,
      { x: MARGIN + 10, top: y - 10, w: 280, h: 280 },
      p.placements.map(pl => ({ x: pl.x, y: pl.y, z: pl.z, l: pl.l, w: pl.w, h: pl.h, color: o.colorOf(pl.refId) })),
      { ...s.pallet, offset }
    )

    const groups = layerGroups(p)
    const thumbX = MARGIN + 316
    const thumbW = width - MARGIN - thumbX
    groups.slice(0, 2).forEach((g, i) => {
      const top = y - i * 150
      const set = new Set(g.uids)
      const rects = p.placements.filter(pl => set.has(pl.uid)).map(pl => ({ x: pl.x, y: pl.y, l: pl.l, w: pl.w }))
      const label = g.from === g.to ? `Couche ${g.from}` : `Couches ${g.from} à ${g.to}`
      text(fit(`${label} : ${rects.length} x ${names.get(g.refId) ?? ''}`, 8, thumbW, bold), thumbX, top - 8, 8, bold)
      drawPlan(page, rgb, font, { x: thumbX, y: top - 140, w: thumbW, h: 126, zone, rects, pallet: s.pallet, footA: rects[0].l, footB: rects[0].w })
    })
    if (groups.length > 2) text(`+ ${groups.length - 2} autre(s) plan(s) de couche : voir l'outil en ligne`, thumbX, y - 306, 7.5, font, muted)
    y -= 320

    text('Étapes de montage', MARGIN, y, 12, bold)
    y -= 16
    for (const st of p.steps) {
      ensure(12, `${title} (suite)`)
      const [cr, cg, cb] = o.colorOf(st.refId)
      text(String(st.number), MARGIN, y, 8, font, muted)
      page.drawRectangle({ x: MARGIN + 22, y: y - 1, width: 6, height: 6, color: rgb(cr, cg, cb) })
      const f = st.kind === 'layer' ? bold : font
      text(fit(st.label, 8.5, width - 2 * MARGIN - 34, f), MARGIN + 34, y, 8.5, f)
      y -= 11.5
    }
  }

  const pages = pdf.getPages()
  pages.forEach((pg, i) => {
    pg.drawText(sanitizeForPDF(`Estimation indicative : vérifiez la stabilité, le cerclage et les règles de votre transporteur. Page ${i + 1}/${pages.length}`), {
      x: MARGIN, y: 30, size: 7.5, font, color: muted,
    })
  })
  const url = o.shareUrl.length > 110 ? `${o.shareUrl.slice(0, 107)}...` : o.shareUrl
  pages[0].drawText(sanitizeForPDF(`Recalculer en ligne : ${url}`), { x: MARGIN, y: 42, size: 7.5, font, color: muted })

  const bytes = await pdf.save()
  return new Blob([new Uint8Array(bytes)], { type: 'application/pdf' })
}
```

- [ ] **Step 5: Vérifier**

Run: `npx vitest run tests/palette-mixte/pdf.test.ts && npm test`
Expected: `Tests  1 passed` puis toute la suite verte.

- [ ] **Step 6: Commit**

```bash
git add lib/pdf/draw-plan.ts lib/palette/pdf.ts lib/palette-mixte/pdf.ts tests/palette-mixte/pdf.test.ts
git commit -m "Feat(palette-mixte): PDF multi-palettes avec vue isométrique et étapes" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01RVeUVHqWyQ8YRzVwvntfRT"
```

---

### Task 14: Composants partagés et vue 3D générique

**Files:**
- Create: `components/tools/palette/fields.tsx`
- Create: `components/tools/palette/PalletSettingsFields.tsx`
- Create: `components/tools/palette/CrossLink.tsx`
- Create: `components/tools/palette/BoxScene3D.tsx`
- Modify: `components/tools/palette/PalletScene3D.tsx` (remplacement complet)
- Modify: `components/tools/VisualiseurPalette.tsx`

Pas de test unitaire (composants React) : vérification par `tsc`, build et navigateur à la Task 18. L'outil actuel doit se comporter exactement comme avant.

- [ ] **Step 1: Extraire les champs**

Create `components/tools/palette/fields.tsx` en y déplaçant **sans changement** les fonctions `NumberField` et `Toggle` de `components/tools/VisualiseurPalette.tsx`, précédées de `'use client'` et préfixées par `export` :

```tsx
'use client'

export function NumberField({
  label, value, onChange, unit, hint, min = 0, step = 1,
}: {
  label: string; value: string; onChange: (v: string) => void; unit: string; hint?: string; min?: number; step?: number
}) {
  // corps identique à celui de VisualiseurPalette.tsx
}

export function Toggle({ checked, onChange, label, hint }: { checked: boolean; onChange: (v: boolean) => void; label: string; hint?: string }) {
  // corps identique à celui de VisualiseurPalette.tsx
}
```

(Les commentaires « corps identique » désignent le code existant à copier tel quel, qui est déjà dans le dépôt.)

- [ ] **Step 2: Carte « Palette » partagée**

Create `components/tools/palette/PalletSettingsFields.tsx` :

```tsx
'use client'

import { Layers } from 'lucide-react'
import { CUSTOM_PALLET_ID, PALLET_PRESETS } from '@/lib/palette/presets'
import { NumberField } from './fields'

export interface PalletFieldsValue {
  palletId: string
  palletLength: string
  palletWidth: string
  palletHeight: string
  palletTare: string
  maxHeight: string
  maxLoad: string
  overhang: string
}

export default function PalletSettingsFields({
  value, onChange, className,
}: {
  value: PalletFieldsValue
  onChange: (patch: Partial<PalletFieldsValue>) => void
  className: string
}) {
  const selectPallet = (id: string) => {
    const preset = PALLET_PRESETS.find(p => p.id === id)
    onChange({
      palletId: id,
      ...(preset && {
        palletLength: String(preset.length),
        palletWidth: String(preset.width),
        palletHeight: String(preset.height),
        palletTare: String(preset.tare),
      }),
    })
  }
  const isCustom = value.palletId === CUSTOM_PALLET_ID

  return (
    <section className={className}>
      <h2 className="text-sm font-semibold mb-3 flex items-center gap-2 text-gray-900 dark:text-gray-100">
        <Layers size={16} className="text-primary-500" /> Palette
      </h2>
      <label className="block mb-3">
        <span className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Type</span>
        <select
          value={value.palletId}
          onChange={e => selectPallet(e.target.value)}
          className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          {PALLET_PRESETS.map(p => (
            <option key={p.id} value={p.id}>{p.name} — {p.length} × {p.width}</option>
          ))}
          <option value={CUSTOM_PALLET_ID}>Personnalisée…</option>
        </select>
      </label>
      {isCustom && (
        <div className="grid grid-cols-2 gap-3 mb-3">
          <NumberField label="Longueur" unit="mm" value={value.palletLength} onChange={v => onChange({ palletLength: v })} />
          <NumberField label="Largeur" unit="mm" value={value.palletWidth} onChange={v => onChange({ palletWidth: v })} />
          <NumberField label="Hauteur" unit="mm" value={value.palletHeight} onChange={v => onChange({ palletHeight: v })} />
          <NumberField label="Tare" unit="kg" value={value.palletTare} onChange={v => onChange({ palletTare: v })} />
        </div>
      )}
      <div className="grid grid-cols-2 gap-3">
        <NumberField label="Hauteur max" unit="mm" value={value.maxHeight} onChange={v => onChange({ maxHeight: v })} hint="palette comprise" />
        <NumberField label="Charge max" unit="kg" value={value.maxLoad} onChange={v => onChange({ maxLoad: v })} hint="0 = sans limite" />
        <NumberField label="Débord" unit="mm" value={value.overhang} onChange={v => onChange({ overhang: v })} hint="par côté" />
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Bandeau croisé**

Create `components/tools/palette/CrossLink.tsx` :

```tsx
import Link from 'next/link'

export default function CrossLink({ href, question, action }: { href: string; question: string; action: string }) {
  return (
    <Link
      href={href}
      className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-primary-200 dark:border-primary-800 bg-primary-50 dark:bg-primary-900/20 px-4 py-3 text-sm hover:border-primary-400 transition-colors"
    >
      <span className="text-gray-700 dark:text-gray-300">{question}</span>
      <span className="font-medium text-primary-700 dark:text-primary-300">{action} →</span>
    </Link>
  )
}
```

- [ ] **Step 4: Vue 3D générique**

Create `components/tools/palette/BoxScene3D.tsx`. Elle reprend à l'identique de `PalletScene3D.tsx` : les imports three.js, `MM`, `WOOD`, `WOOD_DARK`, `buildPallet`, `disposeObject`, et l'effet de mise en place de la scène (renderer, lumières, sol, `OrbitControls`, `fit`, `ResizeObserver`, `onReady`, nettoyage) avec le champ `fittedKey`. Seuls changent les props et l'effet de construction du contenu :

```tsx
'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import type { PalletSpec } from '@/lib/palette/packing'

export interface SceneApi {
  /** Capture PNG de la vue courante (pour le PDF) */
  snapshot: () => string | null
  resetView: () => void
}

/** Colis positionné dans la zone utile (mm), z depuis le dessus du plancher */
export interface SceneBox {
  x: number
  y: number
  z: number
  l: number
  w: number
  h: number
  color: string
  highlight?: boolean
}

interface BoxScene3DProps {
  boxes: SceneBox[]
  pallet: PalletSpec
  zoneOffset: number
  /** Change quand la caméra doit être recadrée (nouvelle palette, nouvelles dimensions) */
  geometryKey: string
  onReady?: (api: SceneApi) => void
}

// … MM, WOOD, WOOD_DARK, buildPallet, disposeObject : copiés de PalletScene3D.tsx …

export default function BoxScene3D({ boxes, pallet, zoneOffset, geometryKey, onReady }: BoxScene3DProps) {
  // … containerRef, ctx et effet de mise en place : copiés de PalletScene3D.tsx …

  useEffect(() => {
    const c = ctx.current
    if (!c) return
    if (c.content) {
      c.scene.remove(c.content)
      disposeObject(c.content)
    }

    const content = new THREE.Group()
    content.add(buildPallet(pallet))

    const gap = 1.5 // mm de jeu visuel entre colis, pour lire les arêtes
    const groups = [boxes.filter(b => !b.highlight), boxes.filter(b => b.highlight)]
    const materials = [
      new THREE.MeshStandardMaterial({ roughness: 0.85, metalness: 0 }),
      new THREE.MeshStandardMaterial({ roughness: 0.6, metalness: 0, emissive: new THREE.Color('#f59e0b'), emissiveIntensity: 0.35 }),
    ]
    const edgePositions = new Float32Array(boxes.length * 24 * 3)
    let e = 0
    const m = new THREE.Matrix4()
    const q = new THREE.Quaternion()
    const pos = new THREE.Vector3()
    const scl = new THREE.Vector3()
    const color = new THREE.Color()

    groups.forEach((list, gi) => {
      if (list.length === 0) {
        materials[gi].dispose()
        return
      }
      const mesh = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), materials[gi], list.length)
      mesh.castShadow = true
      mesh.receiveShadow = true
      list.forEach((b, idx) => {
        const x0 = (b.x - zoneOffset + gap / 2) * MM, x1 = (b.x - zoneOffset + b.l - gap / 2) * MM
        const z0 = (b.y - zoneOffset + gap / 2) * MM, z1 = (b.y - zoneOffset + b.w - gap / 2) * MM
        const y0 = (pallet.height + b.z) * MM, y1 = (pallet.height + b.z + b.h - gap) * MM
        m.compose(pos.set((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2), q, scl.set(x1 - x0, y1 - y0, z1 - z0))
        mesh.setMatrixAt(idx, m)
        mesh.setColorAt(idx, color.set(b.color))

        // 12 arêtes
        const corners = [
          [x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1],
          [x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1],
        ]
        const pairs = [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]]
        for (const [a, bb] of pairs) {
          edgePositions.set(corners[a], e); e += 3
          edgePositions.set(corners[bb], e); e += 3
        }
      })
      mesh.instanceMatrix.needsUpdate = true
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
      content.add(mesh)
    })

    if (e > 0) {
      const edges = new THREE.BufferGeometry()
      edges.setAttribute('position', new THREE.BufferAttribute(edgePositions, 3))
      content.add(new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x5c4326, transparent: true, opacity: 0.55 })))
    }

    // Centrer la palette sur l'origine
    content.position.set((-pallet.length / 2) * MM, 0, (-pallet.width / 2) * MM)
    c.scene.add(content)
    c.content = content

    // Recadrer quand la géométrie change ou que la scène est neuve, pas en feuilletant les étapes
    if (c.fittedKey !== geometryKey) {
      c.fittedKey = geometryKey
      c.fit()
    } else {
      c.render()
    }
  }, [boxes, pallet, zoneOffset, geometryKey])

  return <div ref={containerRef} className="absolute inset-0" />
}
```

- [ ] **Step 5: `PalletScene3D` devient un adaptateur**

Replace `components/tools/palette/PalletScene3D.tsx` entièrement par :

```tsx
'use client'

import { useMemo } from 'react'
import type { PalletizationResult, PalletSpec } from '@/lib/palette/packing'
import BoxScene3D, { type SceneApi, type SceneBox } from './BoxScene3D'

export type { SceneApi } from './BoxScene3D'

const KRAFT = '#c9a26b'
const KRAFT_ALT = '#b88d55'
const KRAFT_PARTIAL = '#d9b98a'

interface PalletScene3DProps {
  result: PalletizationResult
  pallet: PalletSpec
  visibleLayers: number
  onReady?: (api: SceneApi) => void
}

// Colis identiques : couches alternées, dernière couche incomplète plus claire
export default function PalletScene3D({ result, pallet, visibleLayers, onReady }: PalletScene3DProps) {
  const boxes = useMemo<SceneBox[]>(() => {
    const out: SceneBox[] = []
    const { rects } = result.layer
    const h = result.orientation.height
    const layersTotal = result.fullLayers + (result.lastLayerCount > 0 ? 1 : 0)
    const shown = Math.min(visibleLayers, layersTotal)
    for (let layer = 0; layer < shown; layer++) {
      const partial = layer >= result.fullLayers
      const n = partial ? result.lastLayerCount : rects.length
      for (let i = 0; i < n; i++) {
        const r = rects[i]
        out.push({ x: r.x, y: r.y, z: layer * h, l: r.l, w: r.w, h, color: partial ? KRAFT_PARTIAL : layer % 2 ? KRAFT_ALT : KRAFT })
      }
    }
    return out
  }, [result, visibleLayers])

  const geometryKey = JSON.stringify([result.layer.count, result.orientation, result.fullLayers, result.lastLayerCount, result.zone, pallet])
  return <BoxScene3D boxes={boxes} pallet={pallet} zoneOffset={result.zone.offset} geometryKey={geometryKey} onReady={onReady} />
}
```

- [ ] **Step 6: `VisualiseurPalette` utilise les composants extraits**

Dans `components/tools/VisualiseurPalette.tsx` :

1. Remplacer la ligne d'icônes par :
```tsx
import { Box, Truck, Download, Link2, RotateCcw, Check, Scale, Ruler } from 'lucide-react'
```
2. Remplacer `import { PALLET_PRESETS, CUSTOM_PALLET_ID, VEHICLE_PRESETS } from '@/lib/palette/presets'` par `import { PALLET_PRESETS, VEHICLE_PRESETS } from '@/lib/palette/presets'`.
3. Ajouter après `import LayerPlan from './palette/LayerPlan'` :
```tsx
import { NumberField, Toggle } from './palette/fields'
import PalletSettingsFields from './palette/PalletSettingsFields'
import CrossLink from './palette/CrossLink'
```
4. Supprimer les définitions locales `function NumberField(…) {…}` et `function Toggle(…) {…}`.
5. Supprimer la fonction `selectPallet` et la ligne `const isCustom = form.palletId === CUSTOM_PALLET_ID`.
6. Remplacer toute la section qui commence par `<section className={card}>` et contient `<Layers size={16} className="text-primary-500" /> Palette` (jusqu'à son `</section>`) par :
```tsx
          <PalletSettingsFields className={card} value={form} onChange={patch => setForm(prev => ({ ...prev, ...patch }))} />
```
7. Juste après `<div className="space-y-6">` (premier élément du rendu), ajouter :
```tsx
      <CrossLink href="/logistique/palettisation-mixte" question="Vos colis ont des tailles différentes ?" action="Palettisation mixte" />
```

- [ ] **Step 7: Vérifier**

Run: `npx tsc --noEmit 2>&1 | grep -v "^\.next/"` puis `npm test`
Expected: aucune erreur de type ; suite verte.

- [ ] **Step 8: Commit**

```bash
git add components/tools/palette components/tools/VisualiseurPalette.tsx
git commit -m "Refactor(palette): vue 3D générique, champs et carte palette partagés, lien vers la palettisation mixte" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01RVeUVHqWyQ8YRzVwvntfRT"
```

---

### Task 15: Worker et calcul en arrière-plan

**Files:**
- Create: `lib/palette-mixte/worker.ts`
- Create: `components/tools/palette-mixte/usePalletization.ts`

- [ ] **Step 1: Worker**

Create `lib/palette-mixte/worker.ts` :

```ts
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
```

- [ ] **Step 2: Hook**

Create `components/tools/palette-mixte/usePalletization.ts` :

```ts
'use client'

import { useEffect, useRef, useState } from 'react'
import { palletizeOrder } from '@/lib/palette-mixte/engine'
import type { MixedResult, OrderSettings, Reference } from '@/lib/palette-mixte/types'

/**
 * Recalcule 300 ms après la dernière modification, dans un Web Worker (repli sur le fil
 * principal si le navigateur le refuse). Les réponses périmées sont ignorées.
 */
export function usePalletization(refs: Reference[] | null, settings: OrderSettings) {
  const [state, setState] = useState<{ result: MixedResult | null; computing: boolean }>({ result: null, computing: false })
  const workerRef = useRef<Worker | null>(null)
  const requestId = useRef(0)

  useEffect(() => {
    let worker: Worker | null = null
    try {
      worker = new Worker(new URL('../../../lib/palette-mixte/worker.ts', import.meta.url))
      worker.onmessage = (e: MessageEvent<{ id: number; result: MixedResult }>) => {
        if (e.data.id === requestId.current) setState({ result: e.data.result, computing: false })
      }
    } catch {
      worker = null
    }
    workerRef.current = worker
    return () => worker?.terminate()
  }, [])

  const key = JSON.stringify([refs, settings])
  useEffect(() => {
    if (!refs) return
    const id = ++requestId.current
    setState(s => ({ ...s, computing: true }))
    const timer = setTimeout(() => {
      const worker = workerRef.current
      if (worker) {
        worker.postMessage({ id, refs, settings })
      } else {
        const result = palletizeOrder(refs, settings)
        if (id === requestId.current) setState({ result, computing: false })
      }
    }, 300)
    return () => clearTimeout(timer)
    // key résume refs et settings
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  return state
}
```

- [ ] **Step 3: Vérifier**

Run: `npx tsc --noEmit 2>&1 | grep -v "^\.next/"`
Expected: aucune sortie.

- [ ] **Step 4: Commit**

```bash
git add lib/palette-mixte/worker.ts components/tools/palette-mixte/usePalletization.ts
git commit -m "Feat(palette-mixte): calcul dans un Web Worker avec anti-rebond" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01RVeUVHqWyQ8YRzVwvntfRT"
```

---

### Task 16: Composants de saisie et d'étapes

**Files:**
- Create: `components/tools/palette-mixte/ReferenceCard.tsx`
- Create: `components/tools/palette-mixte/PasteImport.tsx`
- Create: `components/tools/palette-mixte/StepPlayer.tsx`
- Create: `components/tools/palette-mixte/StepList.tsx`

- [ ] **Step 1: Carte de référence**

Create `components/tools/palette-mixte/ReferenceCard.tsx` :

```tsx
'use client'

import { ChevronDown, Copy, Trash2 } from 'lucide-react'
import { NumberField, Toggle } from '../palette/fields'
import type { RefForm } from '@/lib/palette-mixte/form'

interface ReferenceCardProps {
  value: RefForm
  color: string
  onChange: (patch: Partial<RefForm>) => void
  onDuplicate: () => void
  onRemove: () => void
  canDuplicate: boolean
}

export default function ReferenceCard({ value, color, onChange, onDuplicate, onRemove, canDuplicate }: ReferenceCardProps) {
  // Options avancées ouvertes d'office si l'une d'elles est renseignée
  const advancedSet = value.maxLoadOnTop !== '' || value.keepTogether || (value.stop !== '' && value.stop !== '1')

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/60 p-3">
      <div className="flex items-center gap-2 mb-3">
        <span className="h-3 w-3 rounded-sm shrink-0" style={{ background: color }} aria-hidden="true" />
        <input
          value={value.name}
          onChange={e => onChange({ name: e.target.value.slice(0, 40) })}
          aria-label="Nom du colis"
          className="flex-1 min-w-0 bg-transparent font-medium text-sm text-gray-900 dark:text-gray-100 border-b border-transparent focus:border-primary-500 focus:outline-none"
        />
        <button
          type="button"
          onClick={onDuplicate}
          disabled={!canDuplicate}
          title="Dupliquer"
          aria-label={`Dupliquer ${value.name}`}
          className="p-1.5 rounded text-gray-500 hover:text-primary-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40"
        >
          <Copy size={15} />
        </button>
        <button
          type="button"
          onClick={onRemove}
          title="Supprimer"
          aria-label={`Supprimer ${value.name}`}
          className="p-1.5 rounded text-gray-500 hover:text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <Trash2 size={15} />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <NumberField label="Longueur" unit="mm" value={value.length} onChange={v => onChange({ length: v })} />
        <NumberField label="Largeur" unit="mm" value={value.width} onChange={v => onChange({ width: v })} />
        <NumberField label="Hauteur" unit="mm" value={value.height} onChange={v => onChange({ height: v })} />
        <NumberField label="Quantité" unit="u." min={1} value={value.quantity} onChange={v => onChange({ quantity: v })} />
        <NumberField label="Poids" unit="kg" step={0.1} value={value.weight} onChange={v => onChange({ weight: v })} hint="facultatif" />
      </div>

      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
        <Toggle checked={value.upright} onChange={v => onChange({ upright: v })} label="Ce côté vers le haut" />
        <Toggle checked={value.fragile} onChange={v => onChange({ fragile: v })} label="Fragile, rien dessus" />
      </div>

      <details className="mt-3 group" open={advancedSet}>
        <summary className="cursor-pointer select-none list-none text-xs font-medium text-primary-600 dark:text-primary-400 flex items-center gap-1">
          <ChevronDown size={14} className="transition-transform group-open:rotate-180" /> Options avancées
        </summary>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <NumberField label="Charge max dessus" unit="kg" value={value.maxLoadOnTop} onChange={v => onChange({ maxLoadOnTop: v })} hint="vide = sans limite" />
          <NumberField label="Client / arrêt" unit="n°" min={1} value={value.stop} onChange={v => onChange({ stop: v })} hint="1 = livré en premier" />
          <div className="col-span-2">
            <Toggle
              checked={value.keepTogether}
              onChange={v => onChange({ keepTogether: v })}
              label="Garder ensemble"
              hint="Ne pas répartir sur plusieurs palettes si elle tient sur une seule"
            />
          </div>
        </div>
      </details>
    </div>
  )
}
```

- [ ] **Step 2: Collage Excel**

Create `components/tools/palette-mixte/PasteImport.tsx` :

```tsx
'use client'

import { useState } from 'react'
import { parsePastedReferences, type PastedRow } from '@/lib/palette-mixte/paste'

export default function PasteImport({ onImport, onClose, room }: { onImport: (rows: PastedRow[]) => void; onClose: () => void; room: number }) {
  const [text, setText] = useState('')
  const [errors, setErrors] = useState<{ line: number; message: string }[]>([])

  const run = () => {
    const res = parsePastedReferences(text)
    setErrors(res.errors)
    if (res.rows.length > 0) {
      onImport(res.rows)
      if (res.errors.length === 0) {
        setText('')
        onClose()
      }
    }
  }

  return (
    <div className="rounded-xl border border-primary-200 dark:border-primary-800 bg-primary-50/60 dark:bg-primary-900/10 p-3 space-y-2">
      <label htmlFor="paste-refs" className="block text-xs font-medium text-gray-700 dark:text-gray-300">
        Collez vos lignes depuis Excel : nom, longueur, largeur, hauteur (mm), quantité, poids (kg)
      </label>
      <textarea
        id="paste-refs"
        rows={5}
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder={'Carton A\t600\t400\t400\t12\t15\nCarton B\t400\t300\t250\t20\t6'}
        className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 p-2 font-mono text-xs text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
      />
      {errors.length > 0 && (
        <ul className="text-xs text-red-600 dark:text-red-400 space-y-0.5">
          {errors.slice(0, 5).map(e => (
            <li key={e.line}>Ligne {e.line} : {e.message}</li>
          ))}
          {errors.length > 5 && <li>… et {errors.length - 5} autre(s)</li>}
        </ul>
      )}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-[11px] text-gray-500">{room} référence(s) peuvent encore être ajoutées</span>
        <div className="flex gap-2">
          <button type="button" onClick={onClose} className="h-8 px-3 rounded-md text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">
            Annuler
          </button>
          <button
            type="button"
            onClick={run}
            disabled={!text.trim() || room === 0}
            className="h-8 px-3 rounded-md text-sm bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50"
          >
            Ajouter
          </button>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Lecteur d'étapes**

Create `components/tools/palette-mixte/StepPlayer.tsx` :

```tsx
'use client'

import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react'

interface StepPlayerProps {
  current: number
  total: number
  playing: boolean
  onChange: (n: number) => void
  onTogglePlay: () => void
}

export default function StepPlayer({ current, total, playing, onChange, onTogglePlay }: StepPlayerProps) {
  const btn = 'p-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40'
  return (
    <div className="flex items-center gap-2 px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-900/70">
      <button type="button" className={btn} onClick={() => onChange(Math.max(0, current - 1))} disabled={current <= 0} aria-label="Étape précédente">
        <ChevronLeft size={16} />
      </button>
      <button type="button" className={btn} onClick={onTogglePlay} disabled={total === 0} aria-label={playing ? 'Pause' : 'Lecture'}>
        {playing ? <Pause size={16} /> : <Play size={16} />}
      </button>
      <button type="button" className={btn} onClick={() => onChange(Math.min(total, current + 1))} disabled={current >= total} aria-label="Étape suivante">
        <ChevronRight size={16} />
      </button>
      <input
        type="range"
        min={0}
        max={total}
        value={current}
        onChange={e => onChange(Number(e.target.value))}
        className="flex-1 min-w-0 accent-primary-600"
        aria-label="Étape de montage"
      />
      <span className="text-xs tabular-nums w-16 text-right text-gray-700 dark:text-gray-300">{current}/{total}</span>
    </div>
  )
}
```

- [ ] **Step 4: Liste d'étapes**

Create `components/tools/palette-mixte/StepList.tsx` :

```tsx
'use client'

import { useEffect, useRef } from 'react'
import type { Step } from '@/lib/palette-mixte/types'

interface StepListProps {
  steps: Step[]
  current: number
  colors: Map<string, string>
  onSelect: (n: number) => void
}

export default function StepList({ steps, current, colors, onSelect }: StepListProps) {
  const listRef = useRef<HTMLOListElement>(null)
  const activeRef = useRef<HTMLButtonElement>(null)

  // Fait défiler la liste seule, jamais la page
  useEffect(() => {
    const list = listRef.current
    const el = activeRef.current
    if (!list || !el) return
    const top = el.offsetTop
    if (top < list.scrollTop || top + el.offsetHeight > list.scrollTop + list.clientHeight) {
      list.scrollTop = top - list.clientHeight / 2
    }
  }, [current])

  return (
    <ol ref={listRef} className="relative max-h-[420px] overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800 text-sm" aria-label="Étapes de montage">
      {steps.map(s => {
        const active = s.number === current
        const done = s.number < current
        return (
          <li key={s.number}>
            <button
              ref={active ? activeRef : undefined}
              type="button"
              onClick={() => onSelect(s.number)}
              aria-current={active ? 'step' : undefined}
              className={`w-full text-left flex items-start gap-2 px-3 py-2 ${active ? 'bg-amber-50 dark:bg-amber-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800/60'} ${done ? 'text-gray-500' : 'text-gray-800 dark:text-gray-200'}`}
            >
              <span className="tabular-nums text-xs w-6 shrink-0 pt-0.5 text-gray-400">{s.number}</span>
              <span className="mt-1.5 h-2.5 w-2.5 rounded-sm shrink-0" style={{ background: colors.get(s.refId) }} aria-hidden="true" />
              <span className={s.kind === 'layer' ? 'font-medium' : ''}>{s.label}</span>
            </button>
          </li>
        )
      })}
    </ol>
  )
}
```

- [ ] **Step 5: Vérifier**

Run: `npx tsc --noEmit 2>&1 | grep -v "^\.next/"`
Expected: aucune sortie.

- [ ] **Step 6: Commit**

```bash
git add components/tools/palette-mixte
git commit -m "Feat(palette-mixte): cartes de référence, collage Excel, lecteur et liste d'étapes" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01RVeUVHqWyQ8YRzVwvntfRT"
```

---

### Task 17: Page outil, enregistrement et SEO

**Files:**
- Create: `components/tools/PalettisationMixte.tsx`
- Modify: `lib/tools-config.ts` (nouvelle entrée après `visualiseur-palette`)
- Modify: `app/(site)/[category]/[tool]/page.tsx` (table `toolComponents`)
- Modify: `lib/tool-seo-data.ts`
- Modify: `components/seo/ToolContent.tsx`

- [ ] **Step 1: Page outil**

Create `components/tools/PalettisationMixte.tsx` :

```tsx
'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { AlertTriangle, Boxes, Check, ClipboardPaste, Download, Link2, Loader2, Plus, RotateCcw, Truck } from 'lucide-react'
import CrossLink from './palette/CrossLink'
import PalletSettingsFields from './palette/PalletSettingsFields'
import LayerPlan from './palette/LayerPlan'
import { Toggle } from './palette/fields'
import type { SceneApi, SceneBox } from './palette/BoxScene3D'
import ReferenceCard from './palette-mixte/ReferenceCard'
import PasteImport from './palette-mixte/PasteImport'
import StepPlayer from './palette-mixte/StepPlayer'
import StepList from './palette-mixte/StepList'
import { usePalletization } from './palette-mixte/usePalletization'
import { defaultOrder, emptyRef, formToEngine, newRefId, type OrderForm, type RefForm } from '@/lib/palette-mixte/form'
import { decodeOrder, encodeOrder } from '@/lib/palette-mixte/url-state'
import { orderVehicleLoad } from '@/lib/palette-mixte/vehicles'
import { refColor, refColorRgb } from '@/lib/palette-mixte/colors'
import type { PastedRow } from '@/lib/palette-mixte/paste'
import { LIMITS, REJECT_LABELS } from '@/lib/palette-mixte/types'
import { PALLET_PRESETS, VEHICLE_PRESETS } from '@/lib/palette/presets'

const BoxScene3D = dynamic(() => import('./palette/BoxScene3D'), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center text-sm text-gray-500">Chargement de la vue 3D…</div>
  ),
})

const fmt = (n: number, d = 0) => n.toLocaleString('fr-FR', { minimumFractionDigits: d, maximumFractionDigits: d })

const trackEvent = (name: string) => {
  try {
    ;(window as Window & { gtag?: (...args: unknown[]) => void }).gtag?.('event', name, { tool: 'palettisation-mixte' })
  } catch {
    // mesure facultative
  }
}

export default function PalettisationMixte() {
  const [form, setForm] = useState<OrderForm>(defaultOrder)
  const [hydrated, setHydrated] = useState(false)
  const [palletIdx, setPalletIdx] = useState(0)
  const [step, setStep] = useState<number | null>(null) // null : toutes les étapes affichées
  const [playing, setPlaying] = useState(false)
  const [pasteOpen, setPasteOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [generating, setGenerating] = useState(false)
  const sceneApi = useRef<SceneApi | null>(null)

  // Commande partagée : #c=… dans l'adresse (le fragment n'est jamais envoyé au serveur)
  useEffect(() => {
    const match = window.location.hash.match(/^#c=(.+)$/)
    if (!match) {
      setHydrated(true)
      return
    }
    decodeOrder(match[1]).then(order => {
      if (order) setForm(order)
      setHydrated(true)
    })
  }, [])

  useEffect(() => {
    if (!hydrated) return
    let cancelled = false
    encodeOrder(form).then(code => {
      if (!cancelled) window.history.replaceState(window.history.state, '', `${window.location.pathname}${window.location.search}#c=${code}`)
    })
    return () => {
      cancelled = true
    }
  }, [form, hydrated])

  const engine = useMemo(() => formToEngine(form), [form])
  const { result, computing } = usePalletization(hydrated ? engine.refs : null, engine.settings)

  const pallets = useMemo(() => result?.pallets ?? [], [result])
  const current = pallets.length > 0 ? pallets[Math.min(palletIdx, pallets.length - 1)] : undefined
  const steps = useMemo(() => current?.steps ?? [], [current])
  const shown = step === null ? steps.length : Math.min(step, steps.length)
  const currentStep = shown > 0 ? steps[shown - 1] : undefined

  useEffect(() => {
    setStep(null)
    setPlaying(false)
  }, [result, palletIdx])

  useEffect(() => {
    if (palletIdx > 0 && palletIdx >= pallets.length) setPalletIdx(0)
  }, [pallets.length, palletIdx])

  // Lecture automatique : une étape toutes les 700 ms
  useEffect(() => {
    if (!playing) return
    const at = step ?? steps.length
    if (at >= steps.length) {
      setPlaying(false)
      return
    }
    const timer = setTimeout(() => setStep(at + 1), 700)
    return () => clearTimeout(timer)
  }, [playing, step, steps.length])

  const formIndex = useMemo(() => new Map(form.refs.map((r, i) => [r.id, i])), [form.refs])
  const colors = useMemo(() => new Map(form.refs.map((r, i) => [r.id, refColor(i)])), [form.refs])
  const names = useMemo(() => new Map(engine.refs.map(r => [r.id, r.name])), [engine.refs])
  const hasStops = engine.refs.some(r => r.stop > 1)

  const { pallet } = engine.settings
  const zoneOffset = Math.max(0, engine.settings.overhang)
  const zoneLength = pallet.length + 2 * zoneOffset
  const zoneWidth = pallet.width + 2 * zoneOffset

  const sceneBoxes = useMemo<SceneBox[]>(() => {
    if (!current) return []
    const byUid = new Map(current.placements.map(p => [p.uid, p]))
    const out: SceneBox[] = []
    steps.slice(0, shown).forEach((s, i) => {
      const highlight = step !== null && i === shown - 1
      for (const uid of s.kind === 'layer' ? s.uids : [s.uid]) {
        const p = byUid.get(uid)
        if (p) out.push({ x: p.x, y: p.y, z: p.z, l: p.l, w: p.w, h: p.h, color: colors.get(p.refId) ?? '#c9a26b', highlight })
      }
    })
    return out
  }, [current, steps, shown, step, colors])
  const geometryKey = `${palletIdx}|${current?.placements.length ?? 0}|${current?.totalHeight ?? 0}|${pallet.length}x${pallet.width}x${pallet.height}|${zoneOffset}`

  const layerRects = useMemo(() => {
    if (!current || currentStep?.kind !== 'layer') return null
    const set = new Set(currentStep.uids)
    return current.placements.filter(p => set.has(p.uid)).map(p => ({ x: p.x, y: p.y, l: p.l, w: p.w }))
  }, [current, currentStep])

  const vehicleLoads = useMemo(() => {
    if (pallets.length === 0) return []
    const footprint = zoneOffset > 0 ? { length: zoneLength, width: zoneWidth } : { length: pallet.length, width: pallet.width }
    return VEHICLE_PRESETS.map(v => orderVehicleLoad(v, footprint, pallets, form.stackable))
  }, [pallets, zoneOffset, zoneLength, zoneWidth, pallet.length, pallet.width, form.stackable])

  const full = form.refs.length >= LIMITS.maxReferences
  const updateRef = (id: string, patch: Partial<RefForm>) =>
    setForm(f => ({ ...f, refs: f.refs.map(r => (r.id === id ? { ...r, ...patch } : r)) }))
  const addRef = () =>
    setForm(f => (f.refs.length >= LIMITS.maxReferences ? f : { ...f, refs: [...f.refs, emptyRef(f.refs.length + 1)] }))
  const duplicateRef = (id: string) =>
    setForm(f => {
      if (f.refs.length >= LIMITS.maxReferences) return f
      const i = f.refs.findIndex(r => r.id === id)
      if (i < 0) return f
      const refs = [...f.refs]
      refs.splice(i + 1, 0, { ...f.refs[i], id: newRefId(), name: `${f.refs[i].name} (copie)`.slice(0, 40) })
      return { ...f, refs }
    })
  const removeRef = (id: string) => setForm(f => ({ ...f, refs: f.refs.filter(r => r.id !== id) }))
  const importRows = (rows: PastedRow[]) =>
    setForm(f => {
      const room = LIMITS.maxReferences - f.refs.length
      const added = rows.slice(0, room).map((row, k) => ({
        ...emptyRef(f.refs.length + k + 1),
        ...row,
        name: row.name || `Colis ${f.refs.length + k + 1}`,
      }))
      return { ...f, refs: [...f.refs, ...added] }
    })

  const togglePlay = () => {
    if (playing) {
      setPlaying(false)
      return
    }
    if (step === null || step >= steps.length) setStep(0)
    setPlaying(true)
  }
  const selectStep = (n: number) => {
    setPlaying(false)
    setStep(n)
  }

  const palletName = PALLET_PRESETS.find(p => p.id === form.palletId)?.name ?? 'Palette personnalisée'

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      trackEvent('palette_mixte_share')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // presse-papiers refusé : le lien reste dans la barre d'adresse
    }
  }

  const downloadPdf = async () => {
    if (!result || result.pallets.length === 0) return
    setGenerating(true)
    try {
      const { generateOrderPDF } = await import('@/lib/palette-mixte/pdf')
      const blob = await generateOrderPDF({
        refs: engine.refs,
        settings: engine.settings,
        palletName,
        result,
        vehicles: vehicleLoads,
        colorOf: refId => refColorRgb(formIndex.get(refId) ?? 0),
        shareUrl: window.location.href,
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'plan-palettisation-mixte.pdf'
      a.click()
      URL.revokeObjectURL(url)
      trackEvent('palette_mixte_pdf')
    } catch (e) {
      console.error('Erreur génération PDF :', e)
    } finally {
      setGenerating(false)
    }
  }

  const card = 'bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700 p-4'
  const notice = 'rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20 p-3 text-sm text-amber-900 dark:text-amber-200'

  return (
    <div className="space-y-6">
      <CrossLink href="/logistique/visualiseur-palette" question="Tous vos colis sont identiques ?" action="Calcul de palettisation" />

      <div className="grid grid-cols-1 lg:grid-cols-[320px_minmax(0,1fr)] gap-6">
        {/* Saisie */}
        <div className="space-y-4">
          <section className={card}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold flex items-center gap-2 text-gray-900 dark:text-gray-100">
                <Boxes size={16} className="text-primary-500" /> Colis de la commande
              </h2>
              <span className="text-xs text-gray-500 tabular-nums">{form.refs.length}/{LIMITS.maxReferences}</span>
            </div>
            <div className="space-y-3">
              {form.refs.map(r => (
                <ReferenceCard
                  key={r.id}
                  value={r}
                  color={colors.get(r.id) ?? '#c9a26b'}
                  onChange={patch => updateRef(r.id, patch)}
                  onDuplicate={() => duplicateRef(r.id)}
                  onRemove={() => removeRef(r.id)}
                  canDuplicate={!full}
                />
              ))}
              {form.refs.length === 0 && <p className="text-sm text-gray-500">Ajoutez au moins un colis.</p>}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={addRef}
                disabled={full}
                className="inline-flex items-center gap-1 h-9 px-3 rounded-md bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 disabled:opacity-50"
              >
                <Plus size={15} /> Ajouter un colis
              </button>
              <button
                type="button"
                onClick={() => setPasteOpen(o => !o)}
                disabled={full}
                aria-expanded={pasteOpen}
                className="inline-flex items-center gap-1 h-9 px-3 rounded-md border border-gray-300 dark:border-gray-600 text-sm text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50"
              >
                <ClipboardPaste size={15} /> Coller depuis Excel
              </button>
            </div>
            {pasteOpen && (
              <div className="mt-3">
                <PasteImport room={LIMITS.maxReferences - form.refs.length} onImport={importRows} onClose={() => setPasteOpen(false)} />
              </div>
            )}
          </section>

          <PalletSettingsFields className={card} value={form} onChange={patch => setForm(f => ({ ...f, ...patch }))} />
        </div>

        {/* Résultats */}
        <div className="space-y-4 min-w-0">
          {!result ? (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Loader2 size={16} className="animate-spin" /> Calcul en cours…
            </div>
          ) : result.error ? (
            <div className={notice}>{result.error}</div>
          ) : (
            <>
              <div className="rounded-xl bg-gradient-to-br from-primary-600 to-primary-800 text-white p-5">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <div className="text-5xl font-bold tabular-nums leading-none" aria-live="polite">{pallets.length}</div>
                    <div className="mt-1 text-primary-100 text-sm">{pallets.length > 1 ? 'palettes' : 'palette'}</div>
                  </div>
                  {computing && (
                    <span className="inline-flex items-center gap-1 text-xs text-primary-100">
                      <Loader2 size={14} className="animate-spin" /> calcul…
                    </span>
                  )}
                </div>
                <dl className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                  <div><dt className="text-primary-100 text-xs">Colis placés</dt><dd className="font-semibold text-lg tabular-nums">{fmt(result.placedBoxes)} / {fmt(result.totalBoxes)}</dd></div>
                  <div><dt className="text-primary-100 text-xs">Poids total</dt><dd className="font-semibold text-lg tabular-nums">{fmt(result.totalWeight)} kg</dd></div>
                  <div><dt className="text-primary-100 text-xs">Références</dt><dd className="font-semibold text-lg tabular-nums">{engine.refs.length}</dd></div>
                </dl>
              </div>

              {(result.rejected.length > 0 || result.missingWeight || engine.incomplete > 0) && (
                <div className={`${notice} space-y-1`}>
                  {result.rejected.map(r => (
                    <p key={`${r.refId}-${r.reason}`} className="flex gap-2">
                      <AlertTriangle size={15} className="shrink-0 mt-0.5 text-red-600" />
                      <span>
                        <strong>{names.get(r.refId)}</strong> : {r.count} colis non palettisable{r.count > 1 ? 's' : ''} ({REJECT_LABELS[r.reason]})
                      </span>
                    </p>
                  ))}
                  {result.missingWeight && (
                    <p>Certains colis n’ont pas de poids : ils sont rangés d’après leur volume et ne comptent pas dans la charge maximale.</p>
                  )}
                  {engine.incomplete > 0 && (
                    <p>{engine.incomplete} référence{engine.incomplete > 1 ? 's' : ''} incomplète{engine.incomplete > 1 ? 's' : ''} ignorée{engine.incomplete > 1 ? 's' : ''} : renseignez les trois dimensions.</p>
                  )}
                </div>
              )}

              {current && (
                <>
                  <div className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Palettes">
                    {pallets.map((p, i) => (
                      <button
                        key={p.index}
                        type="button"
                        role="tab"
                        aria-selected={p === current}
                        onClick={() => setPalletIdx(i)}
                        className={`shrink-0 rounded-lg border px-3 py-2 text-left text-xs ${p === current ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-gray-400'}`}
                      >
                        <span className="block font-semibold text-sm text-gray-900 dark:text-gray-100">
                          Palette {i + 1}
                          {p.cogWarning && <AlertTriangle size={12} className="inline ml-1 text-amber-500" aria-label="Centre de gravité décentré" />}
                        </span>
                        <span className="text-gray-500 dark:text-gray-400">{p.placements.length} colis · {fmt(p.grossWeight)} kg · {fmt(p.totalHeight)} mm</span>
                      </button>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-gray-600 dark:text-gray-400">
                    <span>Remplissage : {fmt(current.volumeUsage, 1)} %</span>
                    <span>Hauteur : {fmt(current.totalHeight)} mm</span>
                    <span>Poids brut : {fmt(current.grossWeight)} kg</span>
                    {hasStops && <span>Client{current.stops.length > 1 ? 's' : ''} : {current.stops.join(', ')}</span>}
                    {current.cogWarning && <span className="text-amber-600 dark:text-amber-400">Centre de gravité décentré : vérifiez la stabilité</span>}
                  </div>

                  <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden bg-gradient-to-b from-slate-100 to-slate-300 dark:from-gray-800 dark:to-gray-950">
                    <div className="relative h-[340px] sm:h-[420px]">
                      <BoxScene3D
                        boxes={sceneBoxes}
                        pallet={pallet}
                        zoneOffset={zoneOffset}
                        geometryKey={geometryKey}
                        onReady={api => {
                          sceneApi.current = api
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => sceneApi.current?.resetView()}
                        className="absolute top-3 right-3 p-2 rounded-lg bg-white/90 dark:bg-gray-800/90 shadow text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-700"
                        title="Recadrer la vue"
                        aria-label="Recadrer la vue"
                      >
                        <RotateCcw size={18} />
                      </button>
                      <div className="absolute bottom-2 left-3 text-[11px] text-gray-500 pointer-events-none select-none">
                        Glissez pour tourner · molette ou pincement pour zoomer
                      </div>
                    </div>
                    <StepPlayer current={shown} total={steps.length} playing={playing} onChange={selectStep} onTogglePlay={togglePlay} />
                  </div>

                  {currentStep && step !== null && (
                    <p className="text-sm text-gray-800 dark:text-gray-200">
                      <strong>Étape {currentStep.number}</strong> — {currentStep.label}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600 dark:text-gray-400">
                    {[...new Set(current.placements.map(p => p.refId))].map(id => (
                      <span key={id} className="inline-flex items-center gap-1">
                        <span className="h-3 w-3 rounded-sm" style={{ background: colors.get(id) }} aria-hidden="true" />
                        {names.get(id)}
                      </span>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={downloadPdf}
                      disabled={generating}
                      className="inline-flex items-center gap-2 h-10 px-4 rounded-md bg-primary-600 text-white font-medium hover:bg-primary-700 disabled:opacity-50"
                    >
                      <Download size={16} /> {generating ? 'Génération…' : 'Plan de palettisation (PDF)'}
                    </button>
                    <button
                      type="button"
                      onClick={copyLink}
                      className="inline-flex items-center gap-2 h-10 px-4 rounded-md border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      {copied ? <Check size={16} className="text-green-500" /> : <Link2 size={16} />}
                      {copied ? 'Lien copié' : 'Copier le lien'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm(defaultOrder())}
                      className="inline-flex items-center gap-2 h-10 px-4 rounded-md text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      Réinitialiser
                    </button>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {current && steps.length > 0 && (
        <section className={card}>
          <h2 className="text-base font-semibold mb-1 text-gray-900 dark:text-gray-100">Étapes de montage — palette {Math.min(palletIdx, pallets.length - 1) + 1}</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
            Cliquez une étape pour l’afficher en 3D. Sur le plan vu de dessus, le haut du plan est le fond de la palette.
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <StepList steps={steps} current={shown} colors={colors} onSelect={selectStep} />
            <div>
              {layerRects && layerRects.length > 0 && currentStep?.kind === 'layer' ? (
                <LayerPlan
                  zone={{ length: zoneLength, width: zoneWidth }}
                  inner={{ length: pallet.length, width: pallet.width, offset: zoneOffset }}
                  rects={layerRects}
                  footprint={{ a: layerRects[0].l, b: layerRects[0].w }}
                  title={currentStep.label}
                />
              ) : (
                <p className="text-sm text-gray-500">Sélectionnez une étape « Couche » pour voir son plan de pose.</p>
              )}
            </div>
          </div>
        </section>
      )}

      {vehicleLoads.length > 0 && (
        <section className={card}>
          <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
            <div>
              <h2 className="text-base font-semibold flex items-center gap-2 text-gray-900 dark:text-gray-100">
                <Truck size={18} className="text-primary-500" /> Combien de camions pour la commande ?
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {pallets.length} palette{pallets.length > 1 ? 's' : ''}, {fmt(result?.totalWeight ?? 0)} kg. Charges utiles indicatives.
              </p>
            </div>
            <Toggle checked={form.stackable} onChange={v => setForm(f => ({ ...f, stackable: v }))} label="Palettes gerbables" hint="Empilables les unes sur les autres" />
          </div>
          <div className="overflow-x-auto -mx-4 px-4">
            <table className="w-full text-sm min-w-[520px]">
              <thead>
                <tr className="text-left text-xs text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                  <th className="py-2 font-medium">Véhicule</th>
                  <th className="py-2 font-medium text-right">Places au sol</th>
                  <th className="py-2 font-medium text-right">Emplacements</th>
                  <th className="py-2 font-medium text-right">Véhicules</th>
                  <th className="py-2 pl-3 font-medium">Remarque</th>
                </tr>
              </thead>
              <tbody>
                {vehicleLoads.map(v => (
                  <tr key={v.vehicle.id} className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-2 text-gray-900 dark:text-gray-100">{v.vehicle.name}</td>
                    <td className="py-2 text-right tabular-nums">{fmt(v.floorCapacity)}</td>
                    <td className="py-2 text-right tabular-nums">{fmt(v.positions)}</td>
                    <td className="py-2 text-right tabular-nums font-semibold text-gray-900 dark:text-gray-100">{v.vehiclesNeeded === null ? '—' : fmt(v.vehiclesNeeded)}</td>
                    <td className="py-2 pl-3 text-xs">
                      {v.floorCapacity === 0 ? (
                        <span className="text-red-600 dark:text-red-400">Palette trop grande</span>
                      ) : v.tooTall > 0 ? (
                        <span className="text-red-600 dark:text-red-400">{v.tooTall} palette{v.tooTall > 1 ? 's' : ''} trop haute{v.tooTall > 1 ? 's' : ''}</span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Enregistrer l'outil**

Dans `lib/tools-config.ts`, remplacer :

```ts
      'colis par couche',
    ],
  },
]
```

par :

```ts
      'colis par couche',
    ],
  },
  {
    id: 'palettisation-mixte',
    name: 'Palettisation mixte – colis de tailles différentes',
    description: "Rangez sur palette des colis de tailles différentes : saisissez vos références, l'outil calcule le nombre de palettes, propose un rangement optimisé (couches pleines puis chapeau stable) et montre chaque étape de montage en 3D. Poids, fragiles, clients, PDF. Gratuit.",
    category: 'logistique',
    slug: 'palettisation-mixte',
    icon: '📦',
    keywords: [
      'palettisation mixte',
      'palette mixte',
      'palettisation colis de tailles différentes',
      'logiciel palettisation multi références',
      'plan de palettisation multi colis',
      'préparation de commande palette',
      'montage palette étape par étape',
      'calcul nombre de palettes commande',
      'palette multi-références',
      'optimisation chargement palette',
    ],
  },
]
```

Dans `app/(site)/[category]/[tool]/page.tsx`, remplacer :

```ts
  'visualiseur-palette': dynamic(() => import('@/components/tools/VisualiseurPalette')),
```

par :

```ts
  'visualiseur-palette': dynamic(() => import('@/components/tools/VisualiseurPalette')),
  'palettisation-mixte': dynamic(() => import('@/components/tools/PalettisationMixte')),
```

- [ ] **Step 3: Contenu SEO**

Dans `lib/tool-seo-data.ts`, insérer avant la ligne `  'visualiseur-palette': {` :

```ts
  'palettisation-mixte': {
    howToSteps: [
      "Saisissez chaque référence de colis : nom, dimensions en millimètres, quantité et poids",
      "Ou collez vos lignes de commande depuis Excel (nom, longueur, largeur, hauteur, quantité, poids)",
      "Précisez les contraintes : sens imposé, colis fragile, charge maximale supportée, client de livraison",
      "Choisissez la palette, la hauteur maximale, la charge maximale et le débord autorisé",
      "Lisez le nombre de palettes nécessaires et parcourez chaque palette",
      "Suivez le montage étape par étape en 3D : couches complètes, puis colis un par un",
      "Vérifiez le nombre de camions ou de conteneurs nécessaires",
      "Téléchargez le plan de palettisation PDF pour le préparateur ou partagez le lien"
    ],
    faqs: [
      {
        question: "Comment ranger des colis de tailles différentes sur une palette ?",
        answer: "Commencez par les colis les plus lourds et les plus nombreux, en couches complètes et planes. Posez ensuite les autres colis par-dessus en vérifiant que chacun repose sur au moins les trois quarts de sa base, et terminez par les colis fragiles. C'est la méthode qu'applique l'outil, qui affiche ensuite chaque étape de montage."
      },
      {
        question: "Combien de palettes faut-il pour ma commande ?",
        answer: "Saisissez vos références et leurs quantités : l'outil remplit les palettes l'une après l'autre en respectant la hauteur et la charge maximales, puis indique le nombre de palettes, le poids et la hauteur de chacune."
      },
      {
        question: "Le rangement proposé est-il le meilleur possible ?",
        answer: "C'est un rangement optimisé, pas une optimisation exacte : pour des colis de tailles différentes, aucun calcul rapide ne garantit le meilleur rangement possible. L'outil compare plusieurs ordres de pose et garde le plus compact, avec des palettes stables et faciles à monter."
      },
      {
        question: "Comment sont gérés les colis fragiles ?",
        answer: "Un colis marqué fragile ne reçoit rien sur son dessus. Il est posé en fin de montage, au sommet de la palette. Une palette dont le dessus porte un fragile ne reçoit pas d'autre palette dans le camion."
      },
      {
        question: "À quoi sert la charge maximale supportée ?",
        answer: "Elle indique le poids que le carton accepte au-dessus de lui. Le calcul est prudent : tout colis posé plus haut et qui chevauche le carton est compté entièrement sur lui."
      },
      {
        question: "Comment préparer une palette par client ?",
        answer: "Indiquez le numéro d'arrêt de chaque référence dans les options avancées (1 = livré en premier). Chaque client a ses propres palettes ; les fins de commande peu remplies sont regroupées, avec le dernier livré en bas et le premier livré en haut."
      },
      {
        question: "Puis-je importer ma commande depuis Excel ?",
        answer: "Oui. Copiez les lignes dans Excel (nom, longueur, largeur, hauteur en mm, quantité, poids en kg) puis cliquez sur « Coller depuis Excel ». Les séparateurs tabulation, point-virgule et virgule sont reconnus."
      },
      {
        question: "Mes données sont-elles envoyées sur un serveur ?",
        answer: "Non. Le calcul, la vue 3D et le PDF sont produits dans votre navigateur. La commande n'est conservée que dans l'adresse de la page, pour le partage."
      }
    ]
  },
```

Dans `components/seo/ToolContent.tsx`, insérer avant la ligne `  'visualiseur-palette': {` :

```ts
  'palettisation-mixte': {
    description: "Outil gratuit de palettisation mixte pour ranger sur palette des colis de tailles différentes. Saisissez ou collez vos références depuis Excel : l'outil calcule combien de palettes il faut, monte d'abord des couches pleines et planes avec les colis les plus lourds et les plus nombreux, puis compose le dessus colis par colis en vérifiant l'appui de chacun, les fragiles et la charge que chaque carton supporte. Chaque palette est montrée étape par étape en 3D, avec les plans de couche, le nombre de camions nécessaires et un plan PDF à remettre au préparateur.",
    howTo: [
      "Ajoutez vos références de colis ou collez-les depuis Excel",
      "Renseignez dimensions, quantités, poids et contraintes (sens, fragile, charge supportée, client)",
      "Choisissez la palette, la hauteur et la charge maximales",
      "Parcourez les palettes calculées et suivez le montage étape par étape",
      "Vérifiez le nombre de camions et téléchargez le plan PDF"
    ],
    features: [
      "Commande multi-références répartie sur autant de palettes que nécessaire",
      "Couches pleines en bas, chapeau stable au-dessus (appui de 75 % minimum)",
      "Montage étape par étape en 3D : précédent, suivant, lecture automatique",
      "Colis fragiles toujours au sommet",
      "Charge maximale supportée par carton",
      "Palettes par client, fins de commande regroupées",
      "Option « garder ensemble » par référence",
      "Collage direct depuis Excel",
      "Contrôle du centre de gravité",
      "Nombre de camions et conteneurs nécessaires",
      "Plan de palettisation PDF, une page par palette",
      "Lien de partage, calcul 100 % dans le navigateur"
    ],
    useCases: [
      "Préparer une commande e-commerce multi-produits sur palette",
      "Monter des palettes multi-références en entrepôt",
      "Préparer des palettes par client pour une tournée de livraison",
      "Estimer le nombre de palettes et de camions d'une commande",
      "Donner au préparateur un plan de montage clair",
      "Vérifier qu'une palette respecte hauteur et poids du transporteur"
    ]
  },
```

- [ ] **Step 4: Vérifier**

Run: `npx tsc --noEmit 2>&1 | grep -v "^\.next/"` puis `npm test`
Expected: aucune erreur de type ; suite verte.

- [ ] **Step 5: Commit**

```bash
git add components/tools/PalettisationMixte.tsx lib/tools-config.ts "app/(site)/[category]/[tool]/page.tsx" lib/tool-seo-data.ts components/seo/ToolContent.tsx
git commit -m "Feat(palette-mixte): page /logistique/palettisation-mixte et contenu SEO" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01RVeUVHqWyQ8YRzVwvntfRT"
```

---

### Task 18: Vérification complète

**Files:** aucun nouveau fichier ; les captures et PDF de test vont dans le scratchpad de session, jamais dans le dépôt (supprimer `.playwright-mcp/` s'il apparaît).

- [ ] **Step 1: Suite de tests et types**

Run: `npm test && npx tsc --noEmit 2>&1 | grep -v "^\.next/"`
Expected: toutes les suites vertes ; aucune erreur de type.

- [ ] **Step 2: Build de production**

Arrêter tout serveur de dev (vérifier qu'aucun `node` n'écoute encore sur le port, cf. session du 2026-11-17), puis :

Run: `rm -rf .next && npm run build`
Expected: `✓ Compiled successfully` ; la route `/[category]/[tool]` reste sous ~280 kB au premier chargement (263 kB avant).

- [ ] **Step 3: Navigateur, bureau (1366 × 900)**

Lancer `npx next dev -p 3123` en arrière-plan, puis vérifier sur `http://localhost:3123/logistique/palettisation-mixte` :
- l'exemple par défaut donne 2 palettes, la palette 1 a des couches et le Colis 3 (fragile) au sommet ;
- lecture automatique : la 3D se construit étape par étape, l'étape courante est en surbrillance ;
- un clic sur une étape « Couche » affiche son plan ;
- collage de `Carton X\t500\t300\t200\t30\t8` : une 4e carte apparaît, le calcul se met à jour ;
- options avancées : client 2 sur une référence → palettes séparées par client ;
- PDF téléchargé et relu (synthèse, une page par palette, vue isométrique, étapes) ;
- « Copier le lien », puis ouverture du lien dans un nouvel onglet : même commande ;
- le bandeau croisé mène à `visualiseur-palette`, et celui de `visualiseur-palette` revient ici ;
- `visualiseur-palette` se comporte comme avant (500 × 300 × 200 → 6 par couche, 3D, PDF) ;
- console : aucune erreur.

- [ ] **Step 4: Navigateur, mobile (390 × 844)**

Mêmes pages : pas de défilement horizontal (`document.documentElement.scrollWidth <= innerWidth`), cartes lisibles, 3D cadrée, lecteur utilisable.

- [ ] **Step 5: Coffre**

Mettre à jour `C:\Users\mat\Brain\00 - Inbox\MTS-Toolbox.md` (statut de la palettisation mixte, commits), la daily note du jour (nouvelle section) et `Active Priorities.md`. Ne rien pousser.
