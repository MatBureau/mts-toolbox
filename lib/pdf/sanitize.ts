/**
 * Nettoie le texte pour les fonts standard PDF (WinAnsi encoding)
 * Remplace les caractères Unicode non supportés par leurs équivalents ASCII
 */
export function sanitizeForPDF(text: string): string {
  return text
    .replace(/ /g, ' ')  // Narrow no-break space → space
    .replace(/ /g, ' ')  // No-break space → space
    .replace(/ /g, ' ')  // Thin space → space
    .replace(/–/g, '-')  // En dash → hyphen
    .replace(/—/g, '-')  // Em dash → hyphen
    .replace(/’/g, "'")  // Right single quote → apostrophe
    .replace(/‘/g, "'")  // Left single quote → apostrophe
    .replace(/“/g, '"')  // Left double quote → quote
    .replace(/”/g, '"')  // Right double quote → quote
    .replace(/…/g, '...') // Ellipsis → three dots
    .replace(/²/g, '2')  // Superscript 2 → 2
    .replace(/³/g, '3')  // Superscript 3 → 3
    .replace(/≈/g, '~')  // Approximately equal → tilde
    .replace(/≤/g, '<=') // Less than or equal → <=
    .replace(/≥/g, '>=') // Greater than or equal → >=
    .replace(/×/g, 'x')  // Multiplication sign → x
    .replace(/÷/g, '/')  // Division sign → /
    // Tout autre caractère hors WinAnsi (emoji, autres alphabets) ferait échouer pdf-lib
    .replace(/[^\u0000-ÿŒœŠšŸŽžƒˆ˜†-•‰‹›€™]/gu, '?')
}
