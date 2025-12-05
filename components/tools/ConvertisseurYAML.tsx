'use client'

import { useState } from 'react'
import Textarea from '@/components/ui/Textarea'
import Button from '@/components/ui/Button'
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card'

export default function ConvertisseurYAML() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [format, setFormat] = useState<'json' | 'yaml' | 'toml'>('json')

  const jsonToYaml = (json: string): string => {
    const obj = JSON.parse(json)
    return objectToYaml(obj)
  }

  const objectToYaml = (obj: any, indent = 0): string => {
    const spaces = '  '.repeat(indent)
    let yaml = ''

    if (Array.isArray(obj)) {
      obj.forEach(item => {
        if (typeof item === 'object' && item !== null) {
          yaml += `${spaces}-\n${objectToYaml(item, indent + 1)}`
        } else {
          yaml += `${spaces}- ${item}\n`
        }
      })
    } else if (typeof obj === 'object' && obj !== null) {
      Object.entries(obj).forEach(([key, value]) => {
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          yaml += `${spaces}${key}:\n${objectToYaml(value, indent + 1)}`
        } else if (Array.isArray(value)) {
          yaml += `${spaces}${key}:\n${objectToYaml(value, indent + 1)}`
        } else {
          yaml += `${spaces}${key}: ${value}\n`
        }
      })
    }

    return yaml
  }

  const jsonToToml = (json: string): string => {
    const obj = JSON.parse(json)
    let toml = ''

    Object.entries(obj).forEach(([key, value]) => {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        toml += `\n[${key}]\n`
        Object.entries(value).forEach(([k, v]) => {
          if (typeof v === 'string') {
            toml += `${k} = "${v}"\n`
          } else {
            toml += `${k} = ${v}\n`
          }
        })
      } else if (typeof value === 'string') {
        toml += `${key} = "${value}"\n`
      } else {
        toml += `${key} = ${value}\n`
      }
    })

    return toml
  }

  const convert = (targetFormat: 'json' | 'yaml' | 'toml') => {
    try {
      setError('')

      // Parse input based on current format
      let obj: any

      if (format === 'json') {
        obj = JSON.parse(input)
      } else {
        // For YAML/TOML, try to parse as JSON for now (simplified)
        // In a real app, you'd use proper parsers like js-yaml
        setError('Conversion depuis YAML/TOML nécessite une bibliothèque externe. Utilisez JSON comme source.')
        return
      }

      // Convert to target format
      if (targetFormat === 'json') {
        setOutput(JSON.stringify(obj, null, 2))
      } else if (targetFormat === 'yaml') {
        setOutput(jsonToYaml(input))
      } else if (targetFormat === 'toml') {
        setOutput(jsonToToml(input))
      }
    } catch (e: any) {
      setError(e.message)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Format source</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3 mb-4">
            <Button
              onClick={() => setFormat('json')}
              variant={format === 'json' ? 'primary' : 'secondary'}
              size="sm"
            >
              JSON
            </Button>
            <Button
              onClick={() => setFormat('yaml')}
              variant={format === 'yaml' ? 'primary' : 'secondary'}
              size="sm"
            >
              YAML
            </Button>
            <Button
              onClick={() => setFormat('toml')}
              variant={format === 'toml' ? 'primary' : 'secondary'}
              size="sm"
            >
              TOML
            </Button>
          </div>

          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Collez votre ${format.toUpperCase()} ici...`}
            rows={10}
          />
        </CardContent>
      </Card>

      <div className="flex gap-3 flex-wrap">
        <Button onClick={() => convert('json')}>Convertir en JSON</Button>
        <Button onClick={() => convert('yaml')}>Convertir en YAML</Button>
        <Button onClick={() => convert('toml')}>Convertir en TOML</Button>
      </div>

      {error && (
        <Card>
          <CardContent>
            <div className="text-red-600 dark:text-red-400 text-sm">
              <strong>Erreur :</strong> {error}
            </div>
          </CardContent>
        </Card>
      )}

      {output && !error && (
        <Card>
          <CardHeader>
            <CardTitle>Résultat</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={output}
              onChange={(e) => setOutput(e.target.value)}
              rows={10}
            />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>💡 À propos</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300 list-disc list-inside">
            <li><strong>JSON</strong> : Format universel, syntaxe avec accolades et crochets</li>
            <li><strong>YAML</strong> : Format lisible, basé sur l'indentation</li>
            <li><strong>TOML</strong> : Format de configuration simple et lisible</li>
            <li>Note : Conversion complète depuis YAML/TOML nécessite des bibliothèques supplémentaires</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
