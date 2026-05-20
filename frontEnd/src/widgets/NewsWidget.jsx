import { Newspaper, ExternalLink } from 'lucide-react'

export default function NewsWidget({ isLoading }) {
  if (isLoading) {
    return (
      <div className="saas-card flex flex-col justify-between h-[230px] animate-pulse">
        <div>
          <div className="flex justify-between items-center pb-3 border-b border-saas-border/40">
            <div className="h-4 w-28 bg-zinc-800 rounded" />
            <div className="h-4 w-4 bg-zinc-800 rounded" />
          </div>
          <div className="mt-5 space-y-4">
            <div className="space-y-2">
              <div className="h-3 w-16 bg-zinc-800 rounded" />
              <div className="h-4 w-full bg-zinc-800 rounded" />
            </div>
            <div className="space-y-2">
              <div className="h-3 w-16 bg-zinc-800 rounded" />
              <div className="h-4 w-5/6 bg-zinc-800 rounded" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  const newsItems = [
    { id: 1, title: 'Vite 8.0 Released with React 19 Native Integration', source: 'Vite blog', readTime: '2 min read' },
    { id: 2, title: 'Tailwind CSS v4.0 Launches CSS-First Theme Architecture', source: 'Tailwind Labs', readTime: '4 min read' },
  ]

  return (
    <div className="saas-card-interactive flex flex-col justify-between h-[230px] group/news">
      {/* Glow effect */}
      <div className="absolute -top-10 -right-10 h-24 w-24 rounded-full bg-linear-purple/5 group-hover/news:bg-linear-purple/10 blur-xl transition-all" />

      <div>
        <div className="flex justify-between items-center pb-3 border-b border-saas-border/40">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
            <Newspaper className="h-3.5 w-3.5 text-zinc-400" />
            Developer News
          </span>
          <span className="h-2 w-2 rounded-full bg-indigo-500" />
        </div>

        {/* News headlines list */}
        <div className="mt-4 space-y-3.5">
          {newsItems.map((item) => (
            <div key={item.id} className="group/item space-y-1 block cursor-pointer">
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-bold tracking-wide uppercase px-1.5 py-0.5 rounded bg-zinc-950 border border-saas-border text-linear-purple">
                  {item.source}
                </span>
                <span className="text-[10px] text-zinc-500">{item.readTime}</span>
              </div>
              <h4 className="text-xs font-semibold text-zinc-300 group-hover/item:text-white leading-normal transition-colors line-clamp-2">
                {item.title}
              </h4>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-2 border-t border-saas-border/20 text-right">
        <a 
          href="#news" 
          className="text-[10px] font-semibold text-zinc-500 hover:text-white inline-flex items-center gap-1 transition-colors"
        >
          <span>Open News Hub</span>
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </div>
  )
}
