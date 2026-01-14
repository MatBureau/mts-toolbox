'use client'

import { useEffect, useRef, useState } from 'react'
import { ADSENSE_CLIENT_ID, AD_SLOTS, type AdSlotType } from '@/lib/ads'

interface GoogleAdSenseProps {
  slot: AdSlotType
  adFormat?: string
  fullWidthResponsive?: boolean
  className?: string
}

export default function GoogleAdSense({
  slot,
  adFormat = 'auto',
  fullWidthResponsive = true,
  className = '',
}: GoogleAdSenseProps) {
  const adRef = useRef<HTMLModElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // Évite les doubles chargements
    if (isLoaded) return

    const loadAd = () => {
      try {
        // Vérifie que le conteneur a une largeur avant de charger
        if (adRef.current && adRef.current.offsetWidth > 0) {
          // @ts-ignore
          (window.adsbygoogle = window.adsbygoogle || []).push({})
          setIsLoaded(true)
        }
      } catch (err) {
        console.error('AdSense error:', err)
      }
    }

    // Délai pour laisser le layout se stabiliser
    const timer = setTimeout(loadAd, 100)

    return () => clearTimeout(timer)
  }, [isLoaded])

  return (
    <ins
      ref={adRef}
      className={`adsbygoogle ${className}`}
      style={{ display: 'block', minWidth: '280px', minHeight: '50px' }}
      data-ad-client={ADSENSE_CLIENT_ID}
      data-ad-slot={AD_SLOTS[slot]}
      data-ad-format={adFormat}
      data-full-width-responsive={fullWidthResponsive ? 'true' : 'false'}
    />
  )
}
