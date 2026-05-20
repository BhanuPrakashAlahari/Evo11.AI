import { healthService } from '../services/healthService.js'

/**
 * Handles health check GET endpoints.
 * Returns the exact requested shape: { success: true, message: "Server running" }
 * alongside system diagnostic payloads.
 */
export async function getHealth(req, res, next) {
  try {
    const diagnostics = await healthService.getSystemDiagnostics()
    
    res.status(200).json({
      success: true,
      message: 'Server running',
      timestamp: diagnostics.timestamp,
      uptime: `${diagnostics.uptime.toFixed(1)}s`,
      performance: diagnostics.performance
    })
  } catch (error) {
    next(error)
  }
}
