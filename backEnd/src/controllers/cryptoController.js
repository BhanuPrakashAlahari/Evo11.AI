import { cryptoService } from '../services/cryptoService.js'

/**
 * Retrieves real-time prices and trend data for BTC, ETH, and SOL.
 * GET /api/crypto
 */
export async function getCryptoData(req, res, next) {
  try {
    const data = await cryptoService.getCryptoTelemetry()
    
    // Disable client caching for real-time price updates
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    res.status(200).json(data)
  } catch (error) {
    next(error)
  }
}
