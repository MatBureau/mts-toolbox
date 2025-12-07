'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useTheme } from './ThemeProvider'
import { categories } from '@/lib/tools-config'
import MobileMenu from './MobileMenu'
import GooeyNav from './ui/GooeyNav'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function Header() {
  const { theme, toggleTheme } = useTheme()
  const pathname = usePathname()
  const [activeIndex, setActiveIndex] = useState(0)

  // Navigation items for GooeyNav
  const navItems = [
    { label: 'Accueil', href: '/' },
    { label: 'Catégories', href: '/categories' },
    ...categories.slice(0, 4).map((cat) => ({
      label: cat.name,
      href: `/${cat.slug}`
    })),
    { label: 'À propos', href: '/about' }
  ]

  // Update active index based on pathname
  useEffect(() => {
    const index = navItems.findIndex(item => {
      if (item.href === '/') {
        return pathname === '/'
      }
      return pathname.startsWith(item.href)
    })
    if (index !== -1) {
      setActiveIndex(index)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-3 group">
            <Image
              src="/logo.png"
              alt="MTS-Toolbox Logo"
              width={40}
              height={40}
              className="rounded group-hover:scale-110 transition-transform"
            />
            <span className="text-xl font-bold text-gray-900 dark:text-gray-100">MTS-Toolbox</span>
          </Link>

          <nav className="hidden md:flex items-center">
            <GooeyNav
              items={navItems}
              particleCount={12}
              particleDistances={[70, 8]}
              particleR={80}
              animationTime={500}
              timeVariance={250}
              colors={[1, 2, 3, 4, 1, 2, 3, 4]}
              initialActiveIndex={activeIndex}
            />
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 transition-all hover:scale-110"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>

            <MobileMenu />
          </div>
        </div>
      </div>
    </header>
  )
}
