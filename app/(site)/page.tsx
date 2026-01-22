'use client'

import { useState, useMemo, useEffect } from 'react'
import Card, { CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { categories, getToolsByCategory, tools } from '@/lib/tools-config'
import JsonLd from '@/components/seo/JsonLd'
import HeroSection from '@/components/HeroSection'
import { ToolCardSkeleton } from '@/components/ui/Skeleton'
import FadeIn from '@/components/ui/FadeIn'

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [topTools, setTopTools] = useState<Array<{ slug: string; views: number }>>([])
  const [loadingTop, setLoadingTop] = useState(true)

  // Récupérer les outils les plus vus
  useEffect(() => {
    fetch('/api/top-tools')
      .then(res => res.json())
      .then(data => {
        setTopTools(data.topTools || [])
        setLoadingTop(false)
      })
      .catch(err => {
        console.error('Failed to fetch top tools:', err)
        setLoadingTop(false)
      })
  }, [])

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'MTS-Toolbox',
    description: 'Collection d\'outils en ligne gratuits',
    url: 'https://mts-toolbox.com',
  }

  // Filtrer les outils selon la recherche
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) {
      return categories.map(cat => ({
        ...cat,
        tools: getToolsByCategory(cat.slug)
      }))
    }

    const query = searchQuery.toLowerCase()
    return categories.map(cat => {
      const categoryTools = getToolsByCategory(cat.slug).filter(tool =>
        tool.name.toLowerCase().includes(query) ||
        tool.description.toLowerCase().includes(query) ||
        tool.keywords.some(keyword => keyword.toLowerCase().includes(query))
      )
      return {
        ...cat,
        tools: categoryTools
      }
    }).filter(cat => cat.tools.length > 0)
  }, [searchQuery])

  const totalTools = tools.length
  const displayedTools = filteredCategories.reduce((sum, cat) => sum + cat.tools.length, 0)

  // Convertir les slugs des top tools en objets Tool complets
  const topToolsData = useMemo(() => {
    // Outils populaires par défaut (fallback si pas de stats)
    const defaultPopularTools = [
      'compteur-mots', 'formateur-json', 'convertisseur-images',
      'editeur-pdf', 'generateur-qrcode', 'encodeur-base64',
      'compresseur-images', 'generateur-password', 'calculateur-pourcentage',
      'fusionner-pdf', 'redimensionneur-images', 'convertisseur-devises'
    ]

    // Si on a des stats, on les utilise
    if (topTools.length > 0) {
      return topTools
        .map(({ slug, views }) => {
          const tool = tools.find(t => t.slug === slug)
          return tool ? { ...tool, views } : null
        })
        .filter(Boolean)
        .slice(0, 12)
    }

    // Sinon, on affiche les outils populaires par défaut
    return defaultPopularTools
      .map(slug => tools.find(t => t.slug === slug))
      .filter(Boolean)
      .map(tool => ({ ...tool, views: 0 }))
  }, [topTools])

  return (
    <>
      <JsonLd data={structuredData} />

      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <HeroSection onSearchClick={() => document.getElementById('search-input')?.focus()} />

        {/* Barre de recherche */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <input
                id="search-input"
                type="text"
                placeholder="Rechercher un outil... (ex: PDF, JSON, image)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-6 py-4 text-lg border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:border-[#2656D9] dark:focus:border-[#6789E4] bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-colors shadow-lg"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  ✕
                </button>
              )}
            </div>
            <div className="text-3xl">
              🔍
            </div>
          </div>
          {searchQuery && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              {displayedTools} outil{displayedTools > 1 ? 's' : ''} trouvé{displayedTools > 1 ? 's' : ''}
            </p>
          )}
        </div>

        {filteredCategories.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Aucun outil trouvé pour "{searchQuery}"
            </p>
            <button
              onClick={() => setSearchQuery('')}
              className="mt-4 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
            >
              Réinitialiser la recherche
            </button>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Section des outils les plus utilisés */}
            {!searchQuery && (
              <section>
                <div className="flex items-center space-x-3 mb-6">
                  <span className="text-3xl">🔥</span>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      Les plus utilisés
                      <span className="text-lg font-normal text-gray-500 dark:text-gray-400 ml-2">
                        (Top 12)
                      </span>
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Les outils préférés de nos utilisateurs
                    </p>
                  </div>
                </div>

                {loadingTop ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(12)].map((_, i) => (
                      <ToolCardSkeleton key={i} />
                    ))}
                  </div>
                ) : (
                  <>
                    {topTools.length === 0 && (
                      <div className="mb-4 text-center text-sm text-gray-500 dark:text-gray-400">
                        📊 Sélection d'outils populaires (les statistiques sont en cours de collecte)
                      </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {topToolsData.map((tool: any, index) => (
                        <FadeIn key={tool.id} delay={index * 0.02} className="h-full">
                          <Card href={`/${tool.category}/${tool.slug}`} hover>
                            <CardHeader>
                              <div className="flex items-start justify-between">
                                <span className="text-2xl">{tool.icon}</span>
                                {tool.views > 0 && (
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-semibold bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-300 px-2 py-1 rounded">
                                      #{index + 1}
                                    </span>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                      {tool.views} vues
                                    </span>
                                  </div>
                                )}
                              </div>
                              <CardTitle>{tool.name}</CardTitle>
                              <CardDescription className="line-clamp-2">{tool.description}</CardDescription>
                            </CardHeader>
                          </Card>
                        </FadeIn>
                      ))}
                    </div>
                  </>
                )}
              </section>
            )}

            {/* Catégories normales */}
            <div id="categories" className="space-y-12">
            {filteredCategories.map((category) => (
              <section key={category.id}>
                <div className="flex items-center space-x-3 mb-6">
                  <span className="text-3xl">{category.icon}</span>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {category.name}
                      <span className="text-lg font-normal text-gray-500 dark:text-gray-400 ml-2">
                        ({category.tools.length})
                      </span>
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {category.description}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {category.tools.map((tool, index) => (
                    <FadeIn key={tool.id} delay={index * 0.02} className="h-full">
                      <Card href={`/${tool.category}/${tool.slug}`} hover>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <span className="text-2xl">{tool.icon}</span>
                          </div>
                          <CardTitle>{tool.name}</CardTitle>
                          <CardDescription className="line-clamp-2">{tool.description}</CardDescription>
                        </CardHeader>
                      </Card>
                    </FadeIn>
                  ))}
                </div>
              </section>
            ))}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
