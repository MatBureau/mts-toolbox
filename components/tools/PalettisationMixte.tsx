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
  const { result, input, computing } = usePalletization(hydrated ? engine.refs : null, engine.settings)
  // Tout ce qui illustre le résultat vient de la saisie qui l'a produit, pas du formulaire en cours de frappe
  const shownRefs = input?.refs ?? engine.refs
  const shownSettings = input?.settings ?? engine.settings

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
  const names = useMemo(() => new Map(shownRefs.map(r => [r.id, r.name])), [shownRefs])
  const hasStops = shownRefs.some(r => r.stop > 1)

  const { pallet } = shownSettings
  const zoneOffset = Math.max(0, shownSettings.overhang)
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
        refs: shownRefs,
        settings: shownSettings,
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

      <div className="grid grid-cols-1 lg:grid-cols-[340px_minmax(0,1fr)] gap-6">
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
                  <div><dt className="text-primary-100 text-xs">Références</dt><dd className="font-semibold text-lg tabular-nums">{shownRefs.length}</dd></div>
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
                      disabled={generating || computing}
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
