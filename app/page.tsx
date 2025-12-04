import Link from 'next/link'
import Card, { CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { categories, getToolsByCategory } from '@/lib/tools-config'
import JsonLd from '@/components/seo/JsonLd'

export default function HomePage() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'MTS-Toolbox',
    description: 'Collection d\'outils en ligne gratuits',
    url: 'https://mts-toolbox.com',
  }

  return (
    <>
      <JsonLd data={structuredData} />

      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            MTS-Toolbox
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            50+ outils en ligne gratuits pour tous vos besoins
          </p>
        </div>

        <div className="space-y-12">
          {categories.map((category) => {
            const tools = getToolsByCategory(category.slug)

            // Ne pas afficher les catégories sans outils
            if (tools.length === 0) return null

            return (
              <section key={category.id}>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl">{category.icon}</span>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {category.name}
                      </h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {category.description}
                      </p>
                    </div>
                  </div>
                  {tools.length > 9 && (
                    <Link
                      href={`/${category.slug}`}
                      className="text-primary-600 hover:text-primary-700 font-medium text-sm whitespace-nowrap"
                    >
                      Voir tout ({tools.length}) →
                    </Link>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {tools.slice(0, 9).map((tool) => (
                    <Card key={tool.id} href={`/${tool.category}/${tool.slug}`} hover>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <span className="text-2xl">{tool.icon}</span>
                        </div>
                        <CardTitle>{tool.name}</CardTitle>
                        <CardDescription>{tool.description}</CardDescription>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      </div>
    </>
  )
}
