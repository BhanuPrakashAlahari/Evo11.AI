import http from 'http'
import app from './app.js'
import { config } from './config/env.js'

// Create standard HTTP server instance
const server = http.createServer(app)

// Start listener binding
const port = config.port
server.listen(port, () => {
  console.log(`[Evo11 Server] Bootstrapped successfully in "${config.nodeEnv}" mode.`)
  console.log(`[Evo11 Server] API Router active at http://localhost:${port}/api`)
  console.log(`[Evo11 Server] Health Check: http://localhost:${port}/api/health`)
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
  // Standard operational caution: gracefully restart process in production or simply log in dev
  server.close(() => {
    process.exit(1)
  })
})

// --------------------------------------------------------------------------
// GRACEFUL HOST TERMINATION LIFECYCLES
// --------------------------------------------------------------------------
const gracefulShutdown = (signal) => {
  console.log(`[${signal}] Received. Shutting down operational Express server gracefully...`)
  
  server.close(() => {
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
