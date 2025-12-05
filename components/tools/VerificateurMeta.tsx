'use client'

import { useState, useMemo } from 'react'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card'

export default function VerificateurMeta() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [keyword, setKeyword] = useState('')

  const analyzeTitle = useMemo(() => {
    const results = {
      length: title.length,
      status: '',
      color: '',
      issues: [] as string[],
      strengths: [] as string[],
    }

    // Longueur
    if (title.length === 0) {
      results.status = 'Titre vide'
      results.color = 'red'
      results.issues.push('Le titre est vide')
    } else if (title.length < 30) {
      results.status = 'Trop court'
      results.color = 'orange'
      results.issues.push('Le titre est trop court (< 30 caractères)')
    } else if (title.length > 60) {
      results.status = 'Trop long'
      results.color = 'red'
      results.issues.push('Le titre sera tronqué dans Google (> 60 caractères)')
    } else {
      results.status = 'Longueur optimale'
      results.color = 'green'
      results.strengths.push('Longueur idéale (30-60 caractères)')
    }

    // Mot-clé
    if (keyword && title.toLowerCase().includes(keyword.toLowerCase())) {
      const position = title.toLowerCase().indexOf(keyword.toLowerCase())
      if (position < 20) {
        results.strengths.push(`Mot-clé "${keyword}" présent au début`)
      } else {
        results.strengths.push(`Mot-clé "${keyword}" présent`)
      }
    } else if (keyword) {
      results.issues.push(`Mot-clé "${keyword}" absent du titre`)
    }

    // Séparateurs
    if (title.includes('|') || title.includes('-') || title.includes('–')) {
      results.strengths.push('Utilise des séparateurs (|, -, –)')
    }

    // Marque
    const separators = ['|', '-', '–', ':']
    const hasBrand = separators.some(sep => title.includes(sep))
    if (hasBrand) {
      results.strengths.push('Semble inclure une marque/nom de site')
    }

    // Majuscules excessives
    const upperCaseRatio = (title.match(/[A-Z]/g) || []).length / title.length
    if (upperCaseRatio > 0.5 && title.length > 10) {
      results.issues.push('Trop de majuscules (peut sembler spam)')
    }

    // Ponctuation finale
    if (title.endsWith('!') || title.endsWith('?')) {
      results.strengths.push('Ponctuation incitative')
    }

    return results
  }, [title, keyword])

  const analyzeDescription = useMemo(() => {
    const results = {
      length: description.length,
      status: '',
      color: '',
      issues: [] as string[],
      strengths: [] as string[],
    }

    // Longueur
    if (description.length === 0) {
      results.status = 'Description vide'
      results.color = 'red'
      results.issues.push('La description est vide')
    } else if (description.length < 70) {
      results.status = 'Trop courte'
      results.color = 'orange'
      results.issues.push('Description trop courte (< 70 caractères)')
    } else if (description.length > 160) {
      results.status = 'Trop longue'
      results.color = 'red'
      results.issues.push('Description trop longue, sera tronquée (> 160 caractères)')
    } else {
      results.status = 'Longueur optimale'
      results.color = 'green'
      results.strengths.push('Longueur idéale (120-160 caractères)')
    }

    // Mot-clé
    if (keyword && description.toLowerCase().includes(keyword.toLowerCase())) {
      results.strengths.push(`Mot-clé "${keyword}" présent`)
    } else if (keyword) {
      results.issues.push(`Mot-clé "${keyword}" absent de la description`)
    }

    // Call-to-action
    const cta = ['découvrez', 'obtenez', 'téléchargez', 'essayez', 'achetez', 'apprenez', 'trouvez', 'créez', 'profitez']
    const hasCta = cta.some(word => description.toLowerCase().includes(word))
    if (hasCta) {
      results.strengths.push('Contient un verbe d\'action / call-to-action')
    }

    // Chiffres
    if (/\d+/.test(description)) {
      results.strengths.push('Contient des chiffres (augmente le CTR)')
    }

    // Points
    const sentenceCount = (description.match(/[.!?]/g) || []).length
    if (sentenceCount >= 2) {
      results.strengths.push(`${sentenceCount} phrases (bonne structure)`)
    } else if (sentenceCount === 0 && description.length > 50) {
      results.issues.push('Manque de ponctuation (. ! ?)')
    }

    return results
  }, [description, keyword])

  const getColorClass = (color: string) => {
    switch (color) {
      case 'green':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
      case 'orange':
        return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'
      case 'red':
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400'
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Vos balises</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Input
              label="Mot-clé principal (optionnel)"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="ex: générateur de mots de passe"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Pour vérifier si votre mot-clé est présent
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Title Tag
              </label>
              <span className="text-sm text-gray-500">
                {title.length} / 60 caractères
              </span>
            </div>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Titre de votre page - Votre marque"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Meta Description
              </label>
              <span className="text-sm text-gray-500">
                {description.length} / 160 caractères
              </span>
            </div>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description concise et attractive de votre page..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Analyse Title */}
      {title && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Analyse du Title</CardTitle>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getColorClass(analyzeTitle.color)}`}>
                {analyzeTitle.status}
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {analyzeTitle.strengths.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-green-700 dark:text-green-400 mb-2">
                  ✓ Points forts
                </h4>
                <ul className="space-y-1">
                  {analyzeTitle.strengths.map((strength, i) => (
                    <li key={i} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                      <span className="text-green-600 dark:text-green-400">●</span>
                      {strength}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {analyzeTitle.issues.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-red-700 dark:text-red-400 mb-2">
                  ⚠ Points à améliorer
                </h4>
                <ul className="space-y-1">
                  {analyzeTitle.issues.map((issue, i) => (
                    <li key={i} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                      <span className="text-red-600 dark:text-red-400">●</span>
                      {issue}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Analyse Description */}
      {description && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Analyse de la Meta Description</CardTitle>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getColorClass(analyzeDescription.color)}`}>
                {analyzeDescription.status}
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {analyzeDescription.strengths.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-green-700 dark:text-green-400 mb-2">
                  ✓ Points forts
                </h4>
                <ul className="space-y-1">
                  {analyzeDescription.strengths.map((strength, i) => (
                    <li key={i} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                      <span className="text-green-600 dark:text-green-400">●</span>
                      {strength}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {analyzeDescription.issues.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-red-700 dark:text-red-400 mb-2">
                  ⚠ Points à améliorer
                </h4>
                <ul className="space-y-1">
                  {analyzeDescription.issues.map((issue, i) => (
                    <li key={i} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                      <span className="text-red-600 dark:text-red-400">●</span>
                      {issue}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Best Practices */}
      <Card>
        <CardHeader>
          <CardTitle>💡 Bonnes pratiques</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm text-gray-700 dark:text-gray-300">
            <div>
              <h4 className="font-semibold mb-1">Title Tag :</h4>
              <ul className="space-y-1 list-disc list-inside">
                <li>Placer le mot-clé principal en début de titre</li>
                <li>Inclure le nom de votre marque (séparé par | ou -)</li>
                <li>Être unique pour chaque page</li>
                <li>Donner envie de cliquer tout en restant précis</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-1">Meta Description :</h4>
              <ul className="space-y-1 list-disc list-inside">
                <li>Résumer le contenu de la page en 1-2 phrases</li>
                <li>Inclure un call-to-action (découvrez, téléchargez...)</li>
                <li>Ajouter des chiffres ou dates si pertinent</li>
                <li>Répondre à l'intention de recherche</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
