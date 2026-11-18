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
