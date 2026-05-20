import os from 'os'

/**
 * Helper to get current CPU times sum across all cores.
 */
function getCpuTimes() {
  const cpus = os.cpus() || []
  let idle = 0
  let total = 0

  cpus.forEach((cpu) => {
    const { user, nice, sys, idle: cpuIdle, irq } = cpu.times
    idle += cpuIdle
    total += user + nice + sys + cpuIdle + irq
  })

  return { idle, total }
}

/**
 * Asynchronously calculates CPU usage percentage over a 100ms interval.
 */
function getCpuUsagePercent() {
  return new Promise((resolve) => {
    const first = getCpuTimes()
    setTimeout(() => {
      const second = getCpuTimes()
      const idleDiff = second.idle - first.idle
      const totalDiff = second.total - first.total
      if (totalDiff === 0) {
        resolve(0)
      } else {
        const usage = (1 - idleDiff / totalDiff) * 100
        resolve(parseFloat(usage.toFixed(2)))
      }
    }, 100)
  })
}

/**
 * Health check service.
 * Handles checks on memory usage, system uptime, and core operational details.
 */
class HealthService {
  /**
   * Retrieves server performance and status diagnostics.
   */
  async getSystemDiagnostics() {
    const cpuUsage = await getCpuUsagePercent()
    const totalMem = os.totalmem()
    const freeMem = os.freemem()
    const usedMem = totalMem - freeMem

    return {
      message: 'Server running',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      performance: {
        memory: {
          free: freeMem,
          total: totalMem,
          used: usedMem,
          usagePercent: ((usedMem / totalMem) * 100).toFixed(2)
        },
        cpu: {
          usagePercent: cpuUsage,
          cores: os.cpus().length,
          model: os.cpus()[0]?.model || 'Unknown CPU'
        },
        platform: {
          os: os.platform(), // e.g. darwin, win32, linux
          type: os.type(),     // e.g. Darwin, Windows_NT
          release: os.release(),
          arch: os.arch(),
          hostname: os.hostname()
        }
      }
    }
  }
}

export const healthService = new HealthService()
