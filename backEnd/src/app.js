import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { config } from './config/env.js'
import { requestLogger } from './middleware/logger.js'
import { errorHandler, AppError } from './middleware/errorHandler.js'
import apiRoutes from './routes/index.js'

const app = express()

// 1. GLOBAL SECURITY & RESOURCE SHARING MIDDLEWARES
app.use(helmet()) // Apply standard security HTTP response headers
app.use(cors({
  origin: config.clientUrl,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
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
