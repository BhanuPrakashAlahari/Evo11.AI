import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import mongoose from 'mongoose'
import { config } from './config/env.js'
import { connectDatabase } from './config/database.js'
import { requestLogger } from './middleware/logger.js'
import { errorHandler, AppError } from './middleware/errorHandler.js'
import apiRoutes from './routes/index.js'

const app = express()

// Ensure database connection for serverless/Vercel environments
app.use(async (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    try {
      await connectDatabase()
    } catch (err) {
      console.error('[Database Middleware] Connection error:', err.message)
    }
  }
  next()
})

// Disable ETag caching to prevent HTTP 304 status codes in development/testing
app.disable('etag')

// In development, allow any localhost port (handles Vite port shifts like 5173→5174 etc.)
const corsOrigin = (origin, callback) => {
  const isLocalhost = !origin || origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')
  if (isLocalhost || config.isProduction === false) {
    callback(null, true)
  } else if (origin === config.clientUrl) {
    callback(null, true)
  } else {
    callback(new Error(`CORS: Origin ${origin} not allowed`))
  }
}

app.use(cors({
  origin: corsOrigin,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-github-username', 'x-github-token'],
  credentials: true
}))

// 2. PARSERS & LOGGER MIDDLEWARES
app.use(express.json()) // Parse JSON payloads
app.use(express.urlencoded({ extended: true })) // Parse url-encoded payloads
app.use(requestLogger) // Write HTTP server telemetry logs

// 3. API ROUTING PREFIX MOUNT
app.use('/api', apiRoutes)

// 4. UNRESOLVED ROUTE HANDLING (404 Fallback)
app.use((req, res, next) => {
  next(new AppError(`Endpoint not found: ${req.method} ${req.url}`, 404))
})

// 5. GLOBAL CENTRALIZED ERROR WRAPPER MIDDLEWARE
app.use(errorHandler)

export default app
