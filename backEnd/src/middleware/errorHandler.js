import { config } from '../config/env.js'

/**
 * Centered Global Error Handling Middleware.
 * Prevents Express from crashing on unexpected exceptions and standardizes API error shapes.
 */
export function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500
  const message = err.message || 'Internal Server Error'

  // Log error stack trace internally for developers
  console.error(`[Error Handler] ${req.method} ${req.url} - Error:`, err)

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(config.nodeEnv === 'development' && { stack: err.stack })
  })
}

/**
 * Helper class for standard operational HTTP errors.
 */
export class AppError extends Error {
  constructor(message, statusCode) {
    super(message)
    this.statusCode = statusCode
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error'
    this.isOperational = true

    Error.captureStackTrace(this, this.constructor)
  }
}
