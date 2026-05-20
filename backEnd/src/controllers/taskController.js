import { taskService } from '../services/taskService.js'

const NO_CACHE = { 'Cache-Control': 'no-store, no-cache, must-revalidate' }

/**
 * GET /api/tasks
 * Returns all tasks sorted by pending → completed.
 */
export async function getTasks(req, res, next) {
  try {
    const tasks = await taskService.getAllTasks()
    res.set(NO_CACHE).status(200).json({ success: true, count: tasks.length, tasks })
  } catch (err) {
    next(err)
  }
}

/**
 * POST /api/tasks
 * Creates a new task. Requires { title } in body.
 */
export async function createTask(req, res, next) {
  try {
    const { title, description, priority, dueDate } = req.body

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, error: 'Task title is required.' })
    }

    const task = await taskService.createTask({ title, description, priority, dueDate })
    res.set(NO_CACHE).status(201).json({ success: true, task })
  } catch (err) {
    // Surface Mongoose validation errors cleanly
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message)
      return res.status(400).json({ success: false, error: messages.join(', ') })
    }
    next(err)
  }
}

/**
 * PATCH /api/tasks/:id
 * Partially updates a task (toggle complete, change priority, edit title etc.)
 */
export async function updateTask(req, res, next) {
  try {
    const task = await taskService.updateTask(req.params.id, req.body)
    res.set(NO_CACHE).status(200).json({ success: true, task })
  } catch (err) {
    if (err.statusCode === 404) {
      return res.status(404).json({ success: false, error: err.message })
    }
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message)
      return res.status(400).json({ success: false, error: messages.join(', ') })
    }
    next(err)
  }
}

/**
 * DELETE /api/tasks/:id
 * Permanently removes a task.
 */
export async function deleteTask(req, res, next) {
  try {
    await taskService.deleteTask(req.params.id)
    res.set(NO_CACHE).status(200).json({ success: true, message: 'Task deleted successfully.' })
  } catch (err) {
    if (err.statusCode === 404) {
      return res.status(404).json({ success: false, error: err.message })
    }
    next(err)
  }
}
