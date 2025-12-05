import { NextResponse } from 'next/server'
import { getTopTools } from '@/lib/stats'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const topTools = getTopTools(10)

    return NextResponse.json({ topTools })
  } catch (error) {
    console.error('Error fetching top tools:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
