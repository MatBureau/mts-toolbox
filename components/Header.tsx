'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useTheme } from './ThemeProvider'
import { categories } from '@/lib/tools-config'
import MobileMenu from './MobileMenu'

export default function Header() {
  const { theme, toggleTheme } = useTheme()

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

          <nav className="hidden md:flex items-center space-x-6">
            {categories.slice(0, 5).map((category) => (
              <Link
                key={category.id}
                href={`/${category.slug}`}
                className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-[#2656D9] dark:hover:text-[#6789E4] transition-colors"
              >
                {category.name}
              </Link>
            ))}
            <Link
              href="/about"
              className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-[#2656D9] dark:hover:text-[#6789E4] transition-colors"
            >
              À propos
            </Link>
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
