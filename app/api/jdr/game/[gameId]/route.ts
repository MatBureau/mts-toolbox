import { NextResponse } from 'next/server'
import { getRedisClient } from '@/lib/redis'
import { GameState, GameAction, Player, CharacterSheet, NPC, Token, DiceRoll, Scene, DrawingPath } from '@/types/jdr'

// GET: Récupérer l'état du jeu (Polling)
export async function GET(
  req: Request,
  props: { params: Promise<{ gameId: string }> }
) {
  try {
    const { gameId } = await props.params
    const redis = await getRedisClient()

    const gameState = await redis.get(`jdr:game:${gameId}`)

    if (!gameState) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 })
    }

    return NextResponse.json(JSON.parse(gameState as string))
  } catch (error) {
    console.error('Game Fetch Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// POST: Actions de jeu
export async function POST(
  req: Request,
  props: { params: Promise<{ gameId: string }> }
) {
  try {
    const { gameId } = await props.params
    const body = await req.json()
    const { action, payload } = body as GameAction

    const redis = await getRedisClient()
    const rawState = await redis.get(`jdr:game:${gameId}`)

    if (!rawState) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 })
    }

    const gameState: GameState = JSON.parse(rawState as string)
    gameState.lastUpdated = Date.now()

    // Traitement des actions
    switch (action) {
      case 'UPDATE_TOKENS':
        gameState.tokens = payload as Token[]
        break

      case 'ROLL_DICE': {
        const dicePayload = payload as Omit<DiceRoll, 'id' | 'timestamp'>
        const newRoll: DiceRoll = {
          ...dicePayload,
          id: crypto.randomUUID(),
          timestamp: Date.now(),
        }
        gameState.diceRolls.unshift(newRoll)
        gameState.diceRolls = gameState.diceRolls.slice(0, 50) // Garder les 50 derniers
        break
      }

      case 'UPDATE_SCENE':
        gameState.scene = { ...gameState.scene, ...(payload as Partial<Scene>) }
        break

      case 'JOIN_PLAYER': {
        const playerPayload = payload as Player
        const existingPlayerIndex = gameState.players.findIndex(
          (p) => p.id === playerPayload.id
        )
        if (existingPlayerIndex >= 0) {
          // Mettre à jour lastSeen
          gameState.players[existingPlayerIndex] = {
            ...gameState.players[existingPlayerIndex],
            lastSeen: Date.now(),
          }
        } else {
          gameState.players.push({
            ...playerPayload,
            lastSeen: Date.now(),
          })
        }
        break
      }

      case 'UPDATE_PLAYER': {
        const updatePlayerPayload = payload as Player
        const playerIndex = gameState.players.findIndex(
          (p) => p.id === updatePlayerPayload.id
        )
        if (playerIndex >= 0) {
          gameState.players[playerIndex] = {
            ...gameState.players[playerIndex],
            ...updatePlayerPayload,
            lastSeen: Date.now(),
          }
        }
        break
      }

      case 'ADD_CHARACTER': {
        const newChar = payload as CharacterSheet
        // Éviter les doublons
        if (!gameState.characters.find((c) => c.id === newChar.id)) {
          gameState.characters.push(newChar)
        }
        break
      }

      case 'UPDATE_CHARACTER': {
        const charPayload = payload as CharacterSheet
        const charIndex = gameState.characters.findIndex(
          (c) => c.id === charPayload.id
        )
        if (charIndex >= 0) {
          gameState.characters[charIndex] = charPayload
        } else {
          // Si le personnage n'existe pas, l'ajouter
          gameState.characters.push(charPayload)
        }
        break
      }

      case 'ADD_NPC': {
        const newNpc = payload as NPC
        if (!gameState.npcs.find((n) => n.id === newNpc.id)) {
          gameState.npcs.push(newNpc)
        }
        break
      }

      case 'UPDATE_NPC': {
        const npcPayload = payload as NPC
        const npcIndex = gameState.npcs.findIndex((n) => n.id === npcPayload.id)
        if (npcIndex >= 0) {
          gameState.npcs[npcIndex] = npcPayload
        }
        break
      }

      case 'DELETE_NPC': {
        const deletePayload = payload as { id: string }
        gameState.npcs = gameState.npcs.filter((n) => n.id !== deletePayload.id)
        // Supprimer aussi les tokens associés
        gameState.tokens = gameState.tokens.filter(
          (t) => t.type !== 'npc' || t.id !== deletePayload.id
        )
        break
      }

      case 'UPDATE_TITLE': {
        const titlePayload = payload as { title: string }
        gameState.title = titlePayload.title
        break
      }

      case 'UPDATE_MUSIC': {
        gameState.currentTrack = payload as GameState['currentTrack']
        break
      }

      case 'UPDATE_SHARED_NOTES': {
        const notesPayload = payload as { notes: string }
        gameState.sharedNotes = notesPayload.notes
        break
      }

      case 'UPDATE_DRAWINGS':
        gameState.drawings = payload as DrawingPath[]
        break

      case 'SAVE_SCENE_TO_LIB': {
        const sceneToSave = payload as Scene
        if (!gameState.sceneLibrary) gameState.sceneLibrary = []
        // Générer un ID si manquant
        const libScene = { ...sceneToSave, id: sceneToSave.id || crypto.randomUUID() }
        gameState.sceneLibrary.push(libScene)
        break
      }

      case 'LOAD_SCENE_FROM_LIB': {
        const { id } = payload as { id: string }
        const sceneInLib = gameState.sceneLibrary?.find((s) => s.id === id)
        if (sceneInLib) {
          gameState.scene = { ...sceneInLib }
        }
        break
      }

      case 'UPDATE_TOKEN_STATUS': {
        const { tokenId, status } = payload as { tokenId: string; status: string[] }
        gameState.tokens = gameState.tokens.map((t) =>
          t.id === tokenId ? { ...t, status } : t
        )
        break
      }

      case 'PUSH_ROLL': {
        const { rollId } = payload as { rollId: string }
        const rollIndex = gameState.diceRolls.findIndex((r) => r.id === rollId)
        if (rollIndex >= 0 && !gameState.diceRolls[rollIndex].pushed) {
          const oldRoll = gameState.diceRolls[rollIndex]
          
          // Reroll logic
          const newBaseResults = oldRoll.baseResults.map(r => r === 6 ? 6 : Math.floor(Math.random() * 6) + 1)
          const newStressResults = oldRoll.stressResults.map(r => r === 6 ? 6 : Math.floor(Math.random() * 6) + 1)
          
          // Add one more stress die (YZE rule: pushing increases stress)
          const player = gameState.players.find(p => p.id === oldRoll.playerId)
          const character = gameState.characters.find(c => c.id === player?.characterId)
          
          if (character) {
            character.stress = (character.stress || 0) + 1
            newStressResults.push(Math.floor(Math.random() * 6) + 1)
          }

          const newSuccesses = [...newBaseResults, ...newStressResults].filter(r => r === 6).length
          const newTraumas = newStressResults.filter(r => r === 1).length

          gameState.diceRolls[rollIndex] = {
            ...oldRoll,
            baseResults: newBaseResults,
            stressResults: newStressResults,
            successes: newSuccesses,
            traumas: newTraumas,
            pushed: true,
            timestamp: Date.now()
          }
        }
        break
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        )
    }

    // Sauvegarde sans expiration
    await redis.set(`jdr:game:${gameId}`, JSON.stringify(gameState), {
      XX: true, // Seulement si existe déjà
    })

    return NextResponse.json(gameState)
  } catch (error) {
    console.error('Game Update Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// DELETE: Supprimer une partie (MJ seulement)
export async function DELETE(
  req: Request,
  props: { params: Promise<{ gameId: string }> }
) {
  try {
    const { gameId } = await props.params
    const { searchParams } = new URL(req.url)
    const playerId = searchParams.get('playerId')

    const redis = await getRedisClient()
    const rawState = await redis.get(`jdr:game:${gameId}`)

    if (!rawState) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 })
    }

    const gameState: GameState = JSON.parse(rawState as string)

    // Vérifier que c'est bien le MJ
    if (gameState.gmId !== playerId) {
      return NextResponse.json(
        { error: 'Only the GM can delete the game' },
        { status: 403 }
      )
    }

    await redis.del(`jdr:game:${gameId}`)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Game Delete Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
