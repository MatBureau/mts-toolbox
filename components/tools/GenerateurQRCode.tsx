'use client'

import { useState, useEffect } from 'react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

export default function GenerateurQRCode() {
  const [text, setText] = useState('')
  const [qrCode, setQrCode] = useState('')
  const [size, setSize] = useState('200')

  const generateQR = async () => {
    if (!text) return

    try {
      // Utilisation de l'API publique goqr.me
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(
        text
      )}`
      setQrCode(qrUrl)
    } catch (err) {
      console.error('Erreur lors de la génération du QR code', err)
    }
  }

  const downloadQR = () => {
    if (!qrCode) return

    const link = document.createElement('a')
    link.href = qrCode
    link.download = 'qrcode.png'
    link.click()
  }

  return (
    <div className="space-y-6">
      <Input
        label="Texte ou URL"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="https://example.com"
      />

      <Input
        label="Taille (pixels)"
        type="number"
        value={size}
        onChange={(e) => setSize(e.target.value)}
        min={100}
        max={1000}
      />

      <Button onClick={generateQR}>Générer le QR Code</Button>

      {qrCode && (
        <div className="text-center space-y-4">
          <div className="bg-white p-6 rounded-lg inline-block">
            <img src={qrCode} alt="QR Code" className="mx-auto" />
          </div>
          <div>
            <Button onClick={downloadQR} variant="secondary">
              Télécharger le QR Code
            </Button>
          </div>
        </div>
      )}

      <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
          Utilisations courantes
        </h3>
        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
          <li>• Partager une URL de site web</li>
          <li>• Informations de contact (vCard)</li>
          <li>• Connexion WiFi</li>
          <li>• Texte ou message</li>
        </ul>
      </div>
    </div>
  )
}
