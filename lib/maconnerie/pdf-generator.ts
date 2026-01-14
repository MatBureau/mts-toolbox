import { MaconnerieProject, ProjectTotals } from './types'
import { formatNumber, getDosageConfig } from './calculations'
import { ELEMENT_LABELS, DOSAGE_LABELS } from './constants'

/**
 * Nettoie le texte pour les fonts standard PDF (WinAnsi encoding)
 * Remplace les caractères Unicode non supportés par leurs équivalents ASCII
 */
function sanitizeForPDF(text: string): string {
  return text
    .replace(/\u202F/g, ' ')  // Narrow no-break space → space
    .replace(/\u00A0/g, ' ')  // No-break space → space
    .replace(/\u2009/g, ' ')  // Thin space → space
    .replace(/\u2013/g, '-')  // En dash → hyphen
    .replace(/\u2014/g, '-')  // Em dash → hyphen
    .replace(/\u2019/g, "'")  // Right single quote → apostrophe
    .replace(/\u2018/g, "'")  // Left single quote → apostrophe
    .replace(/\u201C/g, '"')  // Left double quote → quote
    .replace(/\u201D/g, '"')  // Right double quote → quote
    .replace(/\u2026/g, '...') // Ellipsis → three dots
    .replace(/\u00B2/g, '2')  // Superscript 2 → 2
    .replace(/\u00B3/g, '3')  // Superscript 3 → 3
}

/**
 * Génère un PDF récapitulatif du projet (lazy import pdf-lib)
 */
export async function generateProjectPDF(
  project: MaconnerieProject,
  totals: ProjectTotals
): Promise<Blob> {
  // Import dynamique pour ne pas alourdir le bundle
  const { PDFDocument, rgb, StandardFonts } = await import('pdf-lib')

  const pdfDoc = await PDFDocument.create()
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

  let page = pdfDoc.addPage([595, 842]) // A4
  const { width, height } = page.getSize()
  const margin = 50
  let y = height - 50

  const drawText = (text: string, options: {
    x?: number
    size?: number
    bold?: boolean
    color?: { r: number; g: number; b: number }
  } = {}) => {
    const { x = margin, size = 10, bold = false, color = { r: 0.1, g: 0.1, b: 0.1 } } = options
    page.drawText(sanitizeForPDF(text), {
      x,
      y,
      size,
      font: bold ? helveticaBold : helvetica,
      color: rgb(color.r, color.g, color.b),
    })
  }

  const addNewPageIfNeeded = (neededSpace: number = 100) => {
    if (y < neededSpace) {
      page = pdfDoc.addPage([595, 842])
      y = height - 50
    }
  }

  // === EN-TÊTE ===
  drawText(`Devis Maçonnerie`, { size: 20, bold: true })
  y -= 25
  drawText(project.nom, { size: 14, bold: true })
  y -= 20
  drawText(`Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`, {
    size: 9,
    color: { r: 0.5, g: 0.5, b: 0.5 },
  })

  // === ÉLÉMENTS DU PROJET ===
  y -= 35
  drawText('Éléments du projet', { size: 14, bold: true })
  y -= 5
  page.drawLine({
    start: { x: margin, y },
    end: { x: width - margin, y },
    thickness: 1,
    color: rgb(0.8, 0.8, 0.8),
  })
  y -= 20

  for (const element of project.elements) {
    addNewPageIfNeeded(80)

    const result = totals.elements[element.id]
    const typeLabel = ELEMENT_LABELS[element.type]

    // Nom et type
    drawText(`${element.nom}`, { bold: true, size: 11 })
    drawText(`(${typeLabel})`, { x: margin + 200, size: 10, color: { r: 0.4, g: 0.4, b: 0.4 } })
    y -= 15

    // Dimensions selon le type
    let dimensions = ''
    switch (element.type) {
      case 'dalle':
        dimensions = `${formatNumber(element.longueur)} × ${formatNumber(element.largeur)} m, ép. ${element.epaisseur} cm`
        break
      case 'mur':
        dimensions = `${formatNumber(element.longueur)} × ${formatNumber(element.hauteur)} m, ép. ${element.epaisseur} cm`
        break
      case 'semelle':
        dimensions = `${formatNumber(element.longueur)} × ${formatNumber(element.largeur)} m, h. ${element.hauteur} cm`
        break
      case 'ouverture':
        dimensions = `${formatNumber(element.largeur)} × ${formatNumber(element.hauteur)} m × ${element.quantite}`
        break
    }
    drawText(`   Dimensions : ${dimensions}`, { size: 9 })
    y -= 13

    // Volume
    const volumeSign = result.volume < 0 ? '−' : ''
    drawText(`   Volume : ${volumeSign}${formatNumber(Math.abs(result.volume), 3)} m³`, { size: 9 })
    y -= 20
  }

  // === RÉCAPITULATIF VOLUMES ===
  addNewPageIfNeeded(150)
  y -= 15
  drawText('Récapitulatif des volumes', { size: 14, bold: true })
  y -= 5
  page.drawLine({
    start: { x: margin, y },
    end: { x: width - margin, y },
    thickness: 1,
    color: rgb(0.8, 0.8, 0.8),
  })
  y -= 20

  drawText(`Volume total béton :`, { size: 11 })
  drawText(`${formatNumber(totals.volumeTotal, 3)} m³`, { x: 250, size: 11, bold: true })
  y -= 15

  if (totals.volumeTotalArrondi) {
    drawText(`Volume arrondi (toupie) :`, { size: 11 })
    drawText(`${formatNumber(totals.volumeTotalArrondi, 2)} m³`, { x: 250, size: 11, bold: true })
    y -= 15
  }

  // === QUANTITÉS MATÉRIAUX ===
  y -= 20
  drawText('Quantités de matériaux estimées', { size: 14, bold: true })
  y -= 5
  page.drawLine({
    start: { x: margin, y },
    end: { x: width - margin, y },
    thickness: 1,
    color: rgb(0.8, 0.8, 0.8),
  })
  y -= 20

  const materials = [
    ['Ciment :', `${formatNumber(totals.cimentTotal, 0)} kg (${totals.sacsCiment} sacs de ${project.poidsSac} kg)`],
    ['Sable :', `${formatNumber(totals.sableM3, 2)} m³ (≈ ${formatNumber(totals.sableTonnes, 2)} tonnes)`],
    ['Gravier :', `${formatNumber(totals.gravierM3, 2)} m³ (≈ ${formatNumber(totals.gravierTonnes, 2)} tonnes)`],
    ['Eau :', `${formatNumber(totals.eauTotal, 0)} litres`],
  ]

  for (const [label, value] of materials) {
    drawText(label, { size: 11 })
    drawText(value, { x: 150, size: 11, bold: true })
    y -= 15
  }

  // === PARAMÈTRES ===
  addNewPageIfNeeded(120)
  y -= 20
  drawText('Paramètres utilisés', { size: 12, bold: true })
  y -= 5
  page.drawLine({
    start: { x: margin, y },
    end: { x: width - margin, y },
    thickness: 1,
    color: rgb(0.8, 0.8, 0.8),
  })
  y -= 18

  const dosage = getDosageConfig(project)
  const params = [
    `Dosage : ${DOSAGE_LABELS[project.dosageType]} — ${dosage.cimentKgM3} kg/m³`,
    `Ratio granulats : ciment 1 / sable ${dosage.sableParts} / gravier ${dosage.gravierParts}`,
    `Pertes estimées : ${project.pertes}%`,
    `Densité sable : ${project.densiteSable} kg/m³ — Densité gravier : ${project.densiteGravier} kg/m³`,
  ]

  for (const param of params) {
    drawText(param, { size: 9, color: { r: 0.3, g: 0.3, b: 0.3 } })
    y -= 12
  }

  // === DISCLAIMER ===
  y -= 25
  page.drawRectangle({
    x: margin,
    y: y - 35,
    width: width - 2 * margin,
    height: 40,
    color: rgb(0.97, 0.97, 0.97),
    borderColor: rgb(0.85, 0.85, 0.85),
    borderWidth: 1,
  })
  y -= 15
  drawText('/!\\ Estimations indicatives', { x: margin + 10, size: 9, bold: true })
  y -= 12
  drawText('Ces calculs sont fournis à titre indicatif. Les quantités réelles peuvent varier selon', { x: margin + 10, size: 8, color: { r: 0.4, g: 0.4, b: 0.4 } })
  y -= 10
  drawText('les conditions du chantier, la qualité des matériaux et les techniques de mise en œuvre.', { x: margin + 10, size: 8, color: { r: 0.4, g: 0.4, b: 0.4 } })

  // === FOOTER ===
  page.drawText(sanitizeForPDF('Généré avec MTS-Toolbox - mts-toolbox.com/metiers/maconnerie'), {
    x: margin,
    y: 30,
    size: 8,
    font: helvetica,
    color: rgb(0.6, 0.6, 0.6),
  })

  // Génération du blob
  const pdfBytes = await pdfDoc.save()
  return new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' })
}
