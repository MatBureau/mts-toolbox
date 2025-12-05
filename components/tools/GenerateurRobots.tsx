'use client'

import { useState } from 'react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import CopyButton from '@/components/ui/CopyButton'
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card'

interface Rule {
  id: string
  userAgent: string
  disallow: string[]
  allow: string[]
}

export default function GenerateurRobots() {
  const [sitemapUrl, setSitemapUrl] = useState('https://example.com/sitemap.xml')
  const [rules, setRules] = useState<Rule[]>([
    {
      id: '1',
      userAgent: '*',
      disallow: ['/admin/', '/private/'],
      allow: [],
    },
  ])

  const addRule = () => {
    setRules([
      ...rules,
      {
        id: Date.now().toString(),
        userAgent: '*',
        disallow: [],
        allow: [],
      },
    ])
  }

  const removeRule = (id: string) => {
    setRules(rules.filter((r) => r.id !== id))
  }

  const updateRule = (id: string, field: keyof Rule, value: any) => {
    setRules(
      rules.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    )
  }

  const addPath = (ruleId: string, type: 'disallow' | 'allow') => {
    setRules(
      rules.map((r) =>
        r.id === ruleId
          ? { ...r, [type]: [...r[type], ''] }
          : r
      )
    )
  }

  const updatePath = (ruleId: string, type: 'disallow' | 'allow', index: number, value: string) => {
    setRules(
      rules.map((r) =>
        r.id === ruleId
          ? {
              ...r,
              [type]: r[type].map((p, i) => (i === index ? value : p)),
            }
          : r
      )
    )
  }

  const removePath = (ruleId: string, type: 'disallow' | 'allow', index: number) => {
    setRules(
      rules.map((r) =>
        r.id === ruleId
          ? {
              ...r,
              [type]: r[type].filter((_, i) => i !== index),
            }
          : r
      )
    )
  }

  const generateRobotsTxt = () => {
    let output = '# robots.txt généré avec MTS-Toolbox\n\n'

    rules.forEach((rule) => {
      output += `User-agent: ${rule.userAgent}\n`

      rule.disallow.forEach((path) => {
        if (path.trim()) output += `Disallow: ${path}\n`
      })

      rule.allow.forEach((path) => {
        if (path.trim()) output += `Allow: ${path}\n`
      })

      output += '\n'
    })

    if (sitemapUrl.trim()) {
      output += `Sitemap: ${sitemapUrl}\n`
    }

    return output
  }

  const robotsTxt = generateRobotsTxt()

  const downloadFile = () => {
    const blob = new Blob([robotsTxt], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'robots.txt'
    link.click()
    URL.revokeObjectURL(url)
  }

  const loadPreset = (preset: 'allow-all' | 'block-all' | 'wordpress') => {
    if (preset === 'allow-all') {
      setRules([
        {
          id: '1',
          userAgent: '*',
          disallow: [],
          allow: ['/'],
        },
      ])
    } else if (preset === 'block-all') {
      setRules([
        {
          id: '1',
          userAgent: '*',
          disallow: ['/'],
          allow: [],
        },
      ])
    } else if (preset === 'wordpress') {
      setRules([
        {
          id: '1',
          userAgent: '*',
          disallow: ['/wp-admin/', '/wp-includes/', '/wp-content/plugins/', '/wp-content/themes/'],
          allow: ['/wp-admin/admin-ajax.php'],
        },
      ])
    }
  }

  return (
    <div className="space-y-6">
      {/* Presets */}
      <Card>
        <CardHeader>
          <CardTitle>Templates rapides</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => loadPreset('allow-all')} variant="secondary" size="sm">
              Tout autoriser
            </Button>
            <Button onClick={() => loadPreset('block-all')} variant="secondary" size="sm">
              Tout bloquer
            </Button>
            <Button onClick={() => loadPreset('wordpress')} variant="secondary" size="sm">
              WordPress (défaut)
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Rules */}
      {rules.map((rule, ruleIndex) => (
        <Card key={rule.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Règle {ruleIndex + 1}</CardTitle>
              {rules.length > 1 && (
                <Button
                  onClick={() => removeRule(rule.id)}
                  variant="secondary"
                  size="sm"
                >
                  Supprimer
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Input
                label="User-agent"
                value={rule.userAgent}
                onChange={(e) => updateRule(rule.id, 'userAgent', e.target.value)}
                placeholder="*"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                * pour tous les robots, ou un bot spécifique (Googlebot, Bingbot...)
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Chemins bloqués (Disallow)
                </label>
                <Button onClick={() => addPath(rule.id, 'disallow')} variant="secondary" size="sm">
                  + Ajouter
                </Button>
              </div>
              {rule.disallow.map((path, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <Input
                    value={path}
                    onChange={(e) => updatePath(rule.id, 'disallow', index, e.target.value)}
                    placeholder="/admin/"
                  />
                  <Button
                    onClick={() => removePath(rule.id, 'disallow', index)}
                    variant="secondary"
                    size="sm"
                  >
                    ×
                  </Button>
                </div>
              ))}
              {rule.disallow.length === 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Aucun chemin bloqué
                </p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Chemins autorisés (Allow)
                </label>
                <Button onClick={() => addPath(rule.id, 'allow')} variant="secondary" size="sm">
                  + Ajouter
                </Button>
              </div>
              {rule.allow.map((path, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <Input
                    value={path}
                    onChange={(e) => updatePath(rule.id, 'allow', index, e.target.value)}
                    placeholder="/public/"
                  />
                  <Button
                    onClick={() => removePath(rule.id, 'allow', index)}
                    variant="secondary"
                    size="sm"
                  >
                    ×
                  </Button>
                </div>
              ))}
              {rule.allow.length === 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Aucun chemin spécifiquement autorisé
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}

      <Button onClick={addRule} className="w-full">
        + Ajouter une règle
      </Button>

      {/* Sitemap */}
      <Card>
        <CardHeader>
          <CardTitle>Sitemap</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Input
              label="URL du sitemap (optionnel)"
              value={sitemapUrl}
              onChange={(e) => setSitemapUrl(e.target.value)}
              placeholder="https://example.com/sitemap.xml"
            />
          </div>
        </CardContent>
      </Card>

      {/* Output */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Fichier robots.txt généré</CardTitle>
            <div className="flex gap-2">
              <CopyButton text={robotsTxt} />
              <Button onClick={downloadFile} size="sm">
                Télécharger
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm whitespace-pre-wrap overflow-x-auto">
            {robotsTxt}
          </div>
        </CardContent>
      </Card>

      {/* Info */}
      <Card>
        <CardHeader>
          <CardTitle>💡 Comment utiliser</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-2 text-sm text-gray-700 dark:text-gray-300 list-decimal list-inside">
            <li>Téléchargez le fichier <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">robots.txt</code></li>
            <li>Placez-le à la <strong>racine</strong> de votre site : <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">https://votresite.com/robots.txt</code></li>
            <li>Vérifiez avec Google Search Console › Outils › Testeur de robots.txt</li>
            <li>Les changements peuvent prendre quelques jours avant d'être pris en compte</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  )
}
