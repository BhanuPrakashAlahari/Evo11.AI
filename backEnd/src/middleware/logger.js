import morgan from 'morgan'
import { config } from '../config/env.js'

// Simple custom format mapping for console logging
const logFormat = config.isProduction ? 'combined' : 'dev'

/**
 * HTTP Request Logging Middleware.
 * Standardizes log records for operational analysis and trace logging.
 */
export const requestLogger = morgan(logFormat)
