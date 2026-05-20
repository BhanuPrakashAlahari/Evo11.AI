import mongoose from 'mongoose'
import { config } from './env.js'

/**
 * Establishes a persistent Mongoose connection to MongoDB.
 * Includes detailed lifecycle logging and graceful connection error handling.
 */
export async function connectDatabase() {
  const uri = config.mongoUri?.trim()

  if (!uri || uri === 'your_mongodb_connection_string_here') {
    console.warn('[Database] ⚠️  MONGODB_URI is not configured. Task persistence is disabled.')
    console.warn('[Database] Add your connection string to backEnd/.env → MONGODB_URI=mongodb+srv://...')
    return false
  }

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000, // Fail fast if Atlas is unreachable
      socketTimeoutMS: 45000
    })

    console.log(`[Database] ✅ MongoDB connected — Host: ${mongoose.connection.host}`)

    // Connection lifecycle hooks
    mongoose.connection.on('disconnected', () => {
      console.warn('[Database] ⚡ MongoDB disconnected. Attempting reconnect...')
    })

    mongoose.connection.on('reconnected', () => {
      console.log('[Database] ✅ MongoDB reconnected successfully.')
    })

    return true
  } catch (err) {
    console.error('[Database] ❌ MongoDB connection failed:', err.message)
    console.warn('[Database] App will continue running without database connectivity.')
    return false
  }
}

/**
 * Gracefully closes the MongoDB connection on process shutdown.
 */
export async function disconnectDatabase() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close()
    console.log('[Database] MongoDB connection closed gracefully.')
  }
}
