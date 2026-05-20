import mongoose from 'mongoose'

/**
 * Task Mongoose Schema
 * Covers: title, description, priority, completion, due date, timestamps
 */
const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      minlength: [1, 'Title must be at least 1 character'],
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
      default: ''
    },
    priority: {
      type: String,
      enum: {
        values: ['low', 'medium', 'high'],
        message: 'Priority must be low, medium, or high'
      },
      default: 'medium'
    },
    completed: {
      type: Boolean,
      default: false
    },
    dueDate: {
      type: Date,
      default: null
    },
    completedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
)

// Auto-set completedAt when task is marked complete
taskSchema.pre('save', async function () {
  if (this.isModified('completed')) {
    this.completedAt = this.completed ? new Date() : null
  }
})

// Index for efficient sorting queries
taskSchema.index({ completed: 1, priority: -1, createdAt: -1 })

export const Task = mongoose.model('Task', taskSchema)
