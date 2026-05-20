import { Router } from 'express'
import { getCryptoData } from '../controllers/cryptoController.js'

const router = Router()

/**
 * Crypto Tracker Router.
 * GET /api/crypto
 */
router.get('/', getCryptoData)

export default router
