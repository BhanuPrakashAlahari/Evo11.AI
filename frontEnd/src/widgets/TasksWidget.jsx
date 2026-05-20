import { useState } from 'react'
import { CheckSquare, Square, ClipboardList, Plus } from 'lucide-react'
import { cn } from '../utils/cn'

export default function TasksWidget({ isLoading }) {
  // Local task items state for premium interactive satisfaction
  const [tasks, setTasks] = useState([
    { id: 1, text: 'Deploy gateway proxy config', priority: 'High', completed: false },
    { id: 2, text: 'Review UI layout with team', priority: 'Medium', completed: true },
    { id: 3, text: 'Stabilize React API hooks', priority: 'Low', completed: false }
  ])

  const toggleTask = (id) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t))
  }

  if (isLoading) {
    return (
      <div className="saas-card flex flex-col justify-between h-[230px] animate-pulse">
        <div>
          <div className="flex justify-between items-center pb-3 border-b border-saas-border/40">
            <div className="h-4 w-28 bg-zinc-800 rounded" />
            <div className="h-4 w-4 bg-zinc-800 rounded" />
          </div>
          <div className="mt-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-4 w-4 bg-zinc-800 rounded" />
              <div className="h-3.5 w-5/6 bg-zinc-800 rounded" />
            </div>
            <div className="flex items-center gap-3">
              <div className="h-4 w-4 bg-zinc-800 rounded" />
              <div className="h-3.5 w-2/3 bg-zinc-800 rounded" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="saas-card-interactive flex flex-col justify-between h-[230px] group/tasks">
      {/* Glow highlight */}
      <div className="absolute -top-10 -right-10 h-24 w-24 rounded-full bg-linear-purple/5 group-hover/tasks:bg-linear-purple/10 blur-xl transition-all" />

      <div>
        <div className="flex justify-between items-center pb-3 border-b border-saas-border/40">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
            <ClipboardList className="h-3.5 w-3.5 text-zinc-400" />
            Pending Action Items
          </span>
          <button className="text-zinc-500 hover:text-white transition-colors cursor-pointer">
            <Plus className="h-4 w-4" />
          </button>
        </div>

        {/* Task lists interactive mapping */}
        <div className="mt-4 space-y-2.5">
          {tasks.map((task) => (
            <div 
              key={task.id} 
              onClick={() => toggleTask(task.id)}
              className="flex items-center justify-between gap-3 text-xs cursor-pointer group/item py-0.5"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {task.completed ? (
                  <CheckSquare className="h-4 w-4 text-linear-purple shrink-0" />
                ) : (
                  <Square className="h-4 w-4 text-zinc-500 group-hover/item:text-zinc-300 shrink-0 transition-colors" />
                )}
                <span className={cn(
                  "font-medium truncate transition-colors",
                  task.completed ? "text-zinc-500 line-through" : "text-zinc-300 group-hover/item:text-white"
                )}>
                  {task.text}
                </span>
              </div>
              <span className={cn(
                "text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded tracking-wide border shrink-0",
                task.priority === 'High' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                task.priority === 'Medium' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                'bg-zinc-800 border-saas-border text-zinc-500'
              )}>
                {task.priority}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-2 border-t border-saas-border/20 flex justify-between items-center text-[10px] text-zinc-500">
        <span>{tasks.filter(t => t.completed).length} of {tasks.length} done</span>
        <span className="text-linear-purple font-medium">Auto-sync active</span>
      </div>
    </div>
  )
}
