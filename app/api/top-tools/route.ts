import { NextRequest, NextResponse } from 'next/server'
import { getTopTools, MAX_DAYS } from '@/lib/stats'

export const dynamic = 'force-dynamic'

// GET /api/top-tools            → cumul depuis l'origine
// GET /api/top-tools?days=30    → vues des 30 derniers jours (max MAX_DAYS)
export async function GET(request: NextRequest) {
  try {
    const daysParam = Number(request.nextUrl.searchParams.get('days'))
    const days = Number.isFinite(daysParam) && daysParam > 0 ? Math.min(Math.floor(daysParam), MAX_DAYS) : undefined
    const topTools = await getTopTools(12, days)

    return NextResponse.json({ topTools: topTools || [], ...(days && { days }) })
  } catch (error) {
    console.error('Error fetching top tools:', error)
    // Retourner un tableau vide au lieu d'une erreur 500
    return NextResponse.json({ topTools: [] })
  }
}
