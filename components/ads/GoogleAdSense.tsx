'use client'

import { useEffect } from 'react'
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
  useEffect(() => {
    try {
      // @ts-ignore
      if (window.adsbygoogle) {
        // @ts-ignore
        (window.adsbygoogle = window.adsbygoogle || []).push({})
      }
    } catch (err) {
      console.error('AdSense error:', err)
    }
  }, [])

  return (
    <ins
      className={`adsbygoogle ${className}`}
      style={{ display: 'block' }}
      data-ad-client={ADSENSE_CLIENT_ID}
      data-ad-slot={AD_SLOTS[slot]}
      data-ad-format={adFormat}
      data-full-width-responsive={fullWidthResponsive ? 'true' : 'false'}
    />
  )
}
