import { NextResponse } from 'next/server'
import { getRedisClient } from '@/lib/redis'

function generateGameCode(length = 6) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export async function POST() {
  try {
    const redis = await getRedisClient()
    let gameId = generateGameCode()
    let attempts = 0
    
    // Ensure uniqueness
    while (await redis.exists(`jdr:game:${gameId}`)) {
      gameId = generateGameCode()
      attempts++
      if (attempts > 10) throw new Error("Impossible de générer un ID unique")
    }

    const initialState = {
      id: gameId,
      created_at: Date.now(),
      tokens: [],
      diceRolls: [],
      players: [],
      scene: {
        imageUrl: '', // URL de l'image de fond
        name: 'Nouvelle Scène'
      }
    }

    await redis.set(`jdr:game:${gameId}`, JSON.stringify(initialState), {
      EX: 86400 // Expire en 24h
    })

    return NextResponse.json({ gameId })
  } catch (error) {
    console.error('Game Creation Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
