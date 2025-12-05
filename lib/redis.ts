import { createClient } from 'redis'

// Créer le client Redis
const redis = createClient({
  url: process.env.REDIS_URL,
})

redis.on('error', (err) => console.error('Redis Client Error', err))

// Connecter le client
let isConnecting = false
let isConnected = false

export async function getRedisClient() {
  if (isConnected) {
    return redis
  }

  if (!isConnecting) {
    isConnecting = true
    try {
      await redis.connect()
      isConnected = true
      console.log('Redis connected successfully')
    } catch (error) {
      console.error('Failed to connect to Redis:', error)
      isConnecting = false
      throw error
    }
  } else {
    // Attendre que la connexion soit établie
    while (isConnecting && !isConnected) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }

  return redis
}

export default redis
