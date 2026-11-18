'use client'

import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { Box, Truck, Download, Link2, RotateCcw, Check, Scale, Ruler } from 'lucide-react'
import {
  computePalletization,
  computeVehicleLoad,
  validateInput,
  type PalletizationInput,
} from '@/lib/palette/packing'
import { PALLET_PRESETS, VEHICLE_PRESETS } from '@/lib/palette/presets'
import { DEFAULT_FORM, formToQuery, queryToForm, parseNumber, type PaletteFormState } from '@/lib/palette/url-state'
import LayerPlan from './palette/LayerPlan'
import { NumberField, Toggle } from './palette/fields'
import PalletSettingsFields from './palette/PalletSettingsFields'
import CrossLink from './palette/CrossLink'
import type { SceneApi } from './palette/PalletScene3D'

const PalletScene3D = dynamic(() => import('./palette/PalletScene3D'), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center text-sm text-gray-500">Chargement de la vue 3D…</div>
  ),
})

// Formats de cartons courants, pour démarrer en un clic
const BOX_EXAMPLES = [
  { label: '600 × 400 × 400', l: '600', w: '400', h: '400', kg: '12' },
  { label: '400 × 300 × 250', l: '400', w: '300', h: '250', kg: '5' },
  { label: '500 × 300 × 200', l: '500', w: '300', h: '200', kg: '6' },
  { label: '300 × 200 × 150', l: '300', w: '200', h: '150', kg: '2' },
  { label: '6 bouteilles 75 cl', l: '260', w: '175', h: '330', kg: '9' },
]

const fmt = (n: number, d = 0) => n.toLocaleString('fr-FR', { minimumFractionDigits: d, maximumFractionDigits: d })

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
  }
}
const trackEvent = (name: string) => {
  try {
    window.gtag?.('event', name, { tool: 'visualiseur-palette' })
  } catch {
    // mesure facultative
  }
}

export default function VisualiseurPalette() {
  const [form, setForm] = useState<PaletteFormState>(DEFAULT_FORM)
  const [hydrated, setHydrated] = useState(false)
  const [visibleLayers, setVisibleLayers] = useState(99)
  const [selectedVehicle, setSelectedVehicle] = useState(VEHICLE_PRESETS[0].id)
  const [copied, setCopied] = useState(false)
  const [generating, setGenerating] = useState(false)
  const sceneApi = useRef<SceneApi | null>(null)

  // Lien partagé : les paramètres de l'URL priment sur les valeurs par défaut
  useEffect(() => {
    setForm(queryToForm(window.location.search))
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    const q = formToQuery(form)
    const url = window.location.pathname + (q ? `?${q}` : '')
    window.history.replaceState(window.history.state, '', url)
  }, [form, hydrated])

  const set = useCallback(<K extends keyof PaletteFormState>(key: K, value: PaletteFormState[K]) => {
    setForm(prev => ({ ...prev, [key]: value }))
  }, [])

  const deferredForm = useDeferredValue(form)
  const input: PalletizationInput = useMemo(() => ({
    box: {
      length: parseNumber(deferredForm.boxLength),
      width: parseNumber(deferredForm.boxWidth),
      height: parseNumber(deferredForm.boxHeight),
      weight: parseNumber(deferredForm.boxWeight),
    },
    pallet: {
      length: parseNumber(deferredForm.palletLength),
      width: parseNumber(deferredForm.palletWidth),
      height: parseNumber(deferredForm.palletHeight),
      tare: parseNumber(deferredForm.palletTare),
    },
    maxHeight: parseNumber(deferredForm.maxHeight),
    maxLoad: parseNumber(deferredForm.maxLoad),
    overhang: parseNumber(deferredForm.overhang),
    allowTipping: deferredForm.allowTipping,
  }), [deferredForm])

  const error = validateInput(input)
  const result = useMemo(() => computePalletization(input), [input])
  const layersTotal = result.fullLayers + (result.lastLayerCount > 0 ? 1 : 0)
  const shownLayers = Math.min(visibleLayers, layersTotal)

  const vehicles = useMemo(() => {
    if (!result.valid) return []
    const footprint = input.overhang > 0
      ? { length: result.zone.length, width: result.zone.width }
      : { length: input.pallet.length, width: input.pallet.width }
    return VEHICLE_PRESETS.map(v =>
      computeVehicleLoad(v, footprint, result.totalHeight, result.grossWeight, result.totalBoxes, deferredForm.stackable)
    )
  }, [result, input, deferredForm.stackable])
  const vehicle = vehicles.find(v => v.vehicle.id === selectedVehicle) ?? vehicles[0]

  const palletName = PALLET_PRESETS.find(p => p.id === form.palletId)?.name ?? 'Palette personnalisée'
  const gain = result.totalBoxes - result.naiveTotal

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      trackEvent('palette_share')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // presse-papiers refusé : l'URL reste dans la barre d'adresse
    }
  }

  const downloadPdf = async () => {
    if (!result.valid) return
    setGenerating(true)
    try {
      const { generatePalletPlanPDF } = await import('@/lib/palette/pdf')
      const blob = await generatePalletPlanPDF({
        input,
        palletName,
        result,
        vehicles,
        snapshotPng: sceneApi.current?.snapshot() ?? null,
        shareUrl: window.location.href,
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `plan-palettisation-${input.box.length}x${input.box.width}x${input.box.height}.pdf`
      a.click()
      URL.revokeObjectURL(url)
      trackEvent('palette_pdf')
    } catch (e) {
      console.error('Erreur génération PDF :', e)
    } finally {
      setGenerating(false)
    }
  }

  const card = 'bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700 p-4'

  return (
    <div className="space-y-6">
      <CrossLink href="/logistique/palettisation-mixte" question="Vos colis ont des tailles différentes ?" action="Palettisation mixte" />
      <div className="grid grid-cols-1 lg:grid-cols-[290px_minmax(0,1fr)] gap-6">
        {/* Saisie */}
        <div className="space-y-4">
          <section className={card}>
            <h2 className="text-sm font-semibold mb-3 flex items-center gap-2 text-gray-900 dark:text-gray-100">
              <Box size={16} className="text-primary-500" /> Colis
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <NumberField label="Longueur" unit="mm" value={form.boxLength} onChange={v => set('boxLength', v)} />
              <NumberField label="Largeur" unit="mm" value={form.boxWidth} onChange={v => set('boxWidth', v)} />
              <NumberField label="Hauteur" unit="mm" value={form.boxHeight} onChange={v => set('boxHeight', v)} />
              <NumberField label="Poids" unit="kg" step={0.1} value={form.boxWeight} onChange={v => set('boxWeight', v)} />
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {BOX_EXAMPLES.map(ex => (
                <button
                  key={ex.label}
                  type="button"
                  onClick={() => setForm(prev => ({ ...prev, boxLength: ex.l, boxWidth: ex.w, boxHeight: ex.h, boxWeight: ex.kg }))}
                  className="text-[11px] px-2 py-1 rounded-full border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-primary-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                >
                  {ex.label}
                </button>
              ))}
            </div>
            <div className="mt-4">
              <Toggle
                checked={form.allowTipping}
                onChange={v => set('allowTipping', v)}
                label="Le colis peut être couché"
                hint="Décoché : « ce côté vers le haut » respecté"
              />
            </div>
          </section>

          <PalletSettingsFields className={card} value={form} onChange={patch => setForm(prev => ({ ...prev, ...patch }))} />
        </div>

        {/* Résultats */}
        <div className="space-y-4 min-w-0">
          {error ? (
            <div className="rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20 p-4 text-sm text-amber-900 dark:text-amber-200">
              {error}
            </div>
          ) : !result.valid ? (
            <div className="rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20 p-4 text-sm text-amber-900 dark:text-amber-200">
              Aucun colis ne tient : le colis est plus grand que la palette ou plus haut que la hauteur disponible.
            </div>
          ) : (
            <>
              <div className="rounded-xl bg-gradient-to-br from-primary-600 to-primary-800 text-white p-5">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <div className="text-5xl font-bold tabular-nums leading-none" aria-live="polite">{fmt(result.totalBoxes)}</div>
                    <div className="mt-1 text-primary-100 text-sm">colis par palette</div>
                  </div>
                  {gain > 0 && (
                    <div className="rounded-lg bg-white/15 px-3 py-2 text-sm">
                      <span className="font-semibold">+{fmt(gain)} colis</span>{' '}
                      <span className="text-primary-100">
                        (+{fmt((gain / Math.max(1, result.naiveTotal)) * 100)} %) par rapport à un rangement tous dans le même sens
                      </span>
                    </div>
                  )}
                </div>
                <dl className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                  <div><dt className="text-primary-100 text-xs">Par couche</dt><dd className="font-semibold text-lg tabular-nums">{result.perLayer}</dd></div>
                  <div>
                    <dt className="text-primary-100 text-xs">Couches</dt>
                    <dd className="font-semibold text-lg tabular-nums">
                      {result.fullLayers}{result.lastLayerCount > 0 && <span className="text-sm font-normal"> + 1 de {result.lastLayerCount}</span>}
                    </dd>
                  </div>
                  <div><dt className="text-primary-100 text-xs">Poids brut</dt><dd className="font-semibold text-lg tabular-nums">{fmt(result.grossWeight)} kg</dd></div>
                  <div><dt className="text-primary-100 text-xs">Hauteur totale</dt><dd className="font-semibold text-lg tabular-nums">{fmt(result.totalHeight)} mm</dd></div>
                </dl>
              </div>

              <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-gray-600 dark:text-gray-400">
                <span className="inline-flex items-center gap-1"><Ruler size={13} /> Surface couverte : {fmt(result.areaUsage, 1)} %</span>
                <span>Volume occupé : {fmt(result.volumeUsage, 1)} %</span>
                <span className="inline-flex items-center gap-1">
                  <Scale size={13} /> Limité par {result.limitedBy === 'poids' ? 'la charge max' : 'la hauteur max'}
                </span>
                {result.orientation.tipped && (
                  <span className="text-amber-600 dark:text-amber-400">Colis couché ({result.orientation.footA} × {result.orientation.footB}, h {result.orientation.height})</span>
                )}
              </div>

              <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden bg-gradient-to-b from-slate-100 to-slate-300 dark:from-gray-800 dark:to-gray-950">
                <div className="relative h-[340px] sm:h-[420px]">
                  <PalletScene3D
                    result={result}
                    pallet={input.pallet}
                    visibleLayers={shownLayers}
                    onReady={api => { sceneApi.current = api }}
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
                {layersTotal > 1 && (
                  <div className="flex items-center gap-3 px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-900/70">
                    <label htmlFor="layers" className="text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
                      Couches affichées
                    </label>
                    <input
                      id="layers"
                      type="range"
                      min={1}
                      max={layersTotal}
                      value={shownLayers}
                      onChange={e => setVisibleLayers(Number(e.target.value))}
                      className="flex-1 accent-primary-600"
                    />
                    <span className="text-xs tabular-nums w-12 text-right text-gray-700 dark:text-gray-300">{shownLayers}/{layersTotal}</span>
                  </div>
                )}
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
                  onClick={() => { setForm(DEFAULT_FORM); setVisibleLayers(99) }}
                  className="inline-flex items-center gap-2 h-10 px-4 rounded-md text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Réinitialiser
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {result.valid && !error && (
        <>
          <section className={card}>
            <h2 className="text-base font-semibold mb-1 text-gray-900 dark:text-gray-100">Plan de couche</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              Vue de dessus d’une couche pleine, numérotée dans l’ordre de pose.
              {result.lastLayerCount > 0 && ` Dernière couche : colis 1 à ${result.lastLayerCount}.`}
            </p>
            <div className="max-w-2xl mx-auto">
              <LayerPlan
                zone={{ length: result.zone.length, width: result.zone.width }}
                inner={{ length: input.pallet.length, width: input.pallet.width, offset: result.zone.offset }}
                rects={result.layer.rects}
                footprint={{ a: result.orientation.footA, b: result.orientation.footB }}
                title={`${result.perLayer} colis par couche`}
              />
            </div>
          </section>

          <section className={card}>
            <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
              <div>
                <h2 className="text-base font-semibold flex items-center gap-2 text-gray-900 dark:text-gray-100">
                  <Truck size={18} className="text-primary-500" /> Combien de palettes dans un camion ?
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Palettes de {fmt(result.totalHeight)} mm et {fmt(result.grossWeight)} kg. Charges utiles indicatives.
                </p>
              </div>
              <Toggle
                checked={form.stackable}
                onChange={v => set('stackable', v)}
                label="Palettes gerbables"
                hint="Empilables les unes sur les autres"
              />
            </div>

            <div className="overflow-x-auto -mx-4 px-4">
              <table className="w-full text-sm min-w-[520px]">
                <thead>
                  <tr className="text-left text-xs text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                    <th className="py-2 font-medium">Véhicule</th>
                    <th className="py-2 font-medium text-right">Palettes</th>
                    <th className="py-2 font-medium text-right">Colis</th>
                    <th className="py-2 font-medium text-right">Poids</th>
                    <th className="py-2 pl-3 font-medium">Remarque</th>
                  </tr>
                </thead>
                <tbody>
                  {vehicles.map(v => {
                    const active = v.vehicle.id === vehicle?.vehicle.id
                    return (
                      <tr
                        key={v.vehicle.id}
                        onClick={() => setSelectedVehicle(v.vehicle.id)}
                        className={`border-b border-gray-100 dark:border-gray-800 cursor-pointer ${active ? 'bg-primary-50 dark:bg-primary-900/20' : 'hover:bg-gray-100 dark:hover:bg-gray-800/60'}`}
                      >
                        <td className="py-2">
                          <button type="button" className="text-left text-gray-900 dark:text-gray-100" aria-pressed={active}>
                            {v.vehicle.name}
                          </button>
                        </td>
                        <td className="py-2 text-right tabular-nums font-semibold text-gray-900 dark:text-gray-100">
                          {fmt(v.pallets)}
                          {v.stackLevels > 1 && <span className="font-normal text-xs text-gray-500"> ({v.floorPallets} × {v.stackLevels})</span>}
                        </td>
                        <td className="py-2 text-right tabular-nums">{fmt(v.boxes)}</td>
                        <td className="py-2 text-right tabular-nums">{fmt(v.weight / 1000, 1)} t</td>
                        <td className="py-2 pl-3 text-xs">
                          {v.stackLevels === 0 ? (
                            <span className="text-red-600 dark:text-red-400">Palette trop haute</span>
                          ) : v.overweight ? (
                            <span className="text-amber-600 dark:text-amber-400">Dépasse {fmt(v.vehicle.payload / 1000, 1)} t de charge utile</span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {vehicle && vehicle.floorPallets > 0 && (
              <div className="mt-5">
                <LayerPlan
                  zone={{ length: vehicle.vehicle.length, width: vehicle.vehicle.width }}
                  rects={vehicle.layer.rects}
                  footprint={{
                    a: input.overhang > 0 ? result.zone.length : input.pallet.length,
                    b: input.overhang > 0 ? result.zone.width : input.pallet.width,
                  }}
                  title={`${vehicle.vehicle.name} : ${vehicle.floorPallets} palettes au sol (vue de dessus)`}
                />
              </div>
            )}
          </section>
        </>
      )}
    </div>
  )
}
