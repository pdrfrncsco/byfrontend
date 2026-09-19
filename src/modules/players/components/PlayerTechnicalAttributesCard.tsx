import React from 'react'
import { Link } from 'react-router-dom'
import { Activity, ArrowRight } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui'
import { playerRoutes } from '../routes'
import type { Player } from '../types'

export interface PlayerTechnicalAttributesCardProps {
  player: Player
  className?: string
}

export function PlayerTechnicalAttributesCard({
  player,
  className = '',
}: PlayerTechnicalAttributesCardProps) {
  // Technical attributes (dynamically calculated or realistic baseline)
  const technicalAttributes = [
    { label: 'Finalização', value: Math.min(95, 60 + (player.total_goals || 0) * 4), color: '#534ab7' },
    { label: 'Visão & Passe', value: Math.min(92, 65 + (player.total_assists || 0) * 5), color: '#185fa5' },
    { label: 'Físico & Resistência', value: Math.min(90, 70 + (player.total_matches || 0) * 2), color: '#0f6e56' },
    { label: 'Velocidade', value: 84, color: '#854f0b' },
    { label: 'Drible & Controlo', value: 80, color: '#a32d2d' },
  ]

  return (
    <Card className={`border border-outline-variant/30 bg-surface shadow-xs ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between pb-sm">
        <div className="flex items-center gap-xs">
          <Activity className="h-4 w-4 text-primary" />
          <CardTitle className="text-sm font-bold">Desempenho por Área de Jogo</CardTitle>
        </div>
        <Link to={playerRoutes.career} className="flex items-center gap-1 text-xs font-medium text-primary hover:underline">
          Ver histórico <ArrowRight className="h-3 w-3" />
        </Link>
      </CardHeader>
      <CardContent className="space-y-sm pt-xs">
        {technicalAttributes.map((attr) => (
          <div key={attr.label} className="flex items-center gap-sm text-xs">
            <span className="w-32 shrink-0 font-medium text-on-surface-variant">{attr.label}</span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-container">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${attr.value}%`, background: attr.color }}
              />
            </div>
            <span className="w-8 shrink-0 text-right font-bold text-on-surface">{attr.value}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
