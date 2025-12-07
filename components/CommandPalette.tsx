'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Command } from 'cmdk'
import { tools, categories } from '@/lib/tools-config'
import { motion, AnimatePresence } from 'framer-motion'

export default function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const router = useRouter()

  // Toggle with Cmd+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  const handleSelect = useCallback((callback: () => void) => {
    setOpen(false)
    callback()
  }, [])

  if (!open) return null

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 bg-black/50 z-[100]"
          />

          {/* Command Palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-2xl z-[101]"
          >
            <Command className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-2xl overflow-hidden">
              <div className="flex items-center border-b border-gray-200 dark:border-gray-700 px-4">
                <svg
                  className="w-5 h-5 text-gray-400 mr-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <Command.Input
                  value={search}
                  onValueChange={setSearch}
                  placeholder="Rechercher un outil... (Cmd+K)"
                  className="flex-1 py-4 bg-transparent border-none outline-none text-gray-900 dark:text-gray-100 placeholder-gray-400"
                />
                <kbd className="hidden sm:block px-2 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded">
                  ESC
                </kbd>
              </div>

              <Command.List className="max-h-[400px] overflow-y-auto p-2">
                <Command.Empty className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                  Aucun outil trouvé
                </Command.Empty>

                {categories.map((category) => (
                  <Command.Group
                    key={category.id}
                    heading={category.name}
                    className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-gray-500 dark:[&_[cmdk-group-heading]]:text-gray-400"
                  >
                    {tools
                      .filter((tool) => tool.category === category.slug)
                      .map((tool) => (
                        <Command.Item
                          key={tool.id}
                          value={`${tool.name} ${tool.description} ${tool.keywords.join(' ')}`}
                          onSelect={() =>
                            handleSelect(() =>
                              router.push(`/${tool.category}/${tool.slug}`)
                            )
                          }
                          className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors aria-selected:bg-[#2656D9]/10 dark:aria-selected:bg-[#6789E4]/10 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <span className="text-2xl">{tool.icon}</span>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-900 dark:text-gray-100">
                              {tool.name}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {tool.description}
                            </div>
                          </div>
                          <svg
                            className="w-4 h-4 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </Command.Item>
                      ))}
                  </Command.Group>
                ))}
              </Command.List>

              <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-2 text-xs text-gray-500 dark:text-gray-400 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 text-xs font-semibold bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded">↑</kbd>
                    <kbd className="px-1.5 py-0.5 text-xs font-semibold bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded">↓</kbd>
                    naviguer
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 text-xs font-semibold bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded">↵</kbd>
                    sélectionner
                  </span>
                </div>
                <span>{tools.length} outils disponibles</span>
              </div>
            </Command>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
