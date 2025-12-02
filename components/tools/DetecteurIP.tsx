'use client'

import { useState, useEffect } from 'react'
import Button from '@/components/ui/Button'
import CopyButton from '@/components/ui/CopyButton'

interface IPInfo {
  ip: string
  userAgent: string
  language: string
  platform: string
  screen: string
  timezone: string
}

export default function DetecteurIP() {
  const [ipInfo, setIpInfo] = useState<IPInfo | null>(null)
  const [loading, setLoading] = useState(false)

  const detectInfo = async () => {
    setLoading(true)

    try {
      // Récupération de l'IP via une API publique
      const response = await fetch('https://api.ipify.org?format=json')
      const data = await response.json()

      setIpInfo({
        ip: data.ip,
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
        screen: `${window.screen.width}x${window.screen.height}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      })
    } catch (err) {
      console.error('Erreur lors de la détection', err)
      // Fallback sans IP
      setIpInfo({
        ip: 'Non disponible',
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
        screen: `${window.screen.width}x${window.screen.height}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    detectInfo()
  }, [])

  if (loading || !ipInfo) {
    return (
      <div className="text-center py-12">
        <div className="text-lg text-gray-600 dark:text-gray-400">Détection en cours...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-primary-50 dark:bg-primary-900/20 p-6 rounded-lg text-center">
        <div className="text-sm text-primary-600 dark:text-primary-400 mb-2">Votre adresse IP</div>
        <div className="text-3xl font-bold text-primary-700 dark:text-primary-300 mb-3">
          {ipInfo.ip}
        </div>
        <CopyButton text={ipInfo.ip} />
      </div>

      <div className="space-y-3">
        <InfoRow label="User Agent" value={ipInfo.userAgent} />
        <InfoRow label="Langue" value={ipInfo.language} />
        <InfoRow label="Plateforme" value={ipInfo.platform} />
        <InfoRow label="Résolution écran" value={ipInfo.screen} />
        <InfoRow label="Fuseau horaire" value={ipInfo.timezone} />
      </div>

      <Button onClick={detectInfo} variant="secondary" className="w-full">
        Rafraîchir
      </Button>

      <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm text-blue-800 dark:text-blue-200">
        <strong>Note :</strong> Toutes ces informations sont détectées localement dans votre
        navigateur. Aucune donnée n'est envoyée à nos serveurs.
      </div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
      <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">{label}</div>
      <div className="font-mono text-sm text-gray-900 dark:text-gray-100 break-all">{value}</div>
    </div>
  )
}
