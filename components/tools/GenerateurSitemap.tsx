'use client'

import { useState } from 'react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import CopyButton from '@/components/ui/CopyButton'
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card'

interface SitemapUrl {
  id: string
  loc: string
  priority: string
  changefreq: string
}

export default function GenerateurSitemap() {
  const [baseUrl, setBaseUrl] = useState('https://example.com')
  const [urls, setUrls] = useState<SitemapUrl[]>([
    {
      id: '1',
      loc: '/',
      priority: '1.0',
      changefreq: 'daily',
    },
  ])

  const addUrl = () => {
    setUrls([
      ...urls,
      {
        id: Date.now().toString(),
        loc: '',
        priority: '0.8',
        changefreq: 'weekly',
      },
    ])
  }

  const removeUrl = (id: string) => {
    setUrls(urls.filter((u) => u.id !== id))
  }

  const updateUrl = (id: string, field: keyof SitemapUrl, value: string) => {
    setUrls(urls.map((u) => (u.id === id ? { ...u, [field]: value } : u)))
  }

  const generateSitemap = () => {
    let output = '<?xml version="1.0" encoding="UTF-8"?>\n'
    output += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'

    urls.forEach((url) => {
      if (url.loc.trim()) {
        const fullUrl = url.loc.startsWith('http') ? url.loc : `${baseUrl}${url.loc}`
        output += '  <url>\n'
        output += `    <loc>${fullUrl}</loc>\n`
        output += `    <changefreq>${url.changefreq}</changefreq>\n`
        output += `    <priority>${url.priority}</priority>\n`
        output += '  </url>\n'
      }
    })

    output += '</urlset>'
    return output
  }

  const sitemapXml = generateSitemap()

  const downloadFile = () => {
    const blob = new Blob([sitemapXml], { type: 'application/xml' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'sitemap.xml'
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Base URL */}
      <Card>
        <CardHeader>
          <CardTitle>Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            label="URL de base"
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            placeholder="https://example.com"
          />
        </CardContent>
      </Card>

      {/* URLs */}
      {urls.map((url, index) => (
        <Card key={url.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>URL {index + 1}</CardTitle>
              {urls.length > 1 && (
                <Button
                  onClick={() => removeUrl(url.id)}
                  variant="secondary"
                  size="sm"
                >
                  Supprimer
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Chemin"
              value={url.loc}
              onChange={(e) => updateUrl(url.id, 'loc', e.target.value)}
              placeholder="/about"
            />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Fréquence de changement
                </label>
                <select
                  value={url.changefreq}
                  onChange={(e) => updateUrl(url.id, 'changefreq', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="always">Always</option>
                  <option value="hourly">Hourly</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                  <option value="never">Never</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Priorité
                </label>
                <select
                  value={url.priority}
                  onChange={(e) => updateUrl(url.id, 'priority', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="1.0">1.0 (Très important)</option>
                  <option value="0.9">0.9</option>
                  <option value="0.8">0.8</option>
                  <option value="0.7">0.7</option>
                  <option value="0.6">0.6</option>
                  <option value="0.5">0.5</option>
                  <option value="0.4">0.4</option>
                  <option value="0.3">0.3</option>
                  <option value="0.2">0.2</option>
                  <option value="0.1">0.1 (Peu important)</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      <Button onClick={addUrl} className="w-full">
        + Ajouter une URL
      </Button>

      {/* Output */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Fichier sitemap.xml généré</CardTitle>
            <div className="flex gap-2">
              <CopyButton text={sitemapXml} />
              <Button onClick={downloadFile} size="sm">
                Télécharger
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm whitespace-pre-wrap overflow-x-auto max-h-96 overflow-y-auto">
            {sitemapXml}
          </div>
        </CardContent>
      </Card>

      {/* Info */}
      <Card>
        <CardHeader>
          <CardTitle>💡 Comment utiliser</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm text-gray-700 dark:text-gray-300">
            <ol className="space-y-2 list-decimal list-inside">
              <li>Ajoutez toutes les URLs importantes de votre site</li>
              <li>Définissez la priorité et la fréquence de mise à jour pour chaque page</li>
              <li>Téléchargez le fichier <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">sitemap.xml</code></li>
              <li>Placez-le à la racine de votre site : <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">https://votresite.com/sitemap.xml</code></li>
              <li>Soumettez-le dans Google Search Console et Bing Webmaster Tools</li>
            </ol>
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="font-semibold mb-1">💡 Conseils :</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>Priorité 1.0 pour la page d'accueil</li>
                <li>0.8-0.9 pour les pages importantes</li>
                <li>0.5-0.7 pour les pages secondaires</li>
                <li>Mettez à jour le sitemap régulièrement</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
