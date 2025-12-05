'use client'

import { useState } from 'react'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card'

export default function PrevisualisationSerp() {
  const [url, setUrl] = useState('https://example.com')
  const [title, setTitle] = useState('Titre de votre page - Votre marque')
  const [description, setDescription] = useState('Description concise et attractive de votre page web qui apparaîtra dans les résultats de recherche Google.')

  const TITLE_MAX_CHARS = 60
  const TITLE_MAX_PIXELS = 580
  const DESC_MAX_CHARS = 160
  const DESC_MAX_PIXELS = 920

  // Estimation approximative des pixels (Google utilise des calculs complexes)
  const estimatePixels = (text: string, isMobile = false) => {
    // Approximation simple : caractères larges (W, M) = 10px, moyens = 8px, étroits (i, l) = 4px
    let pixels = 0
    for (const char of text) {
      if (/[WMm@]/.test(char)) pixels += 10
      else if (/[wA-Z0-9]/.test(char)) pixels += 8
      else if (/[il!.,;']/.test(char)) pixels += 4
      else pixels += 7
    }
    return isMobile ? pixels * 0.9 : pixels
  }

  const titlePixels = estimatePixels(title)
  const descPixels = estimatePixels(description)

  const getTitleStatus = () => {
    if (title.length === 0) return { color: 'text-gray-500', text: 'Vide' }
    if (title.length < 30 || titlePixels < 300) return { color: 'text-orange-600', text: 'Trop court' }
    if (title.length > TITLE_MAX_CHARS || titlePixels > TITLE_MAX_PIXELS) return { color: 'text-red-600', text: 'Trop long' }
    return { color: 'text-green-600', text: 'Optimal' }
  }

  const getDescStatus = () => {
    if (description.length === 0) return { color: 'text-gray-500', text: 'Vide' }
    if (description.length < 70) return { color: 'text-orange-600', text: 'Trop courte' }
    if (description.length > DESC_MAX_CHARS || descPixels > DESC_MAX_PIXELS) return { color: 'text-red-600', text: 'Trop longue' }
    return { color: 'text-green-600', text: 'Optimale' }
  }

  const titleStatus = getTitleStatus()
  const descStatus = getDescStatus()

  // Extraire le domaine de l'URL
  const getDomain = (urlString: string) => {
    try {
      const parsedUrl = new URL(urlString)
      return parsedUrl.hostname.replace('www.', '')
    } catch {
      return 'example.com'
    }
  }

  const domain = getDomain(url)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Vos informations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="URL (optionnel)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
          />

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Titre (Title Tag)
              </label>
              <div className="flex items-center gap-3 text-xs">
                <span className={titleStatus.color}>● {titleStatus.text}</span>
                <span className={title.length > TITLE_MAX_CHARS ? 'text-red-600' : 'text-gray-500'}>
                  {title.length} / {TITLE_MAX_CHARS} caractères
                </span>
                <span className={titlePixels > TITLE_MAX_PIXELS ? 'text-red-600' : 'text-gray-500'}>
                  ~{Math.round(titlePixels)}px
                </span>
              </div>
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
              <div className="flex items-center gap-3 text-xs">
                <span className={descStatus.color}>● {descStatus.text}</span>
                <span className={description.length > DESC_MAX_CHARS ? 'text-red-600' : 'text-gray-500'}>
                  {description.length} / {DESC_MAX_CHARS} caractères
                </span>
                <span className={descPixels > DESC_MAX_PIXELS ? 'text-red-600' : 'text-gray-500'}>
                  ~{Math.round(descPixels)}px
                </span>
              </div>
            </div>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description de votre page..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Prévisualisation Desktop */}
      <Card>
        <CardHeader>
          <CardTitle>🖥️ Prévisualisation Desktop</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                {domain.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-1">
                  <span>{domain}</span>
                  <span>›</span>
                  <span className="text-gray-400">...</span>
                </div>
                <h3 className="text-xl text-blue-600 dark:text-blue-400 font-normal hover:underline cursor-pointer mb-1 line-clamp-1">
                  {title || 'Titre de votre page'}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                  {description || 'Description de votre page qui apparaîtra dans Google...'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Prévisualisation Mobile */}
      <Card>
        <CardHeader>
          <CardTitle>📱 Prévisualisation Mobile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-w-sm mx-auto bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {domain.charAt(0).toUpperCase()}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 truncate">
                  {domain}
                </div>
              </div>
              <h3 className="text-lg text-blue-600 dark:text-blue-400 font-normal line-clamp-2">
                {title || 'Titre de votre page'}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                {description || 'Description de votre page qui apparaîtra dans Google...'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Conseils */}
      <Card>
        <CardHeader>
          <CardTitle>💡 Conseils d'optimisation</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <li>✓ <strong>Title :</strong> 30-60 caractères (~300-580px) | Incluez votre mot-clé principal en début</li>
            <li>✓ <strong>Description :</strong> 120-160 caractères | Résumez l'intérêt de votre page, incluez un appel à l'action</li>
            <li>✓ <strong>Unicité :</strong> Chaque page doit avoir un title et une description uniques</li>
            <li>✓ <strong>Pertinence :</strong> Le contenu doit correspondre à ce que vous promettez dans le SERP</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
