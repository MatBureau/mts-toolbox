'use client'

import { useState, useMemo } from 'react'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import Button from '@/components/ui/Button'
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card'

export default function AnalyseurOnPage() {
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const [metaDescription, setMetaDescription] = useState('')
  const [h1, setH1] = useState('')
  const [content, setContent] = useState('')
  const [keyword, setKeyword] = useState('')

  const analysis = useMemo(() => {
    const results = {
      score: 0,
      maxScore: 100,
      issues: [] as string[],
      warnings: [] as string[],
      successes: [] as string[],
    }

    // Title analysis (20 points)
    if (!title) {
      results.issues.push('Aucun titre défini')
    } else if (title.length < 30 || title.length > 60) {
      results.warnings.push(`Titre : ${title.length} caractères (optimal: 30-60)`)
      results.score += 10
    } else {
      results.successes.push(`Titre : longueur optimale (${title.length} caractères)`)
      results.score += 20
    }

    // Meta description (15 points)
    if (!metaDescription) {
      results.issues.push('Aucune meta description définie')
    } else if (metaDescription.length < 120 || metaDescription.length > 160) {
      results.warnings.push(`Meta description : ${metaDescription.length} caractères (optimal: 120-160)`)
      results.score += 8
    } else {
      results.successes.push(`Meta description : longueur optimale (${metaDescription.length} caractères)`)
      results.score += 15
    }

    // H1 analysis (15 points)
    if (!h1) {
      results.issues.push('Aucun H1 défini')
    } else {
      results.successes.push('H1 présent')
      results.score += 15
    }

    // URL analysis (10 points)
    if (!url) {
      results.issues.push('Aucune URL définie')
    } else if (url.length > 100) {
      results.warnings.push('URL trop longue (> 100 caractères)')
      results.score += 5
    } else if (!/^https?:\/\//.test(url)) {
      results.warnings.push('URL doit commencer par http:// ou https://')
      results.score += 5
    } else {
      results.successes.push('URL valide et optimale')
      results.score += 10
    }

    // Content length (15 points)
    const wordCount = content.trim().split(/\s+/).filter(w => w.length > 0).length
    if (wordCount === 0) {
      results.issues.push('Aucun contenu défini')
    } else if (wordCount < 300) {
      results.warnings.push(`Contenu court : ${wordCount} mots (recommandé: 300+ mots)`)
      results.score += 8
    } else {
      results.successes.push(`Contenu : ${wordCount} mots`)
      results.score += 15
    }

    // Keyword presence (25 points)
    if (keyword) {
      const kwLower = keyword.toLowerCase()
      let kwScore = 0

      // In title
      if (title.toLowerCase().includes(kwLower)) {
        results.successes.push(`Mot-clé présent dans le titre`)
        kwScore += 7
      } else {
        results.warnings.push(`Mot-clé absent du titre`)
      }

      // In meta description
      if (metaDescription.toLowerCase().includes(kwLower)) {
        results.successes.push(`Mot-clé présent dans la meta description`)
        kwScore += 5
      } else {
        results.warnings.push(`Mot-clé absent de la meta description`)
      }

      // In H1
      if (h1.toLowerCase().includes(kwLower)) {
        results.successes.push(`Mot-clé présent dans le H1`)
        kwScore += 6
      } else {
        results.warnings.push(`Mot-clé absent du H1`)
      }

      // In URL
      if (url.toLowerCase().includes(kwLower.replace(/\s+/g, '-'))) {
        results.successes.push(`Mot-clé présent dans l'URL`)
        kwScore += 3
      } else {
        results.warnings.push(`Mot-clé absent de l'URL`)
      }

      // In content
      if (content.toLowerCase().includes(kwLower)) {
        results.successes.push(`Mot-clé présent dans le contenu`)
        kwScore += 4
      } else {
        results.warnings.push(`Mot-clé absent du contenu`)
      }

      results.score += kwScore
    } else {
      results.warnings.push('Aucun mot-clé défini pour l\'analyse')
    }

    return results
  }, [url, title, metaDescription, h1, content, keyword])

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400'
    if (score >= 60) return 'text-orange-600 dark:text-orange-400'
    return 'text-red-600 dark:text-red-400'
  }

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 dark:bg-green-900/30'
    if (score >= 60) return 'bg-orange-100 dark:bg-orange-900/30'
    return 'bg-red-100 dark:bg-red-900/30'
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Informations de la page</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Mot-clé principal"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="ex: outils SEO"
          />

          <Input
            label="URL de la page"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/ma-page"
          />

          <Input
            label="Title Tag (balise <title>)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Titre de votre page - Votre marque"
          />

          <Input
            label="Meta Description"
            value={metaDescription}
            onChange={(e) => setMetaDescription(e.target.value)}
            placeholder="Description de votre page..."
          />

          <Input
            label="Balise H1"
            value={h1}
            onChange={(e) => setH1(e.target.value)}
            placeholder="Titre principal de la page"
          />

          <Textarea
            label="Contenu principal (texte)"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Collez le contenu textuel de votre page ici..."
            rows={6}
          />
        </CardContent>
      </Card>

      {/* Score Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Score SEO On-Page</CardTitle>
            <div className={`px-4 py-2 rounded-full text-2xl font-bold ${getScoreBgColor(analysis.score)} ${getScoreColor(analysis.score)}`}>
              {analysis.score} / {analysis.maxScore}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative pt-1">
            <div className="flex mb-2 items-center justify-between">
              <div>
                <span className={`text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full ${getScoreBgColor(analysis.score)} ${getScoreColor(analysis.score)}`}>
                  {analysis.score >= 80 ? 'Excellent' : analysis.score >= 60 ? 'Correct' : 'À améliorer'}
                </span>
              </div>
            </div>
            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200 dark:bg-gray-700">
              <div
                style={{ width: `${(analysis.score / analysis.maxScore) * 100}%` }}
                className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                  analysis.score >= 80 ? 'bg-green-500' : analysis.score >= 60 ? 'bg-orange-500' : 'bg-red-500'
                }`}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Successes */}
      {analysis.successes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-green-700 dark:text-green-400">
              ✓ Points forts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {analysis.successes.map((success, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <span className="text-green-600 dark:text-green-400 mt-0.5">●</span>
                  {success}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Warnings */}
      {analysis.warnings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-orange-700 dark:text-orange-400">
              ⚠ Avertissements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {analysis.warnings.map((warning, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <span className="text-orange-600 dark:text-orange-400 mt-0.5">●</span>
                  {warning}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Issues */}
      {analysis.issues.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-red-700 dark:text-red-400">
              ✕ Problèmes critiques
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {analysis.issues.map((issue, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <span className="text-red-600 dark:text-red-400 mt-0.5">●</span>
                  {issue}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Tips */}
      <Card>
        <CardHeader>
          <CardTitle>💡 Conseils d'optimisation</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300 list-disc list-inside">
            <li>Placez votre mot-clé principal dans le title, H1, et les 100 premiers mots</li>
            <li>Visez 300+ mots de contenu unique et de qualité</li>
            <li>Utilisez des sous-titres (H2, H3) pour structurer votre contenu</li>
            <li>Optimisez vos images avec des balises alt descriptives</li>
            <li>Créez des URLs courtes et descriptives avec votre mot-clé</li>
            <li>Ajoutez des liens internes vers d'autres pages pertinentes</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
