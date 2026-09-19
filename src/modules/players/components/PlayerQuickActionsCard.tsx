import React from 'react'
import { Link } from 'react-router-dom'
import { Edit, FileText, HeartPulse, Handshake, ArrowLeftRight, Zap } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui'
import { playerRoutes } from '../routes'

export interface PlayerQuickActionsCardProps {
  className?: string
}

export function PlayerQuickActionsCard({ className = '' }: PlayerQuickActionsCardProps) {
  return (
    <Card className={`border border-outline-variant/30 bg-surface shadow-xs ${className}`}>
      <CardHeader className="pb-xs">
        <div className="flex items-center gap-xs">
          <Zap className="h-4 w-4 text-amber-500" />
          <CardTitle className="text-sm font-bold">Ações Rápidas</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-sm pt-xs">
        <div className="grid grid-cols-2 gap-xs">
          {/* Action 1: Editar Perfil */}
          <Link
            to={playerRoutes.dashboardSettings}
            className="flex items-center gap-2 rounded-xl border border-outline-variant/20 p-2.5 transition-colors hover:bg-surface-container/60"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#eeedfe] text-[#534ab7]">
              <Edit className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="truncate font-semibold text-xs text-on-surface">Editar perfil</p>
              <p className="text-[10px] text-on-surface-variant">Atualizar dados</p>
            </div>
          </Link>

          {/* Action 2: Contratos */}
          <Link
            to={playerRoutes.contracts}
            className="flex items-center gap-2 rounded-xl border border-outline-variant/20 p-2.5 transition-colors hover:bg-surface-container/60"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#e6f1fb] text-[#185fa5]">
              <FileText className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="truncate font-semibold text-xs text-on-surface">Contratos</p>
              <p className="text-[10px] text-on-surface-variant">Ver acordos</p>
            </div>
          </Link>

          {/* Action 3: Dossiê Médico */}
          <Link
            to={playerRoutes.medical}
            className="flex items-center gap-2 rounded-xl border border-outline-variant/20 p-2.5 transition-colors hover:bg-surface-container/60"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#fcebeb] text-[#a32d2d]">
              <HeartPulse className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="truncate font-semibold text-xs text-on-surface">Dossiê médico</p>
              <p className="text-[10px] text-on-surface-variant">Aptidão & exames</p>
            </div>
          </Link>

          {/* Action 4: Vincular Clube */}
          <Link
            to={playerRoutes.linkClub}
            className="flex items-center gap-2 rounded-xl border border-outline-variant/20 p-2.5 transition-colors hover:bg-surface-container/60"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#e1f5ee] text-[#0f6e56]">
              <Handshake className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="truncate font-semibold text-xs text-on-surface">Vínculos</p>
              <p className="text-[10px] text-on-surface-variant">Pedir filiação</p>
            </div>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
