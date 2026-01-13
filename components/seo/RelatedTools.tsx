import Link from 'next/link'
import { Tool, tools } from '@/lib/tools-config'

interface RelatedToolsProps {
  currentTool: Tool
}

const relatedToolsMapping: Record<string, string[]> = {
  // PDF tools
  'editeur-pdf': ['fusionner-pdf', 'decouper-pdf', 'compresser-pdf', 'rotation-pdf'],
  'fusionner-pdf': ['editeur-pdf', 'decouper-pdf', 'images-vers-pdf', 'compresser-pdf'],
  'decouper-pdf': ['fusionner-pdf', 'editeur-pdf', 'rotation-pdf', 'pdf-vers-images'],
  'compresser-pdf': ['editeur-pdf', 'fusionner-pdf', 'decouper-pdf'],
  'rotation-pdf': ['editeur-pdf', 'decouper-pdf', 'fusionner-pdf'],
  'images-vers-pdf': ['pdf-vers-images', 'fusionner-pdf', 'compresser-pdf'],
  'pdf-vers-images': ['images-vers-pdf', 'editeur-pdf', 'convertisseur-images'],

  // Text tools
  'compteur-mots': ['comparateur-texte', 'inverseur-texte', 'suppression-accents'],
  'convertisseur-casse': ['inverseur-texte', 'suppression-accents', 'generateur-slug'],
  'lorem-ipsum': ['generateur-noms', 'compteur-mots'],
  'suppression-accents': ['convertisseur-casse', 'generateur-slug', 'inverseur-texte'],
  'inverseur-texte': ['convertisseur-casse', 'suppression-accents'],
  'encodeur-url': ['encodeur-base64', 'generateur-slug'],
  'encodeur-base64': ['encodeur-url', 'convertisseur-image-base64'],
  'generateur-slug': ['encodeur-url', 'suppression-accents'],
  'extracteur-emails': ['comparateur-texte', 'compteur-mots'],
  'comparateur-texte': ['compteur-mots', 'extracteur-emails'],

  // Dev tools
  'formateur-json': ['validateur-json', 'convertisseur-json-csv', 'minificateur'],
  'validateur-json': ['formateur-json', 'convertisseur-json-csv'],
  'formateur-sql': ['formateur-json', 'formateur-html-css'],
  'formateur-html-css': ['minificateur', 'formateur-sql'],
  'minificateur': ['formateur-json', 'formateur-html-css'],
  'testeur-regex': ['formateur-json', 'extracteur-emails'],
  'generateur-password': ['generateur-uuid', 'decodeur-jwt'],
  'generateur-uuid': ['generateur-password'],
  'convertisseur-json-csv': ['formateur-json', 'validateur-json'],
  'decodeur-jwt': ['encodeur-base64', 'validateur-json'],

  // Image tools
  'convertisseur-images': ['compresseur-images', 'redimensionneur-images', 'pdf-vers-images'],
  'compresseur-images': ['convertisseur-images', 'redimensionneur-images'],
  'redimensionneur-images': ['convertisseur-images', 'compresseur-images'],
  'generateur-favicon': ['convertisseur-images', 'redimensionneur-images'],
  'extracteur-palette': ['generateur-palette-couleurs', 'generateur-gradient'],
  'convertisseur-image-base64': ['convertisseur-images', 'encodeur-base64'],
  'generateur-placeholder': ['convertisseur-images', 'redimensionneur-images'],

  // Calculation tools
  'calculateur-pourcentage': ['calculateur-tva', 'calculateur-pret'],
  'convertisseur-unites': ['convertisseur-tailles', 'convertisseur-devises'],
  'convertisseur-tailles': ['convertisseur-unites'],
  'calculateur-tva': ['calculateur-pourcentage', 'calculateur-salaire'],
  'calculateur-salaire': ['calculateur-tva', 'calculateur-pret'],
  'convertisseur-devises': ['convertisseur-unites', 'calculateur-pourcentage'],
  'calculateur-age': ['calculateur-dates'],
  'calculateur-dates': ['calculateur-age', 'convertisseur-fuseaux'],
  'convertisseur-fuseaux': ['horloge-mondiale', 'calculateur-dates'],
  'calculateur-pret': ['calculateur-tva', 'calculateur-salaire'],

  // Generators
  'generateur-qrcode': ['generateur-codebarre', 'generateur-uuid'],
  'generateur-codebarre': ['generateur-qrcode'],
  'generateur-mentions-legales': ['generateur-politique-confidentialite'],
  'generateur-politique-confidentialite': ['generateur-mentions-legales'],
  'generateur-palette-couleurs': ['generateur-gradient', 'extracteur-palette'],
  'generateur-gradient': ['generateur-palette-couleurs', 'generateur-box-shadow'],
  'generateur-box-shadow': ['generateur-gradient', 'formateur-html-css'],
  'generateur-noms': ['lorem-ipsum', 'generateur-password'],

  // Utilities
  'minuteur': ['compteur-rebours', 'horloge-mondiale'],
  'horloge-mondiale': ['convertisseur-fuseaux', 'minuteur'],
  'detecteur-ip': ['testeur-regex'],
  'test-frappe': ['compteur-mots'],
  'compteur-rebours': ['minuteur', 'calculateur-dates'],

  // Métiers
  'maconnerie': ['calculateur-pourcentage', 'convertisseur-unites', 'calculateur-tva'],
}

export default function RelatedTools({ currentTool }: RelatedToolsProps) {
  const relatedIds = relatedToolsMapping[currentTool.slug] || []

  if (relatedIds.length === 0) {
    // Fallback: show tools from the same category
    const relatedTools = tools
      .filter(tool => tool.category === currentTool.category && tool.id !== currentTool.id)
      .slice(0, 4)

    if (relatedTools.length === 0) {
      return null
    }

    return (
      <section className="mt-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          Outils similaires
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {relatedTools.map((tool) => (
            <Link
              key={tool.id}
              href={`/${tool.category}/${tool.slug}`}
              className="flex items-start space-x-3 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
            >
              <span className="text-2xl">{tool.icon}</span>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                  {tool.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {tool.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    )
  }

  const relatedTools = relatedIds
    .map(id => tools.find(t => t.slug === id))
    .filter((tool): tool is Tool => tool !== undefined)
    .slice(0, 4)

  return (
    <section className="mt-8">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        Outils similaires
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {relatedTools.map((tool) => (
          <Link
            key={tool.id}
            href={`/${tool.category}/${tool.slug}`}
            className="flex items-start space-x-3 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
          >
            <span className="text-2xl">{tool.icon}</span>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                {tool.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {tool.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
