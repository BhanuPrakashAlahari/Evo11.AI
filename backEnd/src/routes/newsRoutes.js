import { Router } from 'express'
import { getNews } from '../controllers/newsController.js'

const router = Router()

/**
 * Tech News Router
 * GET /api/news
 */
router.get('/', getNews)

export default router
