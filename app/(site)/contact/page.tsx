'use client'

import { Metadata } from 'next'
import { useState } from 'react'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import Button from '@/components/ui/Button'

export default function ContactPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, message }),
      })

      if (response.ok) {
        setSubmitted(true)
        setName('')
        setEmail('')
        setMessage('')
      } else {
        const data = await response.json()
        alert('Erreur : ' + (data.error || 'Une erreur est survenue'))
      }
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors de l\'envoi du message')
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        Contactez-nous
      </h1>

      <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">
        Une question, une suggestion ou un bug à signaler ? Nous sommes à votre écoute.
      </p>

      {submitted ? (
        <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-green-700 dark:text-green-400 mb-2">
            Message envoyé !
          </h2>
          <p className="text-green-700 dark:text-green-400">
            Merci pour votre message. Nous vous répondrons dans les plus brefs délais.
          </p>
          <Button
            onClick={() => setSubmitted(false)}
            variant="secondary"
            className="mt-4"
          >
            Envoyer un autre message
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Nom"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Votre nom"
          />

          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="votre@email.com"
          />

          <Textarea
            label="Message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            rows={8}
            placeholder="Votre message..."
          />

          <Button type="submit">
            Envoyer le message
          </Button>
        </form>
      )}

      <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Autres moyens de nous contacter
        </h2>
        <div className="space-y-2 text-gray-700 dark:text-gray-300">
          <p>
            <strong>Email :</strong>{' '}
            <a href="mailto:contact@mts-toolbox.com" className="text-primary-600 hover:underline">
              contact@mts-toolbox.com
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
