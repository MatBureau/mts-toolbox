import { describe, it, expect } from 'vitest'
import { PDFDict, PDFDocument, PDFName } from 'pdf-lib'
import { defaultOrder, formToEngine } from '@/lib/palette-mixte/form'
import { palletizeOrder } from '@/lib/palette-mixte/engine'
import { generateOrderPDF } from '@/lib/palette-mixte/pdf'
import type { OrderForm } from '@/lib/palette-mixte/form'

async function pdfOf(form: OrderForm, shareUrl = 'https://mts-toolbox.com/logistique/palettisation-mixte#c=x') {
  const { refs, settings } = formToEngine(form)
  const result = palletizeOrder(refs, settings)
  return generateOrderPDF({
    refs,
    settings,
    palletName: 'Europe EUR / EPAL 1',
    result,
    vehicles: [],
    colorOf: () => [0.8, 0.6, 0.4],
    shareUrl,
  })
}

// Nombre d'images (XObject) posées sur une page
async function imagesOnPage(blob: Blob, index: number) {
  const doc = await PDFDocument.load(new Uint8Array(await blob.arrayBuffer()))
  const xobjects = doc.getPages()[index].node.Resources()?.lookupMaybe(PDFName.of('XObject'), PDFDict)
  return { count: xobjects ? xobjects.keys().length : 0, pages: doc.getPageCount() }
}

describe('PDF', () => {
  it('génère un PDF même avec un nom exotique', async () => {
    const form = defaultOrder()
    form.refs[0] = { ...form.refs[0], name: 'Carton 📦 spécial' }
    const blob = await pdfOf(form)
    const head = new TextDecoder().decode(new Uint8Array(await blob.arrayBuffer()).slice(0, 5))
    expect(head).toBe('%PDF-')
    expect(blob.size).toBeGreaterThan(2000)
  }, 30_000)

  it('porte un QR code du lien complet en première page', async () => {
    const blob = await pdfOf(defaultOrder(), `https://mts-toolbox.com/logistique/palettisation-mixte#c=z${'A'.repeat(600)}`)
    expect((await imagesOnPage(blob, 0)).count).toBe(1)
  }, 30_000)

  it('garde le QR code en première page même quand la synthèse déborde', async () => {
    const form = defaultOrder()
    form.refs = Array.from({ length: 30 }, (_, i) => ({ ...form.refs[i % 3], id: `r${i}`, name: `Référence ${i + 1}`, quantity: '2', stop: String(1 + (i % 4)) }))
    const blob = await pdfOf(form)
    const first = await imagesOnPage(blob, 0)
    expect(first.count).toBe(1)
    expect((await imagesOnPage(blob, 1)).count).toBe(0)
  }, 30_000)

  it('lien trop long pour un QR code : pas d’image, le PDF est quand même produit', async () => {
    const blob = await pdfOf(defaultOrder(), `https://mts-toolbox.com/#c=z${'A'.repeat(5000)}`)
    expect((await imagesOnPage(blob, 0)).count).toBe(0)
  }, 30_000)
})
