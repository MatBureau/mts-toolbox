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
