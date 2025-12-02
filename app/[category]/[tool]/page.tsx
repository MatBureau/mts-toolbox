import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getToolBySlug, getCategoryBySlug } from '@/lib/tools-config'
import { generateToolMetadata, generateStructuredData, generateBreadcrumbStructuredData } from '@/lib/seo'
import JsonLd from '@/components/seo/JsonLd'
import AdBanner from '@/components/ads/AdBanner'

// Import dynamic tool components
import dynamic from 'next/dynamic'

const toolComponents: Record<string, any> = {
  // Texte
  'compteur-mots': dynamic(() => import('@/components/tools/CompteurMots')),
  'convertisseur-casse': dynamic(() => import('@/components/tools/ConvertisseurCasse')),
  'lorem-ipsum': dynamic(() => import('@/components/tools/LoremIpsum')),
  'suppression-accents': dynamic(() => import('@/components/tools/SuppressionAccents')),
  'inverseur-texte': dynamic(() => import('@/components/tools/InverseurTexte')),
  'encodeur-url': dynamic(() => import('@/components/tools/EncodeurURL')),
  'encodeur-base64': dynamic(() => import('@/components/tools/EncodeurBase64')),
  'generateur-slug': dynamic(() => import('@/components/tools/GenerateurSlug')),
  'extracteur-emails': dynamic(() => import('@/components/tools/ExtracteurEmails')),
  'comparateur-texte': dynamic(() => import('@/components/tools/ComparateurTexte')),
  // Développement
  'formateur-json': dynamic(() => import('@/components/tools/FormateurJSON')),
  'formateur-sql': dynamic(() => import('@/components/tools/FormateurSQL')),
  'formateur-html-css': dynamic(() => import('@/components/tools/FormateurHTMLCSS')),
  'minificateur': dynamic(() => import('@/components/tools/Minificateur')),
  'testeur-regex': dynamic(() => import('@/components/tools/TesteurRegex')),
  'generateur-password': dynamic(() => import('@/components/tools/GenerateurPassword')),
  'generateur-uuid': dynamic(() => import('@/components/tools/GenerateurUUID')),
  'convertisseur-json-csv': dynamic(() => import('@/components/tools/ConvertisseurJSONCSV')),
  'validateur-json': dynamic(() => import('@/components/tools/ValidateurJSON')),
  'decodeur-jwt': dynamic(() => import('@/components/tools/DecodeurJWT')),
  // Calcul & Conversion
  'calculateur-pourcentage': dynamic(() => import('@/components/tools/CalculateurPourcentage')),
  'convertisseur-unites': dynamic(() => import('@/components/tools/ConvertisseurUnites')),
  'calculateur-tva': dynamic(() => import('@/components/tools/CalculateurTVA')),
  'calculateur-age': dynamic(() => import('@/components/tools/CalculateurAge')),
  'calculateur-dates': dynamic(() => import('@/components/tools/CalculateurDates')),
  // Générateurs
  'generateur-qrcode': dynamic(() => import('@/components/tools/GenerateurQRCode')),
  'generateur-gradient': dynamic(() => import('@/components/tools/GenerateurGradient')),
  'generateur-box-shadow': dynamic(() => import('@/components/tools/GenerateurBoxShadow')),
  'generateur-palette-couleurs': dynamic(() => import('@/components/tools/GenerateurPaletteCouleurs')),
  // Utilitaires
  'minuteur': dynamic(() => import('@/components/tools/Minuteur')),
  'detecteur-ip': dynamic(() => import('@/components/tools/DetecteurIP')),
}

interface ToolPageProps {
  params: {
    category: string
    tool: string
  }
}

export async function generateMetadata({ params }: ToolPageProps): Promise<Metadata> {
  const tool = getToolBySlug(params.category, params.tool)

  if (!tool) {
    return {}
  }

  const metadata = generateToolMetadata(tool)

  return {
    title: metadata.title,
    description: metadata.description,
    keywords: metadata.keywords,
    openGraph: {
      title: metadata.title,
      description: metadata.description,
      url: metadata.canonical,
    },
    twitter: {
      card: 'summary',
      title: metadata.title,
      description: metadata.description,
    },
    alternates: {
      canonical: metadata.canonical,
    },
  }
}

export default function ToolPage({ params }: ToolPageProps) {
  const tool = getToolBySlug(params.category, params.tool)
  const category = getCategoryBySlug(params.category)

  if (!tool || !category) {
    notFound()
  }

  const structuredData = generateStructuredData(tool)
  const breadcrumbData = generateBreadcrumbStructuredData(
    category.slug,
    category.name,
    tool.name,
    tool.slug
  )

  const ToolComponent = toolComponents[tool.slug]

  return (
    <>
      <JsonLd data={structuredData} />
      <JsonLd data={breadcrumbData} />

      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            <div className="mb-6">
              <div className="flex items-center space-x-3 mb-2">
                <span className="text-4xl">{tool.icon}</span>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100">
                  {tool.name}
                </h1>
              </div>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                {tool.description}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              {ToolComponent ? <ToolComponent /> : <p>Outil en cours de développement...</p>}
            </div>

            <div className="mt-8 md:hidden flex justify-center">
              <AdBanner id="ad-content" width={336} height={280} />
            </div>
          </div>

          <div className="hidden lg:block">
            <div className="sticky top-24 space-y-6">
              <AdBanner id="ad-sidebar" width={300} height={250} />
              <AdBanner id="ad-sidebar-2" width={300} height={250} />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
