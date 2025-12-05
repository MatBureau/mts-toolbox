import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getToolBySlug, getCategoryBySlug } from '@/lib/tools-config'
import { generateToolMetadata, generateStructuredData, generateBreadcrumbStructuredData, generateHowToStructuredData, generateFAQStructuredData, generateOrganizationStructuredData } from '@/lib/seo'
import { getToolSEOData } from '@/lib/tool-seo-data'
import JsonLd from '@/components/seo/JsonLd'
import AdBanner from '@/components/ads/AdBanner'
import ToolContent from '@/components/seo/ToolContent'
import FAQ from '@/components/seo/FAQ'
import RelatedTools from '@/components/seo/RelatedTools'

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
  // Images
  'convertisseur-images': dynamic(() => import('@/components/tools/ConvertisseurImages')),
  'compresseur-images': dynamic(() => import('@/components/tools/CompresseurImages')),
  'redimensionneur-images': dynamic(() => import('@/components/tools/RedimensionneurImages')),
  'generateur-favicon': dynamic(() => import('@/components/tools/GenerateurFavicon')),
  'extracteur-palette': dynamic(() => import('@/components/tools/ExtracteurPalette')),
  'convertisseur-image-base64': dynamic(() => import('@/components/tools/ConvertisseurImageBase64')),
  'generateur-placeholder': dynamic(() => import('@/components/tools/GenerateurPlaceholder')),
  // PDF
  'editeur-pdf': dynamic(() => import('@/components/tools/EditeurPDF'), { ssr: false }),
  'fusionner-pdf': dynamic(() => import('@/components/tools/FusionnerPDF'), { ssr: false }),
  'decouper-pdf': dynamic(() => import('@/components/tools/DecouperPDF'), { ssr: false }),
  'compresser-pdf': dynamic(() => import('@/components/tools/CompresserPDF'), { ssr: false }),
  'rotation-pdf': dynamic(() => import('@/components/tools/RotationPDF'), { ssr: false }),
  'images-vers-pdf': dynamic(() => import('@/components/tools/ImagesVersPDF'), { ssr: false }),
  'pdf-vers-images': dynamic(() => import('@/components/tools/PDFVersImages'), { ssr: false }),
  // Calcul & Conversion
  'calculateur-pourcentage': dynamic(() => import('@/components/tools/CalculateurPourcentage')),
  'convertisseur-unites': dynamic(() => import('@/components/tools/ConvertisseurUnites')),
  'convertisseur-tailles': dynamic(() => import('@/components/tools/ConvertisseurTailles')),
  'calculateur-tva': dynamic(() => import('@/components/tools/CalculateurTVA')),
  'calculateur-salaire': dynamic(() => import('@/components/tools/CalculateurSalaire')),
  'convertisseur-devises': dynamic(() => import('@/components/tools/ConvertisseurDevises')),
  'calculateur-age': dynamic(() => import('@/components/tools/CalculateurAge')),
  'calculateur-dates': dynamic(() => import('@/components/tools/CalculateurDates')),
  'convertisseur-fuseaux': dynamic(() => import('@/components/tools/ConvertisseurFuseaux')),
  'calculateur-pret': dynamic(() => import('@/components/tools/CalculateurPret')),
  // Générateurs
  'generateur-qrcode': dynamic(() => import('@/components/tools/GenerateurQRCode')),
  'generateur-codebarre': dynamic(() => import('@/components/tools/GenerateurCodeBarre')),
  'generateur-mentions-legales': dynamic(() => import('@/components/tools/GenerateurMentionsLegales')),
  'generateur-politique-confidentialite': dynamic(() => import('@/components/tools/GenerateurPolitiqueConfidentialite')),
  'generateur-palette-couleurs': dynamic(() => import('@/components/tools/GenerateurPaletteCouleurs')),
  'generateur-gradient': dynamic(() => import('@/components/tools/GenerateurGradient')),
  'generateur-box-shadow': dynamic(() => import('@/components/tools/GenerateurBoxShadow')),
  'generateur-noms': dynamic(() => import('@/components/tools/GenerateurNoms')),
  // Utilitaires
  'minuteur': dynamic(() => import('@/components/tools/Minuteur')),
  'horloge-mondiale': dynamic(() => import('@/components/tools/HorlogeMondiale')),
  'detecteur-ip': dynamic(() => import('@/components/tools/DetecteurIP')),
  'test-frappe': dynamic(() => import('@/components/tools/TestFrappe')),
  'compteur-rebours': dynamic(() => import('@/components/tools/CompteurRebours')),
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
  const organizationData = generateOrganizationStructuredData()

  // Get SEO data for HowTo and FAQ
  const seoData = getToolSEOData(tool.slug)
  const howToData = seoData ? generateHowToStructuredData(tool, seoData.howToSteps) : null
  const faqData = seoData ? generateFAQStructuredData(seoData.faqs) : null

  const ToolComponent = toolComponents[tool.slug]

  return (
    <>
      <JsonLd data={structuredData} />
      <JsonLd data={breadcrumbData} />
      <JsonLd data={organizationData} />
      {howToData && <JsonLd data={howToData} />}
      {faqData && <JsonLd data={faqData} />}

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

            <ToolContent tool={tool} />

            <FAQ tool={tool} />

            <RelatedTools currentTool={tool} />

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
