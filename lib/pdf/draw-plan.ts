import type { Rect } from '@/lib/palette/packing'
import { sanitizeForPDF } from './sanitize'

type PdfPage = import('pdf-lib').PDFPage
type RgbFn = typeof import('pdf-lib').rgb
type PdfFont = import('pdf-lib').PDFFont

// Plan de couche coté, vue de dessus (longueur à l'horizontale), dans le rectangle (x, y, w, h)
export function drawPlan(
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
