import { kv } from '@vercel/kv'

interface ToolStats {
  [toolSlug: string]: {
    views: number
    lastViewed: string
  }
}

const STATS_KEY = 'tool-stats'

// Lit les statistiques depuis Vercel KV
export async function getStats(): Promise<ToolStats> {
  try {
    const stats = await kv.get<ToolStats>(STATS_KEY)
    return stats || {}
  } catch (error) {
    console.error('Error reading stats from KV:', error)
    return {}
  }
}

// Sauvegarde les statistiques dans Vercel KV
export async function saveStats(stats: ToolStats): Promise<void> {
  try {
    await kv.set(STATS_KEY, stats)
  } catch (error) {
    console.error('Error saving stats to KV:', error)
  }
}

// Incrémente les vues d'un outil
export async function incrementToolView(toolSlug: string): Promise<void> {
  try {
    const stats = await getStats()

    if (!stats[toolSlug]) {
      stats[toolSlug] = {
        views: 0,
        lastViewed: new Date().toISOString()
      }
    }

    stats[toolSlug].views += 1
    stats[toolSlug].lastViewed = new Date().toISOString()

    await saveStats(stats)
  } catch (error) {
    console.error('Error incrementing tool view:', error)
  }
}

// Récupère les N outils les plus vus
export async function getTopTools(limit: number = 10): Promise<Array<{ slug: string; views: number }>> {
  try {
    const stats = await getStats()

    return Object.entries(stats)
      .map(([slug, data]) => ({ slug, views: data.views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, limit)
  } catch (error) {
    console.error('Error getting top tools:', error)
    return []
  }
}
