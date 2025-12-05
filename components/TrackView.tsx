'use client'

import { useEffect } from 'react'

interface TrackViewProps {
  toolSlug: string
}

export default function TrackView({ toolSlug }: TrackViewProps) {
  useEffect(() => {
    // Track la vue de l'outil
    fetch('/api/track-view', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ toolSlug }),
    }).catch(err => console.error('Failed to track view:', err))
  }, [toolSlug])

  return null // Ce composant n'affiche rien
}
