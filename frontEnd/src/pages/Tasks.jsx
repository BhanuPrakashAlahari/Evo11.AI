import { useState, useEffect, useRef } from 'react'
import {
  CheckCircle2, Circle, Trash2, Plus, AlertCircle,
  RefreshCw, Flag, Database, Search, Filter,
  ClipboardList
} from 'lucide-react'
import { services } from '../services/api'

const PRIORITY_CONFIG = {
  high:   { label: 'High',   class: 'text-rose-400 bg-rose-500/10 border-rose-500/30',   dot: 'bg-rose-500' },
  medium: { label: 'Medium', class: 'text-amber-400 bg-amber-500/10 border-amber-500/30', dot: 'bg-amber-500' },
  low:    { label: 'Low',    class: 'text-sky-400 bg-sky-500/10 border-sky-500/30',       dot: 'bg-sky-300'  }
}

const PRIORITY_RANK = { high: 3, medium: 2, low: 1 }

export default function Tasks() {
  const [tasks, setTasks] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDbOffline, setIsDbOffline] = useState(false)
  const [hasError, setHasError] = useState(false)

  // New task form state
  const [newTitle, setNewTitle] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [newPriority, setNewPriority] = useState('medium')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  // Filter/search
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all') // all | pending | completed

  const inputRef = useRef(null)

  // ── Load tasks ──────────────────────────────────────────────────────────
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
          const msg = (err.message || '').toLowerCase()
          if (msg.includes('database') || err.status === 503) setIsDbOffline(true)
          else setHasError(true)
        }
      } finally {
        if (isActive) setIsLoading(false)
      }
    }
    load()
    return () => { isActive = false }
  }, [])

  // ── Create ──────────────────────────────────────────────────────────────
  const handleCreate = async () => {
    const title = newTitle.trim()
    if (!title) { setFormError('Title is required.'); return }
    setIsSubmitting(true)
    setFormError('')

    const tempId = `temp-${Date.now()}`
    const optimistic = {
      _id: tempId, title, description: newDesc.trim(),
      priority: newPriority, completed: false, createdAt: new Date().toISOString()
    }
    setTasks(prev => [optimistic, ...prev])
    setNewTitle(''); setNewDesc(''); setIsFormOpen(false)

    try {
      const res = await services.createTask({ title, description: newDesc.trim(), priority: newPriority })
      setTasks(prev => prev.map(t => t._id === tempId ? res.task : t))
    } catch (err) {
      setTasks(prev => prev.filter(t => t._id !== tempId))
      setFormError(err.message || 'Failed to create task.')
      setIsFormOpen(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  // ── Toggle complete ─────────────────────────────────────────────────────
  const handleToggle = async (task) => {
    const newVal = !task.completed
    setTasks(prev => prev.map(t => t._id === task._id ? { ...t, completed: newVal } : t))
    try {
      const res = await services.updateTask(task._id, { completed: newVal })
      setTasks(prev => prev.map(t => t._id === task._id ? res.task : t))
    } catch {
      setTasks(prev => prev.map(t => t._id === task._id ? { ...t, completed: task.completed } : t))
    }
  }

  // ── Delete ──────────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    const removed = tasks.find(t => t._id === id)
    setTasks(prev => prev.filter(t => t._id !== id))
    try {
      await services.deleteTask(id)
    } catch {
      if (removed) setTasks(prev => [removed, ...prev])
    }
  }

  // ── Derived lists ───────────────────────────────────────────────────────
  const sorted = [...tasks].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1
    return (PRIORITY_RANK[b.priority] || 0) - (PRIORITY_RANK[a.priority] || 0)
  })

  const filtered = sorted.filter(t => {
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'all' ? true : filter === 'pending' ? !t.completed : t.completed
    return matchSearch && matchFilter
  })

  const totalCount     = tasks.length
  const completedCount = tasks.filter(t => t.completed).length
  const pendingCount   = totalCount - completedCount
  const progress       = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  // ── DB Offline ──────────────────────────────────────────────────────────
  if (isDbOffline) {
    return (
      <div className="animate-fade-in space-y-4">
        <h1 className="text-3xl font-extrabold tracking-tight text-gradient-saas">Task Manager</h1>
        <div className="saas-card max-w-lg border-amber-500/20 bg-amber-950/5 space-y-3 p-6">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
            <Database className="h-5 w-5" />
            <span>Database Not Connected</span>
          </div>
          <p className="text-sm text-zinc-400 leading-relaxed">
            MongoDB is not configured. Add your Atlas connection string to enable persistent task storage.
          </p>
          <code className="block text-xs font-mono text-amber-400 bg-amber-500/5 border border-amber-500/10 rounded px-3 py-2">
            MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/evo11
          </code>
          <p className="text-xs text-zinc-600">Edit <span className="font-mono text-zinc-500">backEnd/.env</span> and restart the server.</p>
        </div>
      </div>
    )
  }

  if (hasError) {
    return (
      <div className="animate-fade-in space-y-4">
        <h1 className="text-3xl font-extrabold tracking-tight text-gradient-saas">Task Manager</h1>
        <div className="saas-card max-w-lg border-red-500/20 bg-red-950/5 space-y-3 p-6">
          <div className="flex items-center gap-2 text-red-400 font-bold text-sm">
            <AlertCircle className="h-5 w-5" /><span>Task Service Unavailable</span>
          </div>
          <p className="text-xs text-zinc-400">Backend may be offline. Start the server and refresh.</p>
          <button onClick={() => window.location.reload()} className="btn-saas-secondary py-2 flex items-center gap-2 cursor-pointer text-xs">
            <RefreshCw className="h-3.5 w-3.5" />Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fade-in space-y-6">

      {/* ── Page Header ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-5 border-b border-saas-border">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gradient-saas">Task Manager</h1>
          <p className="text-sm text-zinc-400 mt-1">Manage your tasks, track priorities and stay on top of your work.</p>
        </div>
        <button
          onClick={() => { setIsFormOpen(true); setTimeout(() => inputRef.current?.focus(), 50) }}
          className="btn-saas-primary flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>New Task</span>
        </button>
      </div>

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total', value: totalCount,     color: 'text-white' },
          { label: 'Pending', value: pendingCount,  color: 'text-amber-400' },
          { label: 'Done',  value: completedCount,  color: 'text-emerald-400' }
        ].map(stat => (
          <div key={stat.label} className="saas-card text-center py-4">
            <div className={`text-3xl font-extrabold ${stat.color}`}>{isLoading ? '—' : stat.value}</div>
            <div className="text-xs text-zinc-500 mt-1 font-medium uppercase tracking-wider">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* ── Progress Bar ── */}
      {totalCount > 0 && (
        <div className="saas-card py-3 px-4 flex items-center gap-4">
          <span className="text-xs text-zinc-500 shrink-0 w-20">Progress</span>
          <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-linear-purple to-emerald-500 rounded-full transition-all duration-700"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs font-bold text-zinc-400 shrink-0 w-10 text-right">{progress}%</span>
        </div>
      )}

      {/* ── New Task Form ── */}
      {isFormOpen && (
        <div className="saas-card border-linear-purple/20 bg-linear-purple/3 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <ClipboardList className="h-4 w-4 text-linear-purple" />
            Create New Task
          </h3>

          {formError && (
            <div className="flex items-center gap-2 text-rose-400 text-xs bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />{formError}
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-xs text-zinc-500 mb-1.5 font-medium">Title <span className="text-rose-500">*</span></label>
              <input
                ref={inputRef}
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCreate()}
                placeholder="What needs to be done?"
                className="w-full bg-zinc-900 border border-saas-border focus:border-linear-purple/60 outline-none rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 transition-colors"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs text-zinc-500 mb-1.5 font-medium">Description <span className="text-zinc-600">(optional)</span></label>
              <textarea
                value={newDesc}
                onChange={e => setNewDesc(e.target.value)}
                placeholder="Add more details..."
                rows={2}
                className="w-full bg-zinc-900 border border-saas-border focus:border-linear-purple/60 outline-none rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 transition-colors resize-none"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1.5 font-medium">Priority</label>
              <div className="flex gap-2">
                {['low', 'medium', 'high'].map(p => {
                  const cfg = PRIORITY_CONFIG[p]
                  return (
                    <button
                      key={p}
                      onClick={() => setNewPriority(p)}
                      className={`flex-1 text-xs font-bold py-1.5 rounded-lg border transition-all cursor-pointer ${
                        newPriority === p ? cfg.class : 'border-saas-border text-zinc-600 hover:border-zinc-600 hover:text-zinc-400'
                      }`}
                    >
                      {cfg.label}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-1">
            <button
              onClick={() => { setIsFormOpen(false); setFormError('') }}
              className="btn-saas-secondary text-xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={isSubmitting}
              className="btn-saas-primary text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
              {isSubmitting ? 'Saving...' : 'Create Task'}
            </button>
          </div>
        </div>
      )}

      {/* ── Search & Filter Bar ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-600" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search tasks..."
            className="w-full bg-saas-card border border-saas-border focus:border-linear-purple/40 outline-none rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-zinc-600 transition-colors"
          />
        </div>
        <div className="flex items-center gap-1 bg-saas-card border border-saas-border rounded-lg p-1">
          <Filter className="h-3.5 w-3.5 text-zinc-600 ml-1.5" />
          {[
            { key: 'all', label: 'All' },
            { key: 'pending', label: 'Pending' },
            { key: 'completed', label: 'Done' }
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`text-xs font-medium px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                filter === f.key
                  ? 'bg-linear-purple/15 text-linear-purple border border-linear-purple/20'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Task List ── */}
      <div className="space-y-2">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="saas-card flex items-center gap-4 animate-pulse">
              <div className="h-5 w-5 rounded-full bg-zinc-800 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 bg-zinc-800 rounded w-3/4" />
                <div className="h-2.5 bg-zinc-800 rounded w-1/2" />
              </div>
              <div className="h-5 w-14 bg-zinc-800 rounded shrink-0" />
            </div>
          ))
        ) : filtered.length === 0 ? (
          <div className="saas-card flex flex-col items-center justify-center py-16 text-center">
            <CheckCircle2 className="h-10 w-10 text-zinc-700 mb-3" />
            <p className="text-sm font-semibold text-zinc-400">
              {search ? 'No tasks match your search.' : filter === 'completed' ? 'No completed tasks yet.' : 'No tasks yet!'}
            </p>
            <p className="text-xs text-zinc-600 mt-1">
              {!search && filter === 'all' && 'Click "New Task" to get started.'}
            </p>
          </div>
        ) : (
          filtered.map(task => {
            const p = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium
            return (
              <div
                key={task._id}
                className={`group saas-card flex items-start gap-4 transition-all duration-200 hover:border-saas-border hover:bg-zinc-900/40 ${
                  task.completed ? 'opacity-55' : ''
                }`}
              >
                {/* Toggle */}
                <button
                  onClick={() => handleToggle(task)}
                  className="mt-0.5 shrink-0 text-zinc-600 hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  {task.completed
                    ? <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    : <Circle className="h-5 w-5" />
                  }
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold leading-snug transition-colors ${
                    task.completed ? 'line-through text-zinc-600' : 'text-zinc-200 group-hover:text-white'
                  }`}>
                    {task.title}
                  </p>
                  {task.description && (
                    <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed line-clamp-2">{task.description}</p>
                  )}
                  <p className="text-[10px] text-zinc-700 mt-1">
                    {new Date(task.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>

                {/* Priority Badge */}
                <span className={`shrink-0 text-[10px] font-bold px-2 py-1 rounded-lg border flex items-center gap-1 ${p.class}`}>
                  <Flag className="h-2.5 w-2.5" />
                  {p.label}
                </span>

                {/* Delete (visible on hover) */}
                <button
                  onClick={() => handleDelete(task._id)}
                  className="shrink-0 mt-0.5 text-zinc-700 hover:text-rose-400 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                  title="Delete task"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            )
          })
        )}
      </div>

      {/* ── Footer ── */}
      {!isLoading && totalCount > 0 && (
        <div className="flex items-center justify-between text-xs text-zinc-600 pt-2 border-t border-saas-border/30">
          <span>{filtered.length} of {totalCount} tasks shown</span>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Connected to MongoDB
          </span>
        </div>
      )}
    </div>
  )
}
