import { NextRequest, NextResponse } from 'next/server'
import { incrementToolView, isKnownToolSlug } from '@/lib/stats'

// Robots qui exécutent le JavaScript (Googlebot, outils SEO, navigateurs sans tête)
const BOT_UA = /bot|crawl|spider|slurp|headless|lighthouse|pagespeed|preview|facebookexternalhit|bingpreview/i

export async function POST(request: NextRequest) {
  try {
    const { toolSlug } = await request.json()

    if (!toolSlug || typeof toolSlug !== 'string' || !isKnownToolSlug(toolSlug)) {
      return NextResponse.json(
        { error: 'Invalid tool slug' },
        { status: 400 }
      )
    }

    if (BOT_UA.test(request.headers.get('user-agent') ?? '')) {
      return NextResponse.json({ success: true, counted: false })
    }

    await incrementToolView(toolSlug)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error tracking view:', error)
    // Ne pas échouer silencieusement
    return NextResponse.json({ success: false, error: 'Failed to track view' })
  }
}
