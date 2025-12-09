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
import TrackView from '@/components/TrackView'
import Breadcrumbs from '@/components/ui/Breadcrumbs'

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
  'analyseur-densite': dynamic(() => import('@/components/tools/AnalyseurDensite')),
  'nettoyeur-texte': dynamic(() => import('@/components/tools/NettoyeurTexte')),
  'convertisseur-texte-html': dynamic(() => import('@/components/tools/ConvertisseurTexteHTML')),
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
  'convertisseur-yaml': dynamic(() => import('@/components/tools/ConvertisseurYAML')),
  'generateur-hash': dynamic(() => import('@/components/tools/GenerateurHash')),
  'validateur-json-schema': dynamic(() => import('@/components/tools/ValidateurJSONSchema')),
  // Images
  'convertisseur-images': dynamic(() => import('@/components/tools/ConvertisseurImages')),
  'compresseur-images': dynamic(() => import('@/components/tools/CompresseurImages')),
  'redimensionneur-images': dynamic(() => import('@/components/tools/RedimensionneurImages')),
  'generateur-favicon': dynamic(() => import('@/components/tools/GenerateurFavicon')),
  'extracteur-palette': dynamic(() => import('@/components/tools/ExtracteurPalette')),
  'convertisseur-image-base64': dynamic(() => import('@/components/tools/ConvertisseurImageBase64')),
  'generateur-placeholder': dynamic(() => import('@/components/tools/GenerateurPlaceholder')),
  'recadrage-image': dynamic(() => import('@/components/tools/RecadrageImage')),
  'filigrane-image': dynamic(() => import('@/components/tools/FiligraneImage')),
  'convertisseur-heic': dynamic(() => import('@/components/tools/ConvertisseurHEIC')),
  // PDF
  'editeur-pdf': dynamic(() => import('@/components/tools/EditeurPDF')),
  'fusionner-pdf': dynamic(() => import('@/components/tools/FusionnerPDF')),
  'decouper-pdf': dynamic(() => import('@/components/tools/DecouperPDF')),
  'compresser-pdf': dynamic(() => import('@/components/tools/CompresserPDF')),
  'rotation-pdf': dynamic(() => import('@/components/tools/RotationPDF')),
  'images-vers-pdf': dynamic(() => import('@/components/tools/ImagesVersPDF')),
  'pdf-vers-images': dynamic(() => import('@/components/tools/PDFVersImages')),
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
  'simulateur-interets': dynamic(() => import('@/components/tools/SimulateurInterets')),
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
  'tirage-au-sort': dynamic(() => import('@/components/tools/TirageAuSort')),
  'bloc-notes': dynamic(() => import('@/components/tools/BlocNotes')),
  // SEO & Web
  'previsualisation-serp': dynamic(() => import('@/components/tools/PrevisualisationSerp')),
  'generateur-robots': dynamic(() => import('@/components/tools/GenerateurRobots')),
  'verificateur-meta': dynamic(() => import('@/components/tools/VerificateurMeta')),
  'generateur-sitemap': dynamic(() => import('@/components/tools/GenerateurSitemap')),
  'analyseur-onpage': dynamic(() => import('@/components/tools/AnalyseurOnPage')),
}

interface ToolPageProps {
  params: Promise<{
    category: string
    tool: string
  }>
}

export async function generateMetadata({ params }: ToolPageProps): Promise<Metadata> {
  const { category, tool: toolSlug } = await params
  const tool = getToolBySlug(category, toolSlug)

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

export default async function ToolPage({ params }: ToolPageProps) {
  const { category: categorySlug, tool: toolSlug } = await params
  const tool = getToolBySlug(categorySlug, toolSlug)
  const category = getCategoryBySlug(categorySlug)

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
      <TrackView toolSlug={tool.slug} />
      <JsonLd data={structuredData} />
      <JsonLd data={breadcrumbData} />
      <JsonLd data={organizationData} />
      {howToData && <JsonLd data={howToData} />}
      {faqData && <JsonLd data={faqData} />}

      <div className="max-w-6xl mx-auto">
        <div className="mb-4">
          <Breadcrumbs />
        </div>

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
