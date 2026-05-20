import { Router } from 'express'
import { getTasks, createTask, updateTask, deleteTask } from '../controllers/taskController.js'

const router = Router()

router.get('/', getTasks)           // GET    /api/tasks
router.post('/', createTask)        // POST   /api/tasks
router.patch('/:id', updateTask)    // PATCH  /api/tasks/:id
router.delete('/:id', deleteTask)   // DELETE /api/tasks/:id

export default router
