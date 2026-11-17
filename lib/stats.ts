import { getRedisClient } from './redis'
import { tools } from './tools-config'

// Compteurs Redis :
// - TOTAL_KEY : hash slug → vues cumulées (HINCRBY, atomique)
// - DAY_PREFIX + AAAA-MM-JJ : hash slug → vues du jour, conservé DAY_TTL_SECONDS
// L'ancien blob JSON (LEGACY_KEY) perdait des vues sous concurrence (lecture-modification-écriture) ;
// il est repris une fois dans TOTAL_KEY puis laissé intact.
const TOTAL_KEY = 'tool-views'
const DAY_PREFIX = 'tool-views:'
const LEGACY_KEY = 'tool-stats'
const MIGRATION_FLAG = 'tool-views:migrated'
const DAY_TTL_SECONDS = 400 * 24 * 3600
export const MAX_DAYS = 90

const knownSlugs = new Set(tools.map(t => t.slug))

export function isKnownToolSlug(slug: string): boolean {
  return knownSlugs.has(slug)
}

function dayKey(date: Date): string {
  return DAY_PREFIX + date.toISOString().slice(0, 10)
}

let migrationChecked = false

// Reprise unique de l'ancien blob ; le drapeau NX garantit une seule exécution entre instances
async function migrateLegacyStats(redis: Awaited<ReturnType<typeof getRedisClient>>): Promise<void> {
  if (migrationChecked) return
  const claimed = await redis.set(MIGRATION_FLAG, new Date().toISOString(), { NX: true })
  migrationChecked = true
  if (!claimed) return
  const legacy = await redis.get(LEGACY_KEY)
  if (!legacy) return
  try {
    const parsed = JSON.parse(legacy) as Record<string, { views: number }>
    const multi = redis.multi()
    for (const [slug, data] of Object.entries(parsed)) {
      if (isKnownToolSlug(slug) && Number.isFinite(data?.views) && data.views > 0) {
        multi.hIncrBy(TOTAL_KEY, slug, Math.floor(data.views))
      }
    }
    await multi.exec()
  } catch (error) {
    console.error('Error migrating legacy tool stats:', error)
  }
}

// Incrémente les vues d'un outil (total et jour courant)
export async function incrementToolView(toolSlug: string): Promise<void> {
  if (!isKnownToolSlug(toolSlug)) return
  try {
    const redis = await getRedisClient()
    await migrateLegacyStats(redis)
    const today = dayKey(new Date())
    await redis
      .multi()
      .hIncrBy(TOTAL_KEY, toolSlug, 1)
      .hIncrBy(today, toolSlug, 1)
      .expire(today, DAY_TTL_SECONDS)
      .exec()
  } catch (error) {
    console.error('Error incrementing tool view:', error)
  }
}

// Récupère les N outils les plus vus, au total ou sur les `days` derniers jours
export async function getTopTools(limit: number = 10, days?: number): Promise<Array<{ slug: string; views: number }>> {
  try {
    const redis = await getRedisClient()
    await migrateLegacyStats(redis)

    const totals = new Map<string, number>()
    const hashes: Record<string, string>[] = []
    if (days && days > 0) {
      const n = Math.min(Math.floor(days), MAX_DAYS)
      const now = Date.now()
      const keys = Array.from({ length: n }, (_, i) => dayKey(new Date(now - i * 24 * 3600 * 1000)))
      hashes.push(...(await Promise.all(keys.map(k => redis.hGetAll(k)))))
    } else {
      hashes.push(await redis.hGetAll(TOTAL_KEY))
    }
    for (const hash of hashes) {
      for (const [slug, value] of Object.entries(hash)) {
        if (!isKnownToolSlug(slug)) continue
        totals.set(slug, (totals.get(slug) ?? 0) + Number(value))
      }
    }

    return Array.from(totals, ([slug, views]) => ({ slug, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, limit)
  } catch (error) {
    console.error('Error getting top tools:', error)
    return []
  }
}
