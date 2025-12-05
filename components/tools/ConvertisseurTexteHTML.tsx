'use client'

import { useState } from 'react'
import Textarea from '@/components/ui/Textarea'
import Button from '@/components/ui/Button'
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card'

export default function ConvertisseurTexteHTML() {
  const [text, setText] = useState('')
  const [html, setHtml] = useState('')
  const [mode, setMode] = useState<'text-to-html' | 'html-to-text'>('text-to-html')

  const textToHtml = (input: string) => {
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/\n/g, '<br>')
  }

  const htmlToText = (input: string) => {
    return input
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<p>/gi, '')
      .replace(/<\/p>/gi, '\n\n')
      .replace(/<[^>]*>/g, '')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, ' ')
  }

  const convert = () => {
    if (mode === 'text-to-html') {
      setHtml(textToHtml(text))
    } else {
      setText(htmlToText(html))
    }
  }

  const addHtmlTags = (tag: string) => {
    const lines = text.split('\n')
    const wrapped = lines.map(line => line.trim() ? `<${tag}>${line}</${tag}>` : '').join('\n')
    setHtml(wrapped)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Mode de conversion</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Button
              onClick={() => setMode('text-to-html')}
              variant={mode === 'text-to-html' ? 'primary' : 'secondary'}
            >
              Texte → HTML
            </Button>
            <Button
              onClick={() => setMode('html-to-text')}
              variant={mode === 'html-to-text' ? 'primary' : 'secondary'}
            >
              HTML → Texte
            </Button>
          </div>
        </CardContent>
      </Card>

      {mode === 'text-to-html' ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Texte brut</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Entrez votre texte ici..."
                rows={8}
              />
            </CardContent>
          </Card>

          <div className="flex gap-3 flex-wrap">
            <Button onClick={convert}>Convertir en HTML</Button>
            <Button onClick={() => addHtmlTags('p')} variant="secondary" size="sm">
              Entourer de &lt;p&gt;
            </Button>
            <Button onClick={() => addHtmlTags('h2')} variant="secondary" size="sm">
              Entourer de &lt;h2&gt;
            </Button>
            <Button onClick={() => addHtmlTags('li')} variant="secondary" size="sm">
              Entourer de &lt;li&gt;
            </Button>
          </div>

          {html && (
            <Card>
              <CardHeader>
                <CardTitle>Code HTML</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={html}
                  onChange={(e) => setHtml(e.target.value)}
                  rows={8}
                />
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Code HTML</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={html}
                onChange={(e) => setHtml(e.target.value)}
                placeholder="Collez votre HTML ici..."
                rows={8}
              />
            </CardContent>
          </Card>

          <Button onClick={convert}>Convertir en texte</Button>

          {text && (
            <Card>
              <CardHeader>
                <CardTitle>Texte extrait</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={8}
                />
              </CardContent>
            </Card>
          )}
        </>
      )}

      <Card>
        <CardHeader>
          <CardTitle>💡 Caractères convertis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
            <p><code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">&</code> → <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">&amp;amp;</code></p>
            <p><code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">&lt;</code> → <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">&amp;lt;</code></p>
            <p><code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">&gt;</code> → <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">&amp;gt;</code></p>
            <p><code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">"</code> → <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">&amp;quot;</code></p>
            <p>Sauts de ligne → <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">&lt;br&gt;</code></p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
