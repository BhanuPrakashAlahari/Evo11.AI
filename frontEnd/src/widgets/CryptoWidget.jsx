import { TrendingUp, TrendingDown, RefreshCw } from 'lucide-react'

export default function CryptoWidget({ isLoading }) {
  if (isLoading) {
    return (
      <div className="saas-card flex flex-col justify-between h-[230px] animate-pulse">
        <div>
          <div className="flex justify-between items-center pb-3 border-b border-saas-border/40">
            <div className="h-4 w-28 bg-zinc-800 rounded" />
            <div className="h-4 w-4 bg-zinc-800 rounded" />
          </div>
          <div className="mt-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-7 w-7 bg-zinc-800 rounded-full" />
                <div className="space-y-1.5">
                  <div className="h-3.5 w-12 bg-zinc-800 rounded" />
                  <div className="h-2.5 w-8 bg-zinc-800 rounded" />
                </div>
              </div>
              <div className="h-5 w-20 bg-zinc-800 rounded" />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-7 w-7 bg-zinc-800 rounded-full" />
                <div className="space-y-1.5">
                  <div className="h-3.5 w-12 bg-zinc-800 rounded" />
                  <div className="h-2.5 w-8 bg-zinc-800 rounded" />
                </div>
              </div>
              <div className="h-5 w-20 bg-zinc-800 rounded" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="saas-card-interactive flex flex-col justify-between h-[230px] group/crypto">
      {/* Light accent glow */}
      <div className="absolute -top-10 -right-10 h-24 w-24 rounded-full bg-linear-purple/5 group-hover/crypto:bg-linear-purple/10 blur-xl transition-all" />

      <div>
        <div className="flex justify-between items-center pb-3 border-b border-saas-border/40">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Asset Tracker</span>
          <RefreshCw className="h-3.5 w-3.5 text-zinc-500 group-hover/crypto:rotate-180 transition-transform duration-500 cursor-pointer" />
        </div>

        {/* Crypto List */}
        <div className="mt-4 space-y-3.5">
          {/* BTC Item */}
          <div className="flex items-center justify-between py-1 border-b border-saas-border/20 last:border-0 pb-2">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-amber-500/10 border border-amber-500/25 flex items-center justify-center font-bold text-amber-500 text-xs font-mono">
                ₿
              </div>
              <div>
                <div className="text-xs font-bold text-white">BTC / USD</div>
                <div className="text-[10px] text-zinc-500">Bitcoin</div>
              </div>
            </div>
            <div className="text-right flex items-center gap-2">
              {/* BTC Sparkline SVG */}
              <svg className="w-12 h-6 text-emerald-500" viewBox="0 0 50 20">
                <path 
                  d="M0,15 Q10,5 20,12 T40,4 T50,8" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="1.5"
                />
              </svg>
              <div>
                <div className="text-xs font-bold text-white font-mono">$96,480.00</div>
                <div className="text-[9px] font-semibold text-emerald-500 flex items-center gap-0.5 justify-end">
                  <TrendingUp className="h-2 w-2" />
                  <span>+3.2%</span>
                </div>
              </div>
            </div>
          </div>

          {/* ETH Item */}
          <div className="flex items-center justify-between py-1 border-b border-saas-border/20 last:border-0 pb-1">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center font-bold text-indigo-400 text-xs font-mono">
                Ξ
              </div>
              <div>
                <div className="text-xs font-bold text-white">ETH / USD</div>
                <div className="text-[10px] text-zinc-500">Ethereum</div>
              </div>
            </div>
            <div className="text-right flex items-center gap-2">
              {/* ETH Sparkline SVG */}
              <svg className="w-12 h-6 text-indigo-400" viewBox="0 0 50 20">
                <path 
                  d="M0,10 Q10,18 20,8 T40,15 T50,3" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="1.5"
                />
              </svg>
              <div>
                <div className="text-xs font-bold text-white font-mono">$3,425.50</div>
                <div className="text-[9px] font-semibold text-indigo-400 flex items-center gap-0.5 justify-end">
                  <TrendingDown className="h-2 w-2" />
                  <span>-1.4%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
