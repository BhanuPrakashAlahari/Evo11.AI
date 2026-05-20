import http from 'http'
import app from './app.js'
import { config } from './config/env.js'
import { connectDatabase, disconnectDatabase } from './config/database.js'

// Create standard HTTP server instance
const server = http.createServer(app)

// Connect to MongoDB then start the HTTP server
connectDatabase().then(() => {
  const port = config.port
  server.listen(port, () => {
    console.log(`[Evo11 Server] Bootstrapped successfully in "${config.nodeEnv}" mode.`)
    console.log(`[Evo11 Server] API Router active at http://localhost:${port}/api`)
    console.log(`[Evo11 Server] Health Check: http://localhost:${port}/api/health`)
  })
})

// --------------------------------------------------------------------------
// UNEXPECTED PROCESS EXCEPTIONS SHADOW-BOUNDARY
// --------------------------------------------------------------------------
process.on('uncaughtException', (err) => {
  console.error('[UNCAUGHT EXCEPTION] Core failure occurred! Terminating process...', err)
  process.exit(1)
})

process.on('unhandledRejection', (reason, promise) => {
  console.error('[UNHANDLED REJECTION] Unhandled promise rejection at:', promise, 'Reason:', reason)
  server.close(() => {
    process.exit(1)
  })
})

// --------------------------------------------------------------------------
// GRACEFUL HOST TERMINATION LIFECYCLES
// --------------------------------------------------------------------------
const gracefulShutdown = async (signal) => {
  console.log(`[${signal}] Received. Shutting down operational Express server gracefully...`)

  server.close(async () => {
    await disconnectDatabase()
    console.log('[Evo11 Server] Operational HTTP channels closed. Process terminating.')
    process.exit(0)
  })

  // Forced backup fallback exit timing (after 10s max)
  setTimeout(() => {
    console.error('[Evo11 Server] Shutdown timeout reached. Forcing immediate termination.')
    process.exit(1)
  }, 10000)
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
process.on('SIGINT', () => gracefulShutdown('SIGINT'))
