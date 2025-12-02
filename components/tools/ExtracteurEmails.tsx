'use client'

import { useState } from 'react'
import Textarea from '@/components/ui/Textarea'
import Button from '@/components/ui/Button'
import CopyButton from '@/components/ui/CopyButton'

export default function ExtracteurEmails() {
  const [text, setText] = useState('')
  const [emails, setEmails] = useState<string[]>([])

  const extractEmails = () => {
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g
    const found = text.match(emailRegex) || []
    const unique = Array.from(new Set(found))
    setEmails(unique)
  }

  return (
    <div className="space-y-6">
      <Textarea
        label="Texte contenant des emails"
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={10}
        placeholder="Collez votre texte contenant des adresses email..."
      />

      <Button onClick={extractEmails}>Extraire les emails</Button>

      {emails.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {emails.length} email(s) trouvé(s)
            </label>
            <CopyButton text={emails.join('\n')} />
          </div>
          <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
            {emails.map((email, index) => (
              <div key={index} className="py-1 text-sm font-mono">
                {email}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
