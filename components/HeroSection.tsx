'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { tools } from '@/lib/tools-config'

export default function HeroSection({ onSearchClick }: { onSearchClick?: () => void }) {
  const [displayText, setDisplayText] = useState('')
  const [count, setCount] = useState(0)
  const fullText = 'Votre boîte à outils en ligne, gratuite et performante'

  // Typing animation
  useEffect(() => {
    if (displayText.length < fullText.length) {
      const timeout = setTimeout(() => {
        setDisplayText(fullText.slice(0, displayText.length + 1))
      }, 50)
      return () => clearTimeout(timeout)
    }
  }, [displayText, fullText])

  // Counter animation
  useEffect(() => {
    const targetCount = tools.length
    if (count < targetCount) {
      const increment = Math.ceil(targetCount / 50)
      const timeout = setTimeout(() => {
        setCount(prev => Math.min(prev + increment, targetCount))
      }, 30)
      return () => clearTimeout(timeout)
    }
  }, [count])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="text-center mb-12 py-12"
    >
      {/* Typing animation title */}
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-gray-100 mb-6 min-h-[80px]">
        {displayText}
        <span className="animate-pulse">|</span>
      </h1>

      {/* Subtitle with animated counter */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-8"
      >
        Découvrez{' '}
        <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#2656D9] to-[#6789E4]">
          {count}+ outils
        </span>{' '}
        pour simplifier votre quotidien
      </motion.p>

      {/* CTA Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.6 }}
        className="flex flex-col sm:flex-row items-center justify-center gap-4"
      >
        <button
          onClick={onSearchClick}
          className="group px-8 py-4 bg-gradient-to-r from-[#2656D9] to-[#6789E4] text-white rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
        >
          <span className="flex items-center gap-2">
            🔍 Explorer les outils
            <svg
              className="w-5 h-5 group-hover:translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </span>
        </button>

        <a
          href="#categories"
          className="px-8 py-4 border-2 border-[#2656D9] text-[#2656D9] dark:text-[#6789E4] dark:border-[#6789E4] rounded-lg font-semibold text-lg hover:bg-[#2656D9] hover:text-white dark:hover:bg-[#6789E4] transition-all duration-200"
        >
          Parcourir par catégorie
        </a>
      </motion.div>

      {/* Features badges */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.6 }}
        className="flex flex-wrap items-center justify-center gap-4 mt-8 text-sm text-gray-600 dark:text-gray-400"
      >
        <span className="flex items-center gap-1">
          ✅ 100% Gratuit
        </span>
        <span className="flex items-center gap-1">
          🚀 Sans inscription
        </span>
        <span className="flex items-center gap-1">
          🔒 Données sécurisées
        </span>
        <span className="flex items-center gap-1">
          ⚡ Ultra-rapide
        </span>
      </motion.div>
    </motion.div>
  )
}
