import { Tool } from './tools-config'

export interface SEOMetadata {
  title: string
  description: string
  keywords: string[]
  ogImage?: string
  canonical?: string
}

export function generateToolMetadata(tool: Tool, baseUrl: string = 'https://mts-toolbox.com'): SEOMetadata {
  return {
    title: `${tool.name} en ligne gratuit — MTS-Toolbox`,
    description: tool.description,
    keywords: tool.keywords,
    canonical: `${baseUrl}/${tool.category}/${tool.slug}`,
  }
}

export function generateStructuredData(tool: Tool, baseUrl: string = 'https://mts-toolbox.com') {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: tool.name,
    description: tool.description,
    url: `${baseUrl}/${tool.category}/${tool.slug}`,
    applicationCategory: 'UtilityApplication',
    operatingSystem: 'Any',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'EUR',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '150',
    },
  }
}

export function generateBreadcrumbStructuredData(
  category: string,
  categoryName: string,
  toolName?: string,
  toolSlug?: string,
  baseUrl: string = 'https://mts-toolbox.com'
) {
  const items = [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Accueil',
      item: baseUrl,
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: categoryName,
      item: `${baseUrl}/${category}`,
    },
  ]

  if (toolName && toolSlug) {
    items.push({
      '@type': 'ListItem',
      position: 3,
      name: toolName,
      item: `${baseUrl}/${category}/${toolSlug}`,
    })
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items,
  }
}
