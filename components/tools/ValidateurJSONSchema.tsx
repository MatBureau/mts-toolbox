'use client'

import { useState } from 'react'
import Textarea from '@/components/ui/Textarea'
import Button from '@/components/ui/Button'
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card'

export default function ValidateurJSONSchema() {
  const [jsonData, setJsonData] = useState('')
  const [jsonSchema, setJsonSchema] = useState('')
  const [result, setResult] = useState<{
    valid: boolean
    errors: string[]
    success?: string
  } | null>(null)

  // Simple JSON Schema validator (basic implementation)
  const validateSchema = () => {
    try {
      const data = JSON.parse(jsonData)
      const schema = JSON.parse(jsonSchema)

      const errors: string[] = []

      // Basic validation
      if (schema.type) {
        const actualType = Array.isArray(data) ? 'array' : typeof data
        if (actualType !== schema.type) {
          errors.push(`Type incorrect : attendu ${schema.type}, reçu ${actualType}`)
        }
      }

      // Validate properties for objects
      if (schema.type === 'object' && schema.properties) {
        Object.keys(schema.properties).forEach(key => {
          const prop = schema.properties[key]

          if (schema.required && schema.required.includes(key) && !(key in data)) {
            errors.push(`Propriété requise manquante : ${key}`)
          }

          if (key in data) {
            const valueType = typeof data[key]
            if (prop.type && valueType !== prop.type) {
              errors.push(`Type incorrect pour ${key} : attendu ${prop.type}, reçu ${valueType}`)
            }

            // String validations
            if (prop.type === 'string' && typeof data[key] === 'string') {
              if (prop.minLength && data[key].length < prop.minLength) {
                errors.push(`${key} trop court : minimum ${prop.minLength} caractères`)
              }
              if (prop.maxLength && data[key].length > prop.maxLength) {
                errors.push(`${key} trop long : maximum ${prop.maxLength} caractères`)
              }
              if (prop.pattern && !new RegExp(prop.pattern).test(data[key])) {
                errors.push(`${key} ne correspond pas au pattern requis`)
              }
            }

            // Number validations
            if (prop.type === 'number' && typeof data[key] === 'number') {
              if (prop.minimum !== undefined && data[key] < prop.minimum) {
                errors.push(`${key} trop petit : minimum ${prop.minimum}`)
              }
              if (prop.maximum !== undefined && data[key] > prop.maximum) {
                errors.push(`${key} trop grand : maximum ${prop.maximum}`)
              }
            }
          }
        })
      }

      if (errors.length === 0) {
        setResult({
          valid: true,
          errors: [],
          success: '✓ JSON valide selon le schéma'
        })
      } else {
        setResult({
          valid: false,
          errors
        })
      }
    } catch (e: any) {
      setResult({
        valid: false,
        errors: [`Erreur de parsing : ${e.message}`]
      })
    }
  }

  const loadExample = () => {
    const exampleData = JSON.stringify({
      name: "John Doe",
      age: 30,
      email: "john@example.com"
    }, null, 2)

    const exampleSchema = JSON.stringify({
      type: "object",
      required: ["name", "email"],
      properties: {
        name: {
          type: "string",
          minLength: 1
        },
        age: {
          type: "number",
          minimum: 0,
          maximum: 150
        },
        email: {
          type: "string",
          pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"
        }
      }
    }, null, 2)

    setJsonData(exampleData)
    setJsonSchema(exampleSchema)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Validation JSON Schema</CardTitle>
            <Button onClick={loadExample} variant="secondary" size="sm">
              Charger exemple
            </Button>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Données JSON</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={jsonData}
            onChange={(e) => setJsonData(e.target.value)}
            placeholder='{"name": "John", "age": 30}'
            rows={8}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>JSON Schema</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={jsonSchema}
            onChange={(e) => setJsonSchema(e.target.value)}
            placeholder='{"type": "object", "properties": {...}}'
            rows={8}
          />
        </CardContent>
      </Card>

      <Button onClick={validateSchema} className="w-full">
        Valider
      </Button>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className={result.valid ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
              {result.valid ? '✓ Validation réussie' : '✕ Validation échouée'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {result.valid ? (
              <p className="text-green-700 dark:text-green-300">{result.success}</p>
            ) : (
              <ul className="space-y-2">
                {result.errors.map((error, i) => (
                  <li key={i} className="text-red-600 dark:text-red-400 text-sm flex items-start gap-2">
                    <span>●</span>
                    {error}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>💡 JSON Schema</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300 list-disc list-inside">
            <li>Définit la structure attendue de vos données JSON</li>
            <li>Valide les types, formats, contraintes (min/max, required, etc.)</li>
            <li>Utilisé pour valider des API, configurations, formulaires</li>
            <li>Standard : <a href="https://json-schema.org" target="_blank" rel="noopener" className="text-blue-600 hover:underline">json-schema.org</a></li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
