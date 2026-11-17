import type { PalletizationInput, PalletizationResult, VehicleLoad, Rect } from './packing'
import { sanitizeForPDF } from '@/lib/pdf/sanitize'

interface PlanPdfOptions {
  input: PalletizationInput
  palletName: string
  result: PalletizationResult
  vehicles: VehicleLoad[]
  snapshotPng?: string | null
  shareUrl: string
}

const fmt = (n: number, d = 0) =>
  n.toLocaleString('fr-FR', { minimumFractionDigits: d, maximumFractionDigits: d })

/**
 * Fiche de palettisation A4 : récapitulatif, vue 3D, plan de couche coté, chargement véhicules.
 */
export async function generatePalletPlanPDF(opts: PlanPdfOptions): Promise<Blob> {
  const { input, result, vehicles, snapshotPng, shareUrl, palletName } = opts
  const { PDFDocument, rgb, StandardFonts } = await import('pdf-lib')

  const pdf = await PDFDocument.create()
  const font = await pdf.embedFont(StandardFonts.Helvetica)
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold)
  const page = pdf.addPage([595, 842])
  const { width, height } = page.getSize()
  const margin = 40
  const ink = rgb(0.12, 0.12, 0.14)
  const muted = rgb(0.45, 0.45, 0.5)
  const line = rgb(0.85, 0.85, 0.88)
  let y = height - margin

  const text = (s: string, x: number, yy: number, size = 9, f = font, color = ink) =>
    page.drawText(sanitizeForPDF(s), { x, y: yy, size, font: f, color })

  // En-tête
  text('Plan de palettisation', margin, y - 16, 18, bold)
  text(`Généré le ${new Date().toLocaleDateString('fr-FR')} - mts-toolbox.com`, margin, y - 32, 8, font, muted)
  y -= 50

  // Bandeau de chiffres clés
  const kpis: [string, string][] = [
    ['Colis / palette', fmt(result.totalBoxes)],
    ['Par couche', fmt(result.perLayer)],
    ['Couches', result.lastLayerCount ? `${result.fullLayers} + 1 incomplète` : fmt(result.fullLayers)],
    ['Poids brut', `${fmt(result.grossWeight)} kg`],
    ['Hauteur totale', `${fmt(result.totalHeight)} mm`],
  ]
  const kw = (width - 2 * margin) / kpis.length
  kpis.forEach(([label, value], i) => {
    const x = margin + i * kw
    page.drawRectangle({ x: x + 2, y: y - 44, width: kw - 4, height: 44, color: rgb(0.96, 0.95, 0.92), borderColor: line, borderWidth: 0.6 })
    text(value, x + 8, y - 22, value.length > 12 ? 10 : 14, bold)
    text(label, x + 8, y - 36, 7.5, font, muted)
  })
  y -= 60

  // Données d'entrée
  const { box, pallet } = input
  const o = result.orientation
  const params: [string, string][] = [
    ['Colis', `${fmt(box.length)} x ${fmt(box.width)} x ${fmt(box.height)} mm - ${fmt(box.weight, 2)} kg`],
    ['Pose', o.tipped ? `couché : emprise ${fmt(o.footA)} x ${fmt(o.footB)}, hauteur ${fmt(o.height)} mm` : 'à plat (ce côté vers le haut)'],
    ['Palette', `${palletName} - ${fmt(pallet.length)} x ${fmt(pallet.width)} x ${fmt(pallet.height)} mm, tare ${fmt(pallet.tare)} kg`],
    ['Limites', `hauteur ${fmt(input.maxHeight)} mm, charge ${input.maxLoad > 0 ? fmt(input.maxLoad) + ' kg' : 'non limitée'}, débord ${fmt(input.overhang)} mm/côté`],
    ['Remplissage', `surface ${fmt(result.areaUsage, 1)} %, volume ${fmt(result.volumeUsage, 1)} % - limité par ${result.limitedBy === 'poids' ? 'le poids' : 'la hauteur'}`],
  ]
  if (result.naiveTotal > 0 && result.totalBoxes > result.naiveTotal) {
    params.push(['Gain', `+${fmt(result.totalBoxes - result.naiveTotal)} colis vs un rangement tous dans le même sens (${fmt(result.naiveTotal)})`])
  }
  for (const [label, value] of params) {
    text(label, margin, y, 9, bold)
    text(value, margin + 80, y, 9)
    y -= 14
  }
  y -= 8

  // Vue 3D + plan de couche côte à côte
  const blockTop = y
  const colW = (width - 2 * margin - 16) / 2
  const blockH = 250
  if (snapshotPng) {
    try {
      const png = await pdf.embedPng(snapshotPng)
      const scale = Math.min(colW / png.width, blockH / png.height)
      const w = png.width * scale, h = png.height * scale
      page.drawRectangle({ x: margin, y: blockTop - blockH, width: colW, height: blockH, color: rgb(0.94, 0.95, 0.97) })
      page.drawImage(png, { x: margin + (colW - w) / 2, y: blockTop - blockH + (blockH - h) / 2, width: w, height: h })
    } catch {
      // capture indisponible : le plan seul suffit
    }
  }
  const planX = snapshotPng ? margin + colW + 16 : margin
  const planW = snapshotPng ? colW : width - 2 * margin
  drawPlan(page, rgb, font, {
    x: planX, y: blockTop - blockH, w: planW, h: blockH,
    zone: result.zone, rects: result.layer.rects, pallet,
    footA: o.footA, footB: o.footB,
  })
  text('Plan de couche (vue de dessus)', planX, blockTop - blockH - 12, 8, bold, muted)
  y = blockTop - blockH - 34

  // Véhicules
  text('Chargement des palettes', margin, y, 12, bold)
  y -= 6
  page.drawLine({ start: { x: margin, y }, end: { x: width - margin, y }, thickness: 0.6, color: line })
  y -= 14
  const cols = [margin, margin + 170, margin + 260, margin + 340, margin + 430]
  ;['Véhicule', 'Palettes', 'Colis', 'Poids', 'Remarque'].forEach((h, i) => text(h, cols[i], y, 8, bold, muted))
  y -= 13
  for (const v of vehicles) {
    text(v.vehicle.name, cols[0], y, 9)
    text(v.stackLevels > 1 ? `${fmt(v.pallets)} (${v.floorPallets} x ${v.stackLevels})` : fmt(v.pallets), cols[1], y, 9, bold)
    text(fmt(v.boxes), cols[2], y, 9)
    text(`${fmt(v.weight / 1000, 1)} t`, cols[3], y, 9)
    const note = v.stackLevels === 0 ? 'palette trop haute' : v.overweight ? `dépasse ${fmt(v.vehicle.payload / 1000, 1)} t` : ''
    if (note) text(note, cols[4], y, 8, font, rgb(0.75, 0.25, 0.1))
    y -= 13
  }

  // Pied de page
  text('Estimation indicative : vérifiez la stabilité, le cerclage et les règles de votre transporteur.', margin, 46, 7.5, font, muted)
  const url = shareUrl.length > 110 ? shareUrl.slice(0, 107) + '...' : shareUrl
  text(`Recalculer en ligne : ${url}`, margin, 34, 7.5, font, muted)

  const bytes = await pdf.save()
  return new Blob([new Uint8Array(bytes)], { type: 'application/pdf' })
}

type PdfPage = import('pdf-lib').PDFPage
type RgbFn = typeof import('pdf-lib').rgb
type PdfFont = import('pdf-lib').PDFFont

function drawPlan(
  page: PdfPage,
  rgb: RgbFn,
  font: PdfFont,
  o: {
    x: number; y: number; w: number; h: number
    zone: { length: number; width: number; offset: number }
    rects: Rect[]
    pallet: { length: number; width: number }
    footA: number; footB: number
  }
) {
  const pad = 14
  const scale = Math.min((o.w - 2 * pad) / o.zone.length, (o.h - 2 * pad) / o.zone.width)
  const zw = o.zone.length * scale, zh = o.zone.width * scale
  const ox = o.x + (o.w - zw) / 2
  // pdf-lib : origine en bas à gauche ; on garde la longueur à l'horizontale
  const oy = o.y + (o.h - zh) / 2
  const toY = (yy: number, hh: number) => oy + zh - (yy + hh) * scale

  page.drawRectangle({ x: ox, y: oy, width: zw, height: zh, borderColor: rgb(0.6, 0.6, 0.65), borderWidth: 0.5, borderDashArray: o.zone.offset > 0 ? [3, 2] : undefined })
  page.drawRectangle({
    x: ox + o.zone.offset * scale, y: toY(o.zone.offset, o.pallet.width),
    width: o.pallet.length * scale, height: o.pallet.width * scale,
    color: rgb(0.85, 0.75, 0.62), borderColor: rgb(0.55, 0.4, 0.25), borderWidth: 0.8,
  })
  const size = Math.max(4, Math.min(8, Math.min(o.footA, o.footB) * scale * 0.35))
  o.rects.forEach((r, i) => {
    const rotated = !(r.l === o.footA && r.w === o.footB)
    page.drawRectangle({
      x: ox + r.x * scale, y: toY(r.y, r.w), width: r.l * scale, height: r.w * scale,
      color: rotated ? rgb(0.6, 0.85, 0.97) : rgb(0.88, 0.74, 0.55),
      borderColor: rgb(0.3, 0.25, 0.2), borderWidth: 0.5,
    })
    if (o.rects.length <= 120) {
      const label = String(i + 1)
      const tw = font.widthOfTextAtSize(label, size)
      page.drawText(label, { x: ox + (r.x + r.l / 2) * scale - tw / 2, y: toY(r.y, r.w) + (r.w * scale) / 2 - size / 3, size, font, color: rgb(0.2, 0.2, 0.2) })
    }
  })
  const dim = `${o.pallet.length.toLocaleString('fr-FR')} x ${o.pallet.width.toLocaleString('fr-FR')} mm`
  page.drawText(sanitizeForPDF(dim), { x: ox, y: oy + zh + 4, size: 7, font, color: rgb(0.45, 0.45, 0.5) })
}
