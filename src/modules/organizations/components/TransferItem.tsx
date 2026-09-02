import { cn } from '@/lib/utils'
import { ArrowRight } from 'lucide-react'

interface Props {
  playerName: string
  fromClub: string
  toClub: string
  timeAgo?: string
}

export function TransferItem({ playerName, fromClub, toClub, timeAgo = 'now' }: Props) {
  return (
    <div className="group flex items-center justify-between gap-sm p-md hover:bg-surface-container-high rounded-xl transition-all duration-300 border border-transparent hover:border-outline-variant/30">
      <div className="flex items-center gap-md flex-1">
        {/* From Club */}
        <div className="flex flex-col items-end min-w-[80px]">
          <span className="text-[10px] font-bold uppercase tracking-tighter text-on-surface-variant opacity-60">Origem</span>
          <span className="text-xs font-semibold truncate max-w-[100px] text-right text-on-surface">{fromClub}</span>
        </div>

        {/* Flow Indicator */}
        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-surface-container-high text-outline group-hover:text-primary transition-colors duration-300">
          <ArrowRight className="h-3 w-3" />
        </div>

        {/* Player Avatar & Name */}
        <div className="flex items-center gap-sm">
          <div className="h-8 w-8 rounded-full bg-primary-container text-primary font-bold flex items-center justify-center text-[10px] ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all duration-300">
            {playerName.split(' ').map(n => n[0]).slice(0,2).join('').toUpperCase()}
          </div>
          <span className="font-bold text-sm text-on-surface truncate max-w-[120px]">{playerName}</span>
        </div>

        {/* Flow Indicator */}
        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-surface-container-high text-outline group-hover:text-primary transition-colors duration-300">
          <ArrowRight className="h-3 w-3" />
        </div>

        {/* To Club */}
        <div className="flex flex-col items-start min-w-[80px]">
          <span className="text-[10px] font-bold uppercase tracking-tighter text-on-surface-variant opacity-60">Destino</span>
          <span className="text-xs font-semibold truncate max-w-[100px] text-on-surface">{toClub}</span>
        </div>
      </div>

      <div className="flex flex-col items-end gap-0 shrink-0 ml-md">
        <span className="text-[10px] font-bold text-success bg-success-container/20 px-1.5 py-0.5 rounded-full">
          Confirmado
        </span>
        <span className="text-[9px] text-on-surface-variant opacity-60">{timeAgo}</span>
      </div>
    </div>
  )
}

export default TransferItem
