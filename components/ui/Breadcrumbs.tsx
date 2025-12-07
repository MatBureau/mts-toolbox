'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { categories, tools } from '@/lib/tools-config'

export default function Breadcrumbs() {
  const pathname = usePathname()

  if (pathname === '/') return null

  const segments = pathname.split('/').filter(Boolean)
  const breadcrumbs = [{ label: 'Accueil', href: '/' }]

  if (segments.length >= 1) {
    const category = categories.find(c => c.slug === segments[0])
    if (category) {
      breadcrumbs.push({ label: category.name, href: `/${category.slug}` })
    }
  }

  if (segments.length >= 2) {
    const tool = tools.find(t => t.slug === segments[1])
    if (tool) {
      breadcrumbs.push({ label: tool.name, href: `/${segments[0]}/${segments[1]}` })
    }
  }

  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
        {breadcrumbs.map((crumb, index) => (
          <li key={crumb.href} className="flex items-center">
            {index > 0 && (
              <svg
                className="w-4 h-4 mx-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            {index === breadcrumbs.length - 1 ? (
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {crumb.label}
              </span>
            ) : (
              <Link
                href={crumb.href}
                className="hover:text-[#2656D9] dark:hover:text-[#6789E4] transition-colors"
              >
                {crumb.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
