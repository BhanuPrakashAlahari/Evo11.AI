import os from 'os'

/**
 * Health check service.
 * Handles checks on memory usage, system uptime, and core operational details.
 */
class HealthService {
  /**
   * Retrieves server performance and status diagnostics.
   */
  async getSystemDiagnostics() {
    return {
      message: 'Server running',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      performance: {
        memory: {
          free: os.freemem(),
          total: os.totalmem(),
          usagePercent: ((os.totalmem() - os.freemem()) / os.totalmem() * 100).toFixed(2)
        },
        cpuLoad: os.loadavg()
      }
    }
  }
}

export const healthService = new HealthService()
