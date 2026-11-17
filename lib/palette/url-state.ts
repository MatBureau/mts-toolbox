import { PALLET_PRESETS, CUSTOM_PALLET_ID } from './presets'

// Saisie du formulaire, conservée en texte pour qu'un champ puisse être vidé pendant la frappe
export interface PaletteFormState {
  boxLength: string
  boxWidth: string
  boxHeight: string
  boxWeight: string
  palletId: string
  palletLength: string
  palletWidth: string
  palletHeight: string
  palletTare: string
  maxHeight: string
  maxLoad: string
  overhang: string
  allowTipping: boolean
  stackable: boolean
}

const eur = PALLET_PRESETS[0]

export const DEFAULT_FORM: PaletteFormState = {
  boxLength: '400',
  boxWidth: '300',
  boxHeight: '250',
  boxWeight: '5',
  palletId: eur.id,
  palletLength: String(eur.length),
  palletWidth: String(eur.width),
  palletHeight: String(eur.height),
  palletTare: String(eur.tare),
  maxHeight: '1800',
  maxLoad: '1000',
  overhang: '0',
  allowTipping: false,
  stackable: false,
}

// Clés courtes : le lien doit rester lisible quand on le colle dans un mail
const KEYS: Record<keyof PaletteFormState, string> = {
  boxLength: 'l',
  boxWidth: 'w',
  boxHeight: 'h',
  boxWeight: 'kg',
  palletId: 'p',
  palletLength: 'pl',
  palletWidth: 'pw',
  palletHeight: 'ph',
  palletTare: 'pt',
  maxHeight: 'hmax',
  maxLoad: 'max',
  overhang: 'deb',
  allowTipping: 'couche',
  stackable: 'gerbe',
}

export function formToQuery(form: PaletteFormState): string {
  const params = new URLSearchParams()
  for (const [field, key] of Object.entries(KEYS) as [keyof PaletteFormState, string][]) {
    // Les dimensions d'une palette prédéfinie se déduisent de son identifiant
    if (form.palletId !== CUSTOM_PALLET_ID && ['palletLength', 'palletWidth', 'palletHeight', 'palletTare'].includes(field)) continue
    const value = form[field]
    if (value === DEFAULT_FORM[field]) continue
    params.set(key, typeof value === 'boolean' ? (value ? '1' : '0') : value)
  }
  return params.toString()
}

const NUMERIC = /^\d{1,6}([.,]\d{1,3})?$/

export function queryToForm(search: string): PaletteFormState {
  const params = new URLSearchParams(search)
  const form: PaletteFormState = { ...DEFAULT_FORM }
  for (const [field, key] of Object.entries(KEYS) as [keyof PaletteFormState, string][]) {
    const raw = params.get(key)
    if (raw === null) continue
    if (typeof DEFAULT_FORM[field] === 'boolean') {
      ;(form as unknown as Record<string, unknown>)[field] = raw === '1'
    } else if (field === 'palletId') {
      if (raw === CUSTOM_PALLET_ID || PALLET_PRESETS.some(p => p.id === raw)) form.palletId = raw
    } else if (NUMERIC.test(raw)) {
      ;(form as unknown as Record<string, unknown>)[field] = raw
    }
  }
  const preset = PALLET_PRESETS.find(p => p.id === form.palletId)
  if (preset) {
    form.palletLength = String(preset.length)
    form.palletWidth = String(preset.width)
    form.palletHeight = String(preset.height)
    form.palletTare = String(preset.tare)
  }
  return form
}

export function parseNumber(value: string): number {
  const n = parseFloat(value.replace(',', '.'))
  return Number.isFinite(n) ? n : 0
}
