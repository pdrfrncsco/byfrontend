import { Activity, AlertTriangle, CheckCircle2, Flame, HeartPulse, Shield, Target, Trophy } from 'lucide-react'
import type { Player, PlayerMedicalProfile } from '../types'

interface PlayerKpisBarProps {
  player: Player
  medicalProfile?: PlayerMedicalProfile | null
  className?: string
}

export function PlayerKpisBar({ player, medicalProfile, className = '' }: PlayerKpisBarProps) {
  const isMedicalFit = medicalProfile?.medical_status === 'fit' || medicalProfile?.medical_clearance === true
  const yellowCards = (player as unknown as { yellow_cards?: number }).yellow_cards ?? 0

  return (
    <div className={`grid grid-cols-2 gap-sm sm:grid-cols-3 md:grid-cols-5 ${className}`}>
      {/* Jogos */}
      <div className="rounded-xl border border-outline-variant/30 bg-surface p-md shadow-xs">
        <div className="mb-2 flex items-center gap-xs text-xs text-on-surface-variant">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#eeedfe] text-[#534ab7]">
            <Activity className="h-3.5 w-3.5" />
          </div>
          <span className="font-medium">Jogos</span>
        </div>
        <div className="text-2xl font-bold text-on-surface">{player.total_matches ?? 0}</div>
        <div className="mt-1 flex items-center gap-1 text-[11px] text-emerald-600">
          <Flame className="h-3 w-3" />
          Esta época
        </div>
      </div>

      {/* Golos */}
      <div className="rounded-xl border border-outline-variant/30 bg-surface p-md shadow-xs">
        <div className="mb-2 flex items-center gap-xs text-xs text-on-surface-variant">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#e1f5ee] text-[#0f6e56]">
            <Trophy className="h-3.5 w-3.5" />
          </div>
          <span className="font-medium">Golos</span>
        </div>
        <div className="text-2xl font-bold text-on-surface">{player.total_goals ?? 0}</div>
        <div className="mt-1 flex items-center gap-1 text-[11px] text-emerald-600">
          <CheckCircle2 className="h-3 w-3" />
          Rendimento ativo
        </div>
      </div>

      {/* Assistências */}
      <div className="rounded-xl border border-outline-variant/30 bg-surface p-md shadow-xs">
        <div className="mb-2 flex items-center gap-xs text-xs text-on-surface-variant">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#e6f1fb] text-[#185fa5]">
            <Target className="h-3.5 w-3.5" />
          </div>
          <span className="font-medium">Assistências</span>
        </div>
        <div className="text-2xl font-bold text-on-surface">{player.total_assists ?? 0}</div>
        <div className="mt-1 flex items-center gap-1 text-[11px] text-on-surface-variant">
          Decisivo
        </div>
      </div>

      {/* Disciplina */}
      <div className="rounded-xl border border-outline-variant/30 bg-surface p-md shadow-xs">
        <div className="mb-2 flex items-center gap-xs text-xs text-on-surface-variant">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#faeeda] text-[#854f0b]">
            <AlertTriangle className="h-3.5 w-3.5" />
          </div>
          <span className="font-medium">Disciplina</span>
        </div>
        <div className="text-2xl font-bold text-on-surface">
          {yellowCards}
          <span className="text-xs font-normal text-on-surface-variant ml-1">Amarelos</span>
        </div>
        <div className="mt-1 flex items-center gap-1 text-[11px] text-amber-600">
          <Shield className="h-3 w-3" />
          Fair-play
        </div>
      </div>

      {/* Aptidão Médica */}
      <div className="rounded-xl border border-outline-variant/30 bg-surface p-md shadow-xs col-span-2 sm:col-span-1">
        <div className="mb-2 flex items-center gap-xs text-xs text-on-surface-variant">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#fcebeb] text-[#a32d2d]">
            <HeartPulse className="h-3.5 w-3.5" />
          </div>
          <span className="font-medium">Aptidão Médica</span>
        </div>
        <div className="text-xl font-bold text-on-surface truncate">
          {isMedicalFit ? 'Apto' : 'Exame Pend.'}
        </div>
        <div className="mt-1 flex items-center gap-1 text-[11px] text-on-surface-variant">
          {isMedicalFit ? (
            <span className="text-emerald-600">Alta médica ativa</span>
          ) : (
            <span className="text-amber-600">Requer validação</span>
          )}
        </div>
      </div>
    </div>
  )
}
