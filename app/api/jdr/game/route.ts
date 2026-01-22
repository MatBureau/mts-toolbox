import { NextResponse } from 'next/server'
import { getRedisClient } from '@/lib/redis'
import { GameState, Scene } from '@/types/jdr'

function generateGameCode(length = 6) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const { gmId, gmName } = body

    if (!gmId || !gmName) {
      return NextResponse.json(
        { error: 'gmId and gmName are required' },
        { status: 400 }
      )
    }

    const redis = await getRedisClient()
    let gameId = generateGameCode()
    let attempts = 0

    // Ensure uniqueness
    while (await redis.exists(`jdr:game:${gameId}`)) {
      gameId = generateGameCode()
      attempts++
      if (attempts > 10) throw new Error('Impossible de générer un ID unique')
    }

    const defaultScene: Scene = {
      name: 'Nouvelle Scène',
      imageUrl: '',
      gridEnabled: false,
      gridSize: 50,
      zoom: 1,
      offsetX: 0,
      offsetY: 0,
    }

    const initialState: GameState = {
      id: gameId,
      createdAt: Date.now(),
      lastUpdated: Date.now(),
      title: 'Nouvelle Partie',
      gmId,
      players: [
        {
          id: gmId,
          name: gmName,
          isGM: true,
          color: '#991b1b',
          lastSeen: Date.now(),
        },
      ],
      characters: [],
      scene: defaultScene,
      tokens: [],
      npcs: [],
      diceRolls: [],
      currentTrack: undefined,
      sharedNotes: '',
    }

    // Expire en 7 jours au lieu de 24h pour les parties longues
    await redis.set(`jdr:game:${gameId}`, JSON.stringify(initialState), {
      EX: 604800, // 7 jours
    })

    return NextResponse.json({ gameId, gameState: initialState })
  } catch (error) {
    console.error('Game Creation Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
