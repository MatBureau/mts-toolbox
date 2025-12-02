import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Card, { CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { getCategoryBySlug, getToolsByCategory } from '@/lib/tools-config'
import JsonLd from '@/components/seo/JsonLd'
import { generateBreadcrumbStructuredData } from '@/lib/seo'

interface CategoryPageProps {
  params: {
    category: string
  }
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const category = getCategoryBySlug(params.category)

  if (!category) {
    return {}
  }

  return {
    title: `${category.name} — Outils en ligne gratuits | MTS-Toolbox`,
    description: `${category.description}. Découvrez tous nos outils gratuits pour ${category.name.toLowerCase()}.`,
    openGraph: {
      title: `${category.name} — Outils en ligne gratuits | MTS-Toolbox`,
      description: `${category.description}. Découvrez tous nos outils gratuits pour ${category.name.toLowerCase()}.`,
    },
  }
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const category = getCategoryBySlug(params.category)

  if (!category) {
    notFound()
  }

  const tools = getToolsByCategory(category.slug)
  const breadcrumbData = generateBreadcrumbStructuredData(category.slug, category.name)

  return (
    <>
      <JsonLd data={breadcrumbData} />

      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <span className="text-4xl">{category.icon}</span>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100">
              {category.name}
            </h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            {category.description}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool) => (
            <Card key={tool.id} href={`/${tool.category}/${tool.slug}`} hover>
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <span className="text-3xl">{tool.icon}</span>
                </div>
                <CardTitle>{tool.name}</CardTitle>
                <CardDescription>{tool.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </>
  )
}
