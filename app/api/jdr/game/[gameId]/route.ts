import { NextResponse } from 'next/server'
import { getRedisClient } from '@/lib/redis'

// GET: Récupérer l'état du jeu (Polling)
export async function GET(
  req: Request,
  { params }: { params: { gameId: string } }
) {
  try {
    const { gameId } = await params
    const redis = await getRedisClient()
    
    const gameState = await redis.get(`jdr:game:${gameId}`)
    
    if (!gameState) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 })
    }

    return NextResponse.json(JSON.parse(gameState))
  } catch (error) {
    console.error('Game Fetch Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// POST: Actions de jeu (Move Token, Roll Dice, Update Scene)
export async function POST(
  req: Request,
  { params }: { params: { gameId: string } }
) {
  try {
    const { gameId } = await params
    const body = await req.json()
    const { action, payload } = body
    
    const redis = await getRedisClient()
    const rawState = await redis.get(`jdr:game:${gameId}`)
    
    if (!rawState) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 })
    }

    const gameState = JSON.parse(rawState)

    // Traitement des actions
    switch (action) {
      case 'UPDATE_TOKENS':
        // Payload: Liste complète des tokens ou mise à jour partielle
        // Pour faire simple MVP : on remplace la liste
        gameState.tokens = payload
        break
        
      case 'ROLL_DICE':
        gameState.diceRolls.unshift({
          ...payload,
          timestamp: Date.now()
        })
        gameState.diceRolls = gameState.diceRolls.slice(0, 50) // Garder les 50 derniers
        break

      case 'UPDATE_SCENE':
        gameState.scene = { ...gameState.scene, ...payload }
        break
        
      case 'JOIN_PLAYER':
        if (!gameState.players.find((p: any) => p.id === payload.id)) {
            gameState.players.push(payload)
        }
        break
    }

    // Sauvegarde atomique (attention aux race conditions en prod, mais OK pour MVP polling)
    await redis.set(`jdr:game:${gameId}`, JSON.stringify(gameState), {
        EX: 86400,
        XX: true // Seulement si existe déjà
    })

    return NextResponse.json(gameState)

  } catch (error) {
    console.error('Game Update Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
