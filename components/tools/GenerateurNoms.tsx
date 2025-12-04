'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'
import Input from '@/components/ui/Input'
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import CopyButton from '@/components/ui/CopyButton'

export default function GenerateurNoms() {
  const [type, setType] = useState<string>('full')
  const [gender, setGender] = useState<string>('mixed')
  const [count, setCount] = useState<number>(10)
  const [names, setNames] = useState<string[]>([])

  const firstNamesMale = [
    'Alexandre', 'Antoine', 'Arthur', 'Baptiste', 'Benjamin', 'Charles', 'Clément', 'David',
    'Étienne', 'Gabriel', 'Hugo', 'Jules', 'Louis', 'Lucas', 'Maxime', 'Nathan', 'Nicolas',
    'Pierre', 'Raphaël', 'Thomas', 'Victor', 'Xavier'
  ]

  const firstNamesFemale = [
    'Amélie', 'Camille', 'Charlotte', 'Chloé', 'Clara', 'Élise', 'Emma', 'Julie', 'Léa',
    'Léna', 'Louise', 'Manon', 'Marie', 'Mathilde', 'Océane', 'Pauline', 'Sarah', 'Sophie',
    'Zoé', 'Anaïs', 'Laura', 'Valentine'
  ]

  const lastNames = [
    'Bernard', 'Blanc', 'Bonnet', 'Dubois', 'Durand', 'Dupont', 'Fabre', 'Fournier',
    'Girard', 'Lambert', 'Laurent', 'Lefebvre', 'Leroy', 'Martin', 'Mercier', 'Michel',
    'Moreau', 'Morel', 'Petit', 'Richard', 'Robert', 'Roux', 'Simon', 'Thomas'
  ]

  const getRandomItem = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)]

  const generateNames = () => {
    const generated: string[] = []

    for (let i = 0; i < count; i++) {
      let name = ''

      if (type === 'first' || type === 'full') {
        if (gender === 'male') {
          name = getRandomItem(firstNamesMale)
        } else if (gender === 'female') {
          name = getRandomItem(firstNamesFemale)
        } else {
          name = Math.random() > 0.5 ? getRandomItem(firstNamesMale) : getRandomItem(firstNamesFemale)
        }
      }

      if (type === 'last') {
        name = getRandomItem(lastNames)
      }

      if (type === 'full') {
        name += ' ' + getRandomItem(lastNames)
      }

      generated.push(name)
    }

    setNames(generated)
  }

  const copyAllNames = () => {
    return names.join('\n')
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Paramètres</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select
            label="Type de nom"
            value={type}
            onChange={(e) => {
              setType(e.target.value)
              setNames([])
            }}
            options={[
              { value: 'full', label: 'Prénom + Nom' },
              { value: 'first', label: 'Prénom uniquement' },
              { value: 'last', label: 'Nom uniquement' },
            ]}
          />

          {type !== 'last' && (
            <Select
              label="Genre"
              value={gender}
              onChange={(e) => {
                setGender(e.target.value)
                setNames([])
              }}
              options={[
                { value: 'mixed', label: 'Mixte' },
                { value: 'male', label: 'Masculin' },
                { value: 'female', label: 'Féminin' },
              ]}
            />
          )}

          <Input
            label="Nombre de noms"
            type="number"
            value={count}
            onChange={(e) => setCount(parseInt(e.target.value) || 10)}
            min="1"
            max="100"
          />

          <Button onClick={generateNames} className="w-full">
            Générer les noms
          </Button>
        </CardContent>
      </Card>

      {names.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Noms générés ({names.length})</CardTitle>
              <CopyButton text={copyAllNames()} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-96 overflow-y-auto">
              {names.map((name, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <span className="font-medium">{name}</span>
                  <CopyButton text={name} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
