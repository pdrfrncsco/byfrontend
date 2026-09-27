import React, { useState } from 'react'
import {
  Send,
  Sparkles,
  Image as ImageIcon,
  Flame,
  Radio,
  Trophy,
  Megaphone,
  CheckCircle2,
  X,
  Eye,
} from 'lucide-react'
import { PostAuthorType, PostCategory, CreateFeedPostPayload, FanFeedItem } from '../types'

interface FeedPublisherCardProps {
  /** The publishing entity type (can default to user's primary context) */
  defaultAuthorType?: PostAuthorType
  /** The display name of the authoring entity (e.g., 'Petro Atlético de Luanda', 'FAF', 'Tiago Azul') */
  authorName?: string
  /** Logo or avatar URL of the entity */
  authorAvatar?: string
  /** Entity IDs */
  clubId?: string
  playerId?: string
  organizationId?: string
  /** Callback fired when a post is successfully published */
  onPostCreated?: (post: FanFeedItem) => void
  /** Compact embedded version for sidebar/dashboard vs full page */
  compact?: boolean
}

const CATEGORY_CONFIG: Record<
  PostCategory,
  { label: string; icon: React.ComponentType<{ className?: string }>; color: string; badgeBg: string }
> = {
  matchday: {
    label: 'Dia de Jogo / Convocatória',
    icon: Flame,
    color: 'text-amber-400',
    badgeBg: 'bg-amber-500/10 border-amber-500/30 text-amber-300',
  },
  announcement: {
    label: 'Comunicado Oficial',
    icon: Megaphone,
    color: 'text-emerald-400',
    badgeBg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300',
  },
  training: {
    label: 'Treino & Bastidores',
    icon: Trophy,
    color: 'text-blue-400',
    badgeBg: 'bg-blue-500/10 border-blue-500/30 text-blue-300',
  },
  highlight: {
    label: 'Vídeo / Lance',
    icon: Radio,
    color: 'text-purple-400',
    badgeBg: 'bg-purple-500/10 border-purple-500/30 text-purple-300',
  },
  general: {
    label: 'Geral',
    icon: Sparkles,
    color: 'text-brand-300',
    badgeBg: 'bg-brand-500/10 border-brand-500/30 text-brand-300',
  },
}

export const FeedPublisherCard: React.FC<FeedPublisherCardProps> = ({
  defaultAuthorType = 'club',
  authorName = 'Entidade Oficial',
  authorAvatar,
  clubId,
  playerId,
  organizationId,
  onPostCreated,
  compact = false,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [category, setCategory] = useState<PostCategory>('general')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [mediaUrl, setMediaUrl] = useState('')
  const [showMediaInput, setShowMediaInput] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [previewMode, setPreviewMode] = useState(false)

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return

    setIsSubmitting(true)
    setSuccessMessage(null)

    const payload: CreateFeedPostPayload = {
      authorType: defaultAuthorType,
      category,
      title: title.trim() || undefined,
      content: content.trim(),
      mediaUrl: mediaUrl.trim() || undefined,
      clubId,
      playerId,
      organizationId,
    }

    try {
      // Create local feed item representation
      const createdItem: FanFeedItem = {
        id: `feed-post-${Date.now()}`,
        type: category === 'matchday' ? 'club_news' : category === 'announcement' ? 'club_news' : 'highlight',
        title: title.trim() || (category === 'matchday' ? 'Atualização de Jogo' : 'Publicação Oficial'),
        summary: content.trim(),
        entityName: authorName,
        entityLogo: authorAvatar,
        entityType: defaultAuthorType,
        category,
        authorType: defaultAuthorType,
        authorId: clubId || playerId || organizationId,
        timestamp: 'Agora mesmo',
        mediaUrl: mediaUrl.trim() || undefined,
        likesCount: 0,
        commentsCount: 0,
        hasLiked: false,
        isOfficial: true,
      }

      // Simulate quick network latency or invoke backend
      await new Promise((resolve) => setTimeout(resolve, 350))

      if (onPostCreated) {
        onPostCreated(createdItem)
      }

      setSuccessMessage('Publicação partilhada no Feed de Adeptos com sucesso!')
      setTitle('')
      setContent('')
      setMediaUrl('')
      setShowMediaInput(false)
      setPreviewMode(false)

      setTimeout(() => {
        setSuccessMessage(null)
        if (compact) setIsOpen(false)
      }, 2500)
    } catch (err) {
      console.error('Falha ao publicar no feed:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const ActiveCategoryIcon = CATEGORY_CONFIG[category].icon

  if (compact && !isOpen) {
    return (
      <div className="bg-gradient-to-r from-surface-card to-surface-card/80 border border-brand-500/20 rounded-2xl p-4 shadow-lg hover:border-brand-500/40 transition-all">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-brand-500/20 border border-brand-500/40 flex items-center justify-center font-bold text-brand-300 text-sm overflow-hidden flex-shrink-0">
            {authorAvatar ? (
              <img src={authorAvatar} alt={authorName} className="w-full h-full object-cover" />
            ) : (
              authorName.slice(0, 2).toUpperCase()
            )}
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="flex-1 text-left px-4 py-2.5 rounded-xl bg-surface-cardHover/60 hover:bg-surface-cardHover border border-neutral-800 hover:border-brand-500/30 text-text-muted text-sm transition-all flex items-center justify-between"
          >
            <span>Publicar novidade para os adeptos...</span>
            <Sparkles className="w-4 h-4 text-brand-400" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-surface-card border border-brand-500/30 rounded-2xl p-5 shadow-xl transition-all relative overflow-hidden">
      {/* Glow accent */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-brand-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-brand-500/20 border border-brand-500/40 flex items-center justify-center font-bold text-brand-300 text-sm overflow-hidden">
            {authorAvatar ? (
              <img src={authorAvatar} alt={authorName} className="w-full h-full object-cover" />
            ) : (
              authorName.slice(0, 2).toUpperCase()
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-text-primary text-sm">{authorName}</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] uppercase font-bold bg-brand-500/15 text-brand-400 border border-brand-500/30">
                Canal Oficial
              </span>
            </div>
            <p className="text-[11px] text-text-muted">Publicar para todos os seguidores e comunidade</p>
          </div>
        </div>

        {compact && (
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="text-text-muted hover:text-text-primary p-1 rounded-lg hover:bg-surface-cardHover"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="my-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handlePublish} className="mt-4 space-y-3">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {(Object.keys(CATEGORY_CONFIG) as PostCategory[]).map((catKey) => {
            const cfg = CATEGORY_CONFIG[catKey]
            const Icon = cfg.icon
            const isSelected = category === catKey

            return (
              <button
                key={catKey}
                type="button"
                onClick={() => setCategory(catKey)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  isSelected
                    ? cfg.badgeBg
                    : 'bg-surface-cardHover/40 border-neutral-800 text-text-muted hover:text-text-primary hover:border-neutral-700'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? cfg.color : 'text-neutral-400'}`} />
                <span>{cfg.label}</span>
              </button>
            )
          })}
        </div>

        {/* Title Input (Optional) */}
        <div>
          <input
            type="text"
            placeholder="Título ou Destaque (ex: Convocatória para o Dérbi) [Opcional]"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl bg-surface-background border border-neutral-800 focus:border-brand-500/50 text-text-primary text-sm placeholder:text-text-muted focus:outline-none transition-all"
            maxLength={180}
          />
        </div>

        {/* Content Textarea */}
        <div>
          <textarea
            rows={3}
            required
            placeholder="Escreva a mensagem, atualização do plantel, bastidores ou declaração para os adeptos..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-surface-background border border-neutral-800 focus:border-brand-500/50 text-text-primary text-sm placeholder:text-text-muted focus:outline-none resize-none transition-all"
          />
        </div>

        {/* Media URL Input (Conditional) */}
        {showMediaInput && (
          <div className="flex items-center gap-2 animate-in fade-in">
            <input
              type="url"
              placeholder="https://... (URL da imagem ou vídeo)"
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
              className="flex-1 px-3.5 py-2 rounded-xl bg-surface-background border border-neutral-800 focus:border-brand-500/50 text-text-primary text-xs placeholder:text-text-muted focus:outline-none"
            />
            <button
              type="button"
              onClick={() => {
                setShowMediaInput(false)
                setMediaUrl('')
              }}
              className="p-2 text-text-muted hover:text-rose-400 rounded-lg hover:bg-surface-cardHover"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Actions Bar */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowMediaInput(!showMediaInput)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                mediaUrl || showMediaInput
                  ? 'bg-brand-500/20 text-brand-300 border-brand-500/40'
                  : 'bg-surface-cardHover/50 border-neutral-800 text-text-muted hover:text-text-primary'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>{mediaUrl ? 'Mídia Anexada' : 'Adicionar Mídia'}</span>
            </button>

            {content.trim() && (
              <button
                type="button"
                onClick={() => setPreviewMode(!previewMode)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  previewMode
                    ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                    : 'bg-surface-cardHover/50 border-neutral-800 text-text-muted hover:text-text-primary'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Prévia</span>
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !content.trim()}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-brand-500 hover:bg-brand-400 text-neutral-950 font-bold text-xs shadow-lg shadow-brand-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
          >
            {isSubmitting ? (
              <span>A publicar...</span>
            ) : (
              <>
                <span>Publicar no Feed</span>
                <Send className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>

        {/* Live Preview Card */}
        {previewMode && content.trim() && (
          <div className="mt-4 p-4 rounded-xl bg-surface-background border border-neutral-800/80 space-y-2 text-left">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-brand-400 flex items-center gap-1">
                <ActiveCategoryIcon className="w-3 h-3" />
                Prévia do Post
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${CATEGORY_CONFIG[category].badgeBg}`}>
                {CATEGORY_CONFIG[category].label}
              </span>
            </div>
            {title && <h4 className="text-sm font-bold text-text-primary">{title}</h4>}
            <p className="text-xs text-text-muted whitespace-pre-wrap">{content}</p>
            {mediaUrl && (
              <div className="rounded-lg overflow-hidden border border-neutral-800 max-h-48 mt-2">
                <img src={mediaUrl} alt="Prévia de mídia" className="w-full h-full object-cover" />
              </div>
            )}
          </div>
        )}
      </form>
    </div>
  )
}
