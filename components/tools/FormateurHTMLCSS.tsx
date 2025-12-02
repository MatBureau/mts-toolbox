'use client'

import { useState } from 'react'
import Textarea from '@/components/ui/Textarea'
import Button from '@/components/ui/Button'
import CopyButton from '@/components/ui/CopyButton'
import Select from '@/components/ui/Select'

export default function FormateurHTMLCSS() {
  const [input, setInput] = useState('')
  const [result, setResult] = useState('')
  const [type, setType] = useState('html')

  const formatHTML = (html: string): string => {
    let formatted = ''
    let indent = 0
    const tab = '  '

    html.split(/>\s*</).forEach((node) => {
      if (node.match(/^\/\w/)) {
        indent--
      }
      formatted += tab.repeat(Math.max(0, indent)) + '<' + node + '>\n'
      if (node.match(/^<?\w[^>]*[^\/]$/) && !node.startsWith('input')) {
        indent++
      }
    })

    return formatted.substring(1, formatted.length - 2)
  }

  const formatCSS = (css: string): string => {
    return css
      .replace(/\s*{\s*/g, ' {\n  ')
      .replace(/\s*}\s*/g, '\n}\n\n')
      .replace(/\s*;\s*/g, ';\n  ')
      .replace(/\s*,\s*/g, ',\n')
      .trim()
  }

  const format = () => {
    if (type === 'html') {
      setResult(formatHTML(input))
    } else {
      setResult(formatCSS(input))
    }
  }

  return (
    <div className="space-y-6">
      <Select
        label="Type"
        value={type}
        onChange={(e) => setType(e.target.value)}
        options={[
          { value: 'html', label: 'HTML' },
          { value: 'css', label: 'CSS' },
        ]}
      />

      <Textarea
        label={`Code ${type.toUpperCase()}`}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        rows={10}
        placeholder={type === 'html' ? '<div><p>Hello</p></div>' : '.class { color: red; }'}
      />

      <Button onClick={format}>Formater</Button>

      {result && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Résultat
            </label>
            <CopyButton text={result} />
          </div>
          <Textarea value={result} readOnly rows={15} className="font-mono text-sm" />
        </div>
      )}
    </div>
  )
}
