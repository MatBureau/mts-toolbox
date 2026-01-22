'use client'

import Link from 'next/link'
import { categories, getToolsByCategory } from '@/lib/tools-config'
import Card, { CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import FadeIn from '@/components/ui/FadeIn'
import { motion } from 'framer-motion'

export default function CategoriesPage() {
  return (
    <div className="max-w-6xl mx-auto">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Toutes nos catégories
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          Explorez nos {categories.length} catégories d'outils en ligne gratuits
        </p>
      </motion.div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category, index) => {
          const categoryTools = getToolsByCategory(category.slug)

          return (
            <FadeIn key={category.id} delay={index * 0.05}>
              <Link href={`/${category.slug}`}>
                <Card hover>
                  <CardHeader>
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-5xl">{category.icon}</span>
                      <span className="text-xs font-semibold bg-gradient-to-r from-[#2656D9] to-[#6789E4] text-white px-3 py-1 rounded-full">
                        {categoryTools.length} outils
                      </span>
                    </div>
                    <CardTitle className="text-2xl mb-2">{category.name}</CardTitle>
                    <CardDescription className="text-base">
                      {category.description}
                    </CardDescription>

                    {/* Preview of some tools */}
                    {categoryTools.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase">
                          Outils populaires
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {categoryTools.slice(0, 3).map((tool) => (
                            <span
                              key={tool.id}
                              className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded"
                            >
                              {tool.icon} {tool.name}
                            </span>
                          ))}
                          {categoryTools.length > 3 && (
                            <span className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1">
                              +{categoryTools.length - 3} autres
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </CardHeader>
                </Card>
              </Link>
            </FadeIn>
          )
        })}
      </div>

      {/* Stats Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-16 text-center"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="text-4xl font-bold bg-gradient-to-r from-[#2656D9] to-[#6789E4] bg-clip-text text-transparent mb-2">
              {categories.length}
            </div>
            <p className="text-gray-600 dark:text-gray-400">Catégories</p>
          </div>
          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="text-4xl font-bold bg-gradient-to-r from-[#2656D9] to-[#6789E4] bg-clip-text text-transparent mb-2">
              {categories.reduce((sum, cat) => sum + getToolsByCategory(cat.slug).length, 0)}+
            </div>
            <p className="text-gray-600 dark:text-gray-400">Outils disponibles</p>
          </div>
          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="text-4xl font-bold bg-gradient-to-r from-[#2656D9] to-[#6789E4] bg-clip-text text-transparent mb-2">
              100%
            </div>
            <p className="text-gray-600 dark:text-gray-400">Gratuits</p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
