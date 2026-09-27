import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Newspaper,
  Heart,
  Share2,
  Play,
  MessageCircle,
  Pin,
  CheckCircle2,
  Shield,
  ArrowUpRight,
  Send,
  Flame,
  Megaphone,
  Trophy,
  Radio,
  Sparkles,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui'
import type { FanFeedItem, PostCategory } from '../types'

interface FanFeedWidgetProps {
  feedItems: FanFeedItem[]
  onToggleLike: (feedId: string) => void
  onAddComment?: (feedId: string, content: string) => void
}

const CATEGORY_BADGES: Record<
  string,
  { label: string; icon: React.ComponentType<{ className?: string }>; badgeBg: string }
> = {
  matchday: {
    label: 'Dia de Jogo',
    icon: Flame,
    badgeBg: 'bg-amber-500/15 border-amber-500/30 text-amber-300',
  },
  announcement: {
    label: 'Comunicado Oficial',
    icon: Megaphone,
    badgeBg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300',
  },
  training: {
    label: 'Treino & Bastidores',
    icon: Trophy,
    badgeBg: 'bg-blue-500/15 border-blue-500/30 text-blue-300',
  },
  highlight: {
    label: 'Vídeo / Lance',
    icon: Radio,
    badgeBg: 'bg-purple-500/15 border-purple-500/30 text-purple-300',
  },
  general: {
    label: 'Notícia',
    icon: Sparkles,
    badgeBg: 'bg-cyan-500/15 border-cyan-500/30 text-cyan-300',
  },
}

export function FanFeedWidget({ feedItems, onToggleLike, onAddComment }: FanFeedWidgetProps) {
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({})
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({})

  const toggleComments = (feedId: string) => {
    setExpandedComments((prev) => ({ ...prev, [feedId]: !prev[feedId] }))
  }

  const handleCommentSubmit = (feedId: string, e: React.FormEvent) => {
    e.preventDefault()
    const content = commentInputs[feedId]?.trim()
    if (!content) return

    if (onAddComment) {
      onAddComment(feedId, content)
    }
    setCommentInputs((prev) => ({ ...prev, [feedId]: '' }))
  }

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
        {feedItems.map((item) => {
          const categoryKey = item.category || (item.type === 'highlight' ? 'highlight' : 'general')
          const badgeCfg = CATEGORY_BADGES[categoryKey] || CATEGORY_BADGES.general
          const CategoryIcon = badgeCfg.icon
          const isCommentsOpen = !!expandedComments[item.id]

          return (
            <div
              key={item.id}
              className={`rounded-2xl p-4 md:p-5 bg-surface-container border transition-all space-y-4 ${
                item.isPinned
                  ? 'border-brand-500/40 shadow-lg shadow-brand-500/5 bg-gradient-to-b from-surface-container to-surface-container-high'
                  : 'border-outline/20 hover:border-outline/40'
              }`}
            >
              {/* Pinned pill if applicable */}
              {item.isPinned && (
                <div className="flex items-center gap-1.5 text-xs font-bold text-brand-400 pb-1 border-b border-outline/10">
                  <Pin className="w-3.5 h-3.5 fill-current rotate-45" />
                  <span>Publicação Fixada</span>
                </div>
              )}

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
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-bold text-sm text-on-surface leading-tight">
                        {item.entityName}
                      </h4>
                      {item.isOfficial && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-brand-400 fill-brand-500/20" />
                      )}
                    </div>
                    <p className="text-[11px] text-on-surface-variant">{item.timestamp}</p>
                  </div>
                </div>

                <span
                  className={`flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full border ${badgeCfg.badgeBg}`}
                >
                  <CategoryIcon className="w-3 h-3" />
                  {badgeCfg.label}
                </span>
              </div>

              {/* Content & Media */}
              <div className="space-y-2">
                {item.title && <h5 className="font-bold text-base text-white">{item.title}</h5>}
                <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{item.summary}</p>
              </div>

              {item.mediaUrl && (
                <div className="relative rounded-xl overflow-hidden border border-outline/20 aspect-video max-h-72 group">
                  <img
                    src={item.mediaUrl}
                    alt={item.title || 'Mídia da publicação'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {(item.type === 'highlight' || item.category === 'highlight') && (
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
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onToggleLike(item.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      item.hasLiked
                        ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                        : 'text-on-surface-variant hover:text-rose-400 hover:bg-surface-container-high'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${item.hasLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                    <span>{item.likesCount}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleComments(item.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      isCommentsOpen
                        ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                        : 'text-on-surface-variant hover:text-cyan-400 hover:bg-surface-container-high'
                    }`}
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>{item.commentsCount ?? item.comments?.length ?? 0}</span>
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
                    <span>Partilhar</span>
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

              {/* Inline Comments Section */}
              {isCommentsOpen && (
                <div className="pt-3 border-t border-outline/10 space-y-3 animate-in fade-in">
                  {/* Comments list */}
                  {item.comments && item.comments.length > 0 ? (
                    <div className="space-y-2">
                      {item.comments.map((c) => (
                        <div key={c.id} className="p-2.5 rounded-xl bg-surface-container-low border border-outline/10 text-xs">
                          <div className="flex items-center justify-between font-semibold text-text-primary mb-1">
                            <span>{c.authorName}</span>
                            <span className="text-[10px] text-text-muted">{c.createdAt}</span>
                          </div>
                          <p className="text-text-muted">{c.content}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-text-muted italic py-1">
                      Ainda não há comentários. Seja o primeiro a comentar!
                    </p>
                  )}

                  {/* Comment Input form */}
                  <form
                    onSubmit={(e) => handleCommentSubmit(item.id, e)}
                    className="flex items-center gap-2 pt-1"
                  >
                    <input
                      type="text"
                      placeholder="Deixe uma palavra de apoio..."
                      value={commentInputs[item.id] || ''}
                      onChange={(e) =>
                        setCommentInputs((prev) => ({ ...prev, [item.id]: e.target.value }))
                      }
                      className="flex-1 px-3.5 py-2 rounded-xl bg-surface-container-high border border-neutral-800 text-text-primary text-xs placeholder:text-text-muted focus:outline-none focus:border-cyan-500/40"
                    />
                    <button
                      type="submit"
                      disabled={!commentInputs[item.id]?.trim()}
                      className="p-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-neutral-950 disabled:opacity-40 transition-all"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </form>
                </div>
              )}
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
