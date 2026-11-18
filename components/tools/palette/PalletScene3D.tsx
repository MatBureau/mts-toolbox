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
