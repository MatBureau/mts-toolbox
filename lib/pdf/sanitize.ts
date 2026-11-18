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
    // Les caractères de contrôle (retour à la ligne, tabulation, C1...) font échouer pdf-lib
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, ' ')
    // Tout autre caractère hors WinAnsi (emoji, autres alphabets) ferait échouer pdf-lib
    .replace(/[^\u0020-\u007E\u00A0-\u00FF\u0152\u0153\u0160\u0161\u0178\u017D\u017E\u0192\u02C6\u02DC\u2020\u2021\u2022\u2030\u2039\u203A\u20AC\u2122\u201A\u201E\u2026\u2013\u2014\u2018\u2019\u201C\u201D]/gu, '?')
}
