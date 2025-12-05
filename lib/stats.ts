import fs from 'fs'
import path from 'path'

const STATS_FILE = path.join(process.cwd(), 'data', 'tool-stats.json')

interface ToolStats {
  [toolSlug: string]: {
    views: number
    lastViewed: string
  }
}

// Assure que le dossier data existe
function ensureDataDir() {
  const dataDir = path.join(process.cwd(), 'data')
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
}

// Lit les statistiques
export function getStats(): ToolStats {
  ensureDataDir()

  if (!fs.existsSync(STATS_FILE)) {
    return {}
  }

  try {
    const data = fs.readFileSync(STATS_FILE, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error reading stats:', error)
    return {}
  }
}

// Sauvegarde les statistiques
export function saveStats(stats: ToolStats) {
  ensureDataDir()

  try {
    fs.writeFileSync(STATS_FILE, JSON.stringify(stats, null, 2))
  } catch (error) {
    console.error('Error saving stats:', error)
  }
}

// Incrémente les vues d'un outil
export function incrementToolView(toolSlug: string) {
  const stats = getStats()

  if (!stats[toolSlug]) {
    stats[toolSlug] = {
      views: 0,
      lastViewed: new Date().toISOString()
    }
  }

  stats[toolSlug].views += 1
  stats[toolSlug].lastViewed = new Date().toISOString()

  saveStats(stats)
}

// Récupère les N outils les plus vus
export function getTopTools(limit: number = 10): Array<{ slug: string; views: number }> {
  const stats = getStats()

  return Object.entries(stats)
    .map(([slug, data]) => ({ slug, views: data.views }))
    .sort((a, b) => b.views - a.views)
    .slice(0, limit)
}
