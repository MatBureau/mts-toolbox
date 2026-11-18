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
const FOOTER_FLOOR = 60 // le contenu reste au-dessus du pied de page
// QR code du lien de partage, en bas à droite de la page 1 : la synthèse s'arrête plus haut sur cette page
const QR_SIZE = 90
const QR_Y = 52
const FIRST_PAGE_FLOOR = QR_Y + QR_SIZE + 8

// PNG du QR code (null si le lien dépasse la capacité d'un QR code ou si le rendu échoue). Correction L : le papier est
// propre et le symbole reste moins dense, donc lisible à 90 pt ; au moins 4 px par module.
async function qrPng(url: string): Promise<string | null> {
  try {
    const QRCode = await import('qrcode')
    const options = { margin: 1, errorCorrectionLevel: 'L' as const }
    const size = QRCode.create(url, options).modules.size
    return await QRCode.toDataURL(url, { ...options, width: Math.max(240, (size + 2) * 4) })
  } catch {
    return null
  }
}

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
  const firstPage = page
  let y = PAGE[1] - MARGIN
  const floor = () => (page === firstPage ? FIRST_PAGE_FLOOR : FOOTER_FLOOR)
  const text = (s: string, x: number, yy: number, size = 9, f = font, color = ink) =>
    page.drawText(sanitizeForPDF(s), { x, y: yy, size, font: f, color })
  const fit = (s: string, size: number, maxWidth: number, f = font) => {
    const full = sanitizeForPDF(s)
    let t = full
    while (t.length > 3 && f.widthOfTextAtSize(t, size) > maxWidth) t = t.slice(0, -2)
    return t === full ? t : `${t}...`
  }
  const ensure = (space: number, header?: string) => {
    if (y - space >= floor()) return
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
  // Lien complet en QR code (une URL imprimée serait tronquée et inutilisable)
  const qr = await qrPng(o.shareUrl)
  const caption = qr ? 'Scannez pour recalculer en ligne' : 'Lien trop long pour un QR code : utilisez « Copier le lien » dans l’outil'
  if (qr) {
    const image = await pdf.embedPng(qr)
    firstPage.drawImage(image, { x: width - MARGIN - QR_SIZE, y: QR_Y, width: QR_SIZE, height: QR_SIZE })
  }
  const captionText = sanitizeForPDF(caption)
  firstPage.drawText(captionText, { x: width - MARGIN - font.widthOfTextAtSize(captionText, 7), y: 42, size: 7, font, color: muted })

  const bytes = await pdf.save()
  return new Blob([new Uint8Array(bytes)], { type: 'application/pdf' })
}
