import { NextRequest, NextResponse } from 'next/server'
import { incrementToolView } from '@/lib/stats'

export async function POST(request: NextRequest) {
  try {
    const { toolSlug } = await request.json()

    if (!toolSlug || typeof toolSlug !== 'string') {
      return NextResponse.json(
        { error: 'Invalid tool slug' },
        { status: 400 }
      )
    }

    await incrementToolView(toolSlug)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error tracking view:', error)
    // Ne pas échouer silencieusement
    return NextResponse.json({ success: false, error: 'Failed to track view' })
  }
}
