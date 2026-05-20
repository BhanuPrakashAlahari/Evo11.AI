import { Task } from '../models/Task.js'
import mongoose from 'mongoose'

/**
 * Checks if the MongoDB connection is active before any DB operation.
 */
function assertDbConnected() {
  if (mongoose.connection.readyState !== 1) {
    const err = new Error('Database is not connected. Please configure MONGODB_URI in your .env file.')
    err.statusCode = 503
    throw err
  }
}

class TaskService {
  /**
   * Returns all tasks sorted: pending first by priority, then completed at bottom.
   */
  async getAllTasks() {
    assertDbConnected()
    const tasks = await Task.find()
      .sort({ completed: 1, priority: -1, createdAt: -1 })
      .lean()
    return tasks
  }

  /**
   * Creates a new task with validated fields.
   */
  async createTask({ title, description, priority, dueDate }) {
    assertDbConnected()
    const task = new Task({
      title: title?.trim(),
      description: description?.trim() || '',
      priority: priority || 'medium',
      dueDate: dueDate ? new Date(dueDate) : null
    })
    await task.save()
    return task.toObject()
  }

  /**
   * Updates any combination of fields on an existing task.
   * Supports partial updates (PATCH semantics).
   */
  async updateTask(id, updates) {
    assertDbConnected()
    const allowedFields = ['title', 'description', 'priority', 'completed', 'dueDate']
    const sanitized = {}

    for (const key of allowedFields) {
      if (updates[key] !== undefined) sanitized[key] = updates[key]
    }

    // Auto-set completedAt when toggling completion
    if (typeof sanitized.completed === 'boolean') {
      sanitized.completedAt = sanitized.completed ? new Date() : null
    }

    const task = await Task.findByIdAndUpdate(
      id,
      { $set: sanitized },
      { new: true, runValidators: true }
    ).lean()

    if (!task) {
      const err = new Error('Task not found')
      err.statusCode = 404
      throw err
    }

    return task
  }

  /**
   * Permanently deletes a task by ID.
   */
  async deleteTask(id) {
    assertDbConnected()
    const task = await Task.findByIdAndDelete(id).lean()
    if (!task) {
      const err = new Error('Task not found')
      err.statusCode = 404
      throw err
    }
    return task
  }
}

export const taskService = new TaskService()
