'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useTheme } from './ThemeProvider'
import { categories } from '@/lib/tools-config'
import MobileMenu from './MobileMenu'
import { usePathname } from 'next/navigation'

export default function Header() {
  const { theme, toggleTheme } = useTheme()
  const pathname = usePathname()

  // Navigation items
  const navItems = [
    { label: 'Accueil', href: '/' },
    { label: 'Catégories', href: '/categories' },
    ...categories.slice(0, 4).map((cat) => ({
      label: cat.name,
      href: `/${cat.slug}`
    })),
    { label: 'À propos', href: '/about' }
  ]

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(href)
  }

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

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300
                  ${isActive(item.href)
                    ? 'text-white bg-gradient-to-r from-[#2656D9] to-[#6789E4] shadow-lg shadow-[#2656D9]/30'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                  }
                `}
              >
                {item.label}
                {isActive(item.href) && (
                  <span className="absolute inset-0 rounded-lg bg-gradient-to-r from-[#2656D9] to-[#6789E4] opacity-0 blur-xl transition-opacity duration-300 -z-10" />
                )}
              </Link>
            ))}
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
