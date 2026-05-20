import { useState, useEffect, useRef } from 'react'
import {
  CheckCircle2, Circle, Trash2, Plus, AlertCircle,
  RefreshCw, Flag, Database
} from 'lucide-react'
import { services } from '../services/api'

// Priority label config
const PRIORITY = {
  high:   { label: 'High',   class: 'text-rose-400 bg-rose-500/10 border-rose-500/25' },
  medium: { label: 'Med',    class: 'text-amber-400 bg-amber-500/10 border-amber-500/25' },
  low:    { label: 'Low',    class: 'text-sky-400 bg-sky-500/10 border-sky-500/25' }
}

export default function TasksWidget({ isLoading: isParentLoading }) {
  const [tasks, setTasks] = useState([])
  const [isLocalLoading, setIsLocalLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [newTitle, setNewTitle] = useState('')
  const [newPriority, setNewPriority] = useState('medium')
  const [isAdding, setIsAdding] = useState(false)
  const [isDbOffline, setIsDbOffline] = useState(false)
  const inputRef = useRef(null)

  // ── Fetch all tasks on mount ──────────────────────────────────────────────
  useEffect(() => {
    let isActive = true
    const load = async () => {
      try {
        const res = await services.getTasks()
        if (isActive) {
          setTasks(res.tasks)
          setHasError(false)
          setIsDbOffline(false)
        }
      } catch (err) {
        if (isActive) {
          const msg = err.message || ''
          if (msg.toLowerCase().includes('database') || err.status === 503) {
            setIsDbOffline(true)
          } else {
            setHasError(true)
            setErrorMsg(msg)
          }
        }
      } finally {
        if (isActive) setIsLocalLoading(false)
      }
    }
    load()
    return () => { isActive = false }
  }, [])

  // ── Create task (optimistic) ──────────────────────────────────────────────
  const handleCreate = async () => {
    const title = newTitle.trim()
    if (!title) return

    // Optimistic insert
    const tempId = `temp-${Date.now()}`
    const optimistic = { _id: tempId, title, priority: newPriority, completed: false, createdAt: new Date().toISOString() }
    setTasks(prev => [optimistic, ...prev])
    setNewTitle('')
    setIsAdding(false)

    try {
      const res = await services.createTask({ title, priority: newPriority })
      // Replace temp with real document from DB
      setTasks(prev => prev.map(t => t._id === tempId ? res.task : t))
    } catch (err) {
      // Rollback on failure
      setTasks(prev => prev.filter(t => t._id !== tempId))
      setErrorMsg(err.message || 'Failed to create task.')
    }
  }

  // ── Toggle complete (optimistic) ──────────────────────────────────────────
  const handleToggle = async (task) => {
    const newCompleted = !task.completed
    // Optimistic update
    setTasks(prev => prev.map(t => t._id === task._id ? { ...t, completed: newCompleted } : t))
    try {
      const res = await services.updateTask(task._id, { completed: newCompleted })
      setTasks(prev => prev.map(t => t._id === task._id ? res.task : t))
    } catch {
      // Rollback
      setTasks(prev => prev.map(t => t._id === task._id ? { ...t, completed: task.completed } : t))
    }
  }

  // ── Delete task (optimistic) ──────────────────────────────────────────────
  const handleDelete = async (id) => {
    const removed = tasks.find(t => t._id === id)
    setTasks(prev => prev.filter(t => t._id !== id))
    try {
      await services.deleteTask(id)
    } catch {
      // Rollback
      if (removed) setTasks(prev => [removed, ...prev])
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleCreate()
    if (e.key === 'Escape') { setIsAdding(false); setNewTitle('') }
  }

  const showSkeleton = isParentLoading || isLocalLoading

  // ── Skeleton ─────────────────────────────────────────────────────────────
  if (showSkeleton) {
    return (
      <div className="saas-card flex flex-col h-[230px] animate-pulse">
        <div className="flex justify-between items-center pb-3 border-b border-saas-border/40 shrink-0">
          <div className="h-4 w-20 bg-zinc-800 rounded" />
          <div className="h-6 w-16 bg-zinc-800 rounded" />
        </div>
        <div className="mt-4 space-y-3 flex-1">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-4 w-4 bg-zinc-800 rounded-full shrink-0" />
              <div className="h-3 bg-zinc-800 rounded flex-1" />
              <div className="h-4 w-8 bg-zinc-800 rounded shrink-0" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  // ── DB Offline notice ─────────────────────────────────────────────────────
  if (isDbOffline) {
    return (
      <div className="saas-card flex flex-col justify-between h-[230px] border-amber-500/20 bg-amber-950/5">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
            <Database className="h-4 w-4" />
            <span>Database Not Connected</span>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            MongoDB is not configured. Add your connection string to get persistent task storage.
          </p>
          <code className="block text-[10px] font-mono text-amber-400 bg-amber-500/5 border border-amber-500/10 rounded px-2 py-1.5 mt-2">
            MONGODB_URI=mongodb+srv://...
          </code>
        </div>
        <p className="text-[10px] text-zinc-600 mt-2">Edit <span className="font-mono text-zinc-500">backEnd/.env</span> and restart the server.</p>
      </div>
    )
  }

  // ── Error ─────────────────────────────────────────────────────────────────
  if (hasError) {
    return (
      <div className="saas-card flex flex-col justify-between h-[230px] border-red-500/20 bg-red-950/5">
        <div className="flex items-center gap-2 text-red-400 font-bold text-xs uppercase tracking-wider">
          <AlertCircle className="h-4 w-4" />
          <span>Task Service Unavailable</span>
        </div>
        <p className="text-xs text-zinc-400">{errorMsg || 'Backend unreachable.'}</p>
        <button onClick={() => window.location.reload()} className="w-full btn-saas-secondary py-2 flex items-center justify-center gap-2 cursor-pointer text-xs">
          <RefreshCw className="h-3 w-3" />Retry
        </button>
      </div>
    )
  }

  // Sort: pending first by priority rank, then completed at bottom
  const priorityRank = { high: 3, medium: 2, low: 1 }
  const sorted = [...tasks].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1
    return (priorityRank[b.priority] || 0) - (priorityRank[a.priority] || 0)
  })
  const pending = sorted.filter(t => !t.completed).length

  return (
    <div className="saas-card-interactive flex flex-col h-[230px] group/tasks">
      <div className="absolute -top-8 -right-8 h-20 w-20 rounded-full bg-emerald-500/5 group-hover/tasks:bg-emerald-500/8 blur-xl transition-all duration-500" />

      {/* Header */}
      <div className="flex justify-between items-center pb-2.5 border-b border-saas-border/40 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Tasks</span>
          {pending > 0 && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-linear-purple/15 border border-linear-purple/25 text-linear-purple font-mono">
              {pending}
            </span>
          )}
        </div>
        <button
          onClick={() => { setIsAdding(true); setTimeout(() => inputRef.current?.focus(), 50) }}
          className="flex items-center gap-1 text-[10px] font-bold text-zinc-400 hover:text-white border border-saas-border hover:border-linear-purple/40 hover:bg-linear-purple/5 px-2 py-1 rounded transition-all cursor-pointer"
        >
          <Plus className="h-3 w-3" />
          <span>Add</span>
        </button>
      </div>

      {/* Add Task Input */}
      {isAdding && (
        <div className="flex gap-2 items-center mt-2.5 shrink-0">
          <input
            ref={inputRef}
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Task title..."
            className="flex-1 bg-zinc-900 border border-saas-border focus:border-linear-purple/50 outline-none rounded-lg px-3 py-1.5 text-xs text-white placeholder-zinc-600 transition-colors"
          />
          <select
            value={newPriority}
            onChange={e => setNewPriority(e.target.value)}
            className="bg-zinc-900 border border-saas-border rounded-lg px-2 py-1.5 text-xs text-zinc-400 outline-none cursor-pointer"
          >
            <option value="high">High</option>
            <option value="medium">Med</option>
            <option value="low">Low</option>
          </select>
          <button
            onClick={handleCreate}
            className="bg-linear-purple/20 hover:bg-linear-purple/30 border border-linear-purple/30 text-white px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer"
          >
            Save
          </button>
        </div>
      )}

      {/* Task List */}
      <div className="flex-1 overflow-y-auto mt-2 space-y-1 pr-0.5" style={{ scrollbarWidth: 'none' }}>
        {sorted.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-zinc-600 gap-1.5">
            <CheckCircle2 className="h-6 w-6 opacity-30" />
            <p className="text-xs">No tasks yet. Click <strong className="text-zinc-400">+ Add</strong> to create one.</p>
          </div>
        )}

        {sorted.map(task => {
          const p = PRIORITY[task.priority] || PRIORITY.medium
          return (
            <div
              key={task._id}
              className={`group/task flex items-center gap-2.5 px-2 py-1.5 rounded-lg border border-transparent hover:border-saas-border/40 hover:bg-zinc-900/50 transition-all duration-150 ${
                task.completed ? 'opacity-45' : ''
              }`}
            >
              {/* Toggle button */}
              <button
                onClick={() => handleToggle(task)}
                className="shrink-0 text-zinc-600 hover:text-emerald-400 transition-colors cursor-pointer"
              >
                {task.completed
                  ? <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  : <Circle className="h-4 w-4" />}
              </button>

              {/* Title */}
              <span className={`flex-1 text-xs leading-snug truncate transition-colors ${
                task.completed ? 'line-through text-zinc-600' : 'text-zinc-300 group-hover/task:text-white'
              }`}>
                {task.title}
              </span>

              {/* Priority label */}
              <span className={`shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded border ${p.class} flex items-center gap-0.5`}>
                <Flag className="h-2 w-2" />
                {p.label}
              </span>

              {/* Delete button — visible on hover */}
              <button
                onClick={() => handleDelete(task._id)}
                className="shrink-0 text-zinc-700 hover:text-rose-400 transition-colors opacity-0 group-hover/task:opacity-100 cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          )
        })}
      </div>

      {/* Footer status */}
      <div className="pt-2 border-t border-saas-border/20 shrink-0 flex justify-between items-center">
        <span className="text-[10px] text-zinc-600">
          {tasks.filter(t => t.completed).length} of {tasks.length} done
        </span>
        <span className="flex items-center gap-1 text-[10px] text-emerald-500">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          MongoDB
        </span>
      </div>
    </div>
  )
}
