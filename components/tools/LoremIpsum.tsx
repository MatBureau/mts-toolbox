'use client'

import { useState } from 'react'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import Textarea from '@/components/ui/Textarea'
import CopyButton from '@/components/ui/CopyButton'

const LOREM_WORDS = [
  'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
  'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
  'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
  'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo',
  'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate',
  'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint',
  'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia',
  'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum',
]

export default function LoremIpsum() {
  const [count, setCount] = useState(5)
  const [type, setType] = useState('paragraphes')
  const [result, setResult] = useState('')

  const generateLorem = () => {
    let text = ''

    if (type === 'mots') {
      const words = []
      for (let i = 0; i < count; i++) {
        words.push(LOREM_WORDS[Math.floor(Math.random() * LOREM_WORDS.length)])
      }
      text = words.join(' ')
    } else if (type === 'phrases') {
      for (let i = 0; i < count; i++) {
        const wordCount = Math.floor(Math.random() * 10) + 5
        const words = []
        for (let j = 0; j < wordCount; j++) {
          words.push(LOREM_WORDS[Math.floor(Math.random() * LOREM_WORDS.length)])
        }
        text += words.join(' ') + '. '
      }
    } else {
      // paragraphes
      for (let i = 0; i < count; i++) {
        const sentenceCount = Math.floor(Math.random() * 4) + 3
        const sentences = []
        for (let j = 0; j < sentenceCount; j++) {
          const wordCount = Math.floor(Math.random() * 10) + 5
          const words = []
          for (let k = 0; k < wordCount; k++) {
            words.push(LOREM_WORDS[Math.floor(Math.random() * LOREM_WORDS.length)])
          }
          sentences.push(words.join(' '))
        }
        text += sentences.join('. ') + '.\n\n'
      }
    }

    text = text.charAt(0).toUpperCase() + text.slice(1)
    setResult(text.trim())
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Nombre"
          type="number"
          value={count}
          onChange={(e) => setCount(parseInt(e.target.value) || 1)}
          min={1}
          max={100}
        />
        <Select
          label="Type"
          value={type}
          onChange={(e) => setType(e.target.value)}
          options={[
            { value: 'mots', label: 'Mots' },
            { value: 'phrases', label: 'Phrases' },
            { value: 'paragraphes', label: 'Paragraphes' },
          ]}
        />
      </div>

      <Button onClick={generateLorem}>Générer</Button>

      {result && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Résultat
            </label>
            <CopyButton text={result} />
          </div>
          <Textarea value={result} readOnly rows={10} />
        </div>
      )}
    </div>
  )
}
