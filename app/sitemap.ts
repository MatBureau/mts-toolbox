import { MetadataRoute } from 'next'
import { categories, tools } from '@/lib/tools-config'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://mts-toolbox.com'

  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
  ]

  categories.forEach((category) => {
    routes.push({
      url: `${baseUrl}/${category.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    })
  })

  tools.forEach((tool) => {
    routes.push({
      url: `${baseUrl}/${tool.category}/${tool.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    })
  })

  const additionalPages = ['about', 'contact', 'mentions-legales', 'politique-confidentialite', 'blog']
  additionalPages.forEach((page) => {
    routes.push({
      url: `${baseUrl}/${page}`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    })
  })

  // Add blog posts to sitemap
  const blogPosts = [
    'comment-editer-pdf-gratuitement',
    'optimiser-images-web',
    'json-guide-debutant',
    'calculer-pourcentages-facilement'
  ]

  blogPosts.forEach((slug) => {
    routes.push({
      url: `${baseUrl}/blog/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    })
  })

  return routes
}
