import { NextResponse } from 'next/server'
import { getTopTools } from '@/lib/stats'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  try {
    const topTools = getTopTools(10)

    return NextResponse.json({ topTools: topTools || [] })
  } catch (error) {
    console.error('Error fetching top tools:', error)
    // Retourner un tableau vide au lieu d'une erreur 500
    return NextResponse.json({ topTools: [] })
  }
}
