import React from 'react'
import { Link } from 'react-router-dom'
import { Newspaper, Heart, Share2, Play, Trophy, Shield, ArrowUpRight } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, Button } from '@/components/ui'
import type { FanFeedItem } from '../types'

interface FanFeedWidgetProps {
  feedItems: FanFeedItem[]
  onToggleLike: (feedId: string) => void
}

export function FanFeedWidget({ feedItems, onToggleLike }: FanFeedWidgetProps) {
  return (
    <Card className="border border-outline/30 bg-surface-container-low overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between border-b border-outline/20 pb-4">
        <div className="flex items-center gap-2">
          <Newspaper className="w-5 h-5 text-cyan-400" />
          <CardTitle className="text-lg font-bold text-on-surface">
            Feed dos Meus Clubes & Destaques
          </CardTitle>
        </div>
        <span className="text-xs text-on-surface-variant font-medium">
          Atualizado em tempo real
        </span>
      </CardHeader>

      <CardContent className="p-4 md:p-6 space-y-5">
        {feedItems.map((item) => (
          <div
            key={item.id}
            className="rounded-2xl p-4 md:p-5 bg-surface-container border border-outline/20 space-y-4 hover:border-outline/40 transition"
          >
            {/* Publisher Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-surface-container-high border border-outline/20 flex items-center justify-center overflow-hidden shrink-0">
                  {item.entityLogo ? (
                    <img src={item.entityLogo} alt={item.entityName} className="w-full h-full object-cover" />
                  ) : (
                    <Shield className="w-4 h-4 text-on-surface-variant" />
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-on-surface leading-tight">
                    {item.entityName}
                  </h4>
                  <p className="text-[11px] text-on-surface-variant">{item.timestamp}</p>
                </div>
              </div>

              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-surface-container-high text-cyan-400 border border-cyan-500/20">
                {item.type === 'highlight' ? 'Vídeo / Lance' : item.type === 'award' ? 'Prémio' : 'Resultado'}
              </span>
            </div>

            {/* Content & Media */}
            <div className="space-y-2">
              <h5 className="font-bold text-base text-white">{item.title}</h5>
              <p className="text-sm text-slate-300 leading-relaxed">{item.summary}</p>
            </div>

            {item.mediaUrl && (
              <div className="relative rounded-xl overflow-hidden border border-outline/20 aspect-video max-h-72 group">
                <img
                  src={item.mediaUrl}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {item.type === 'highlight' && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/20 transition-colors">
                    <div className="w-12 h-12 rounded-full bg-primary/90 text-surface flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Interactions Bar */}
            <div className="pt-2 border-t border-outline/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => onToggleLike(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    item.hasLiked
                      ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                      : 'text-on-surface-variant hover:text-rose-400 hover:bg-surface-container-high'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${item.hasLiked ? 'fill-rose-500' : ''}`} />
                  {item.likesCount}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({ title: item.title, text: item.summary, url: window.location.href }).catch(() => {})
                    }
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  Partilhar
                </button>
              </div>

              {item.actionUrl && (
                <Link
                  to={item.actionUrl}
                  className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                >
                  Ver no Calendário
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
