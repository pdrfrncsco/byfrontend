import { useState } from 'react'
import { ChevronLeft, ChevronRight, Download, Images, Maximize2, X } from 'lucide-react'
import { Button, Card, CardContent, CardHeader, CardTitle, EmptyState, Skeleton } from '@/components/ui'
import { useMediaUsages } from '../hooks'
import type { MediaAsset } from '../types'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'

function resolveMediaUrl(url?: string | null): string {
  if (!url) return ''
  if (/^https?:\/\//i.test(url)) return url
  return `${apiBaseUrl.replace(/\/api\/v1\/?$/, '')}${url.startsWith('/') ? url : `/${url}`}`
}

interface MediaGalleryTabProps {
  ownerType: 'club' | 'player' | 'organization'
  ownerId?: string | null
  title?: string
  emptyTitle?: string
  emptyDescription?: string
}

export function MediaGalleryTab({
  ownerType,
  ownerId,
  title = 'Galeria de Fotos',
  emptyTitle = 'Sem fotos na galeria',
  emptyDescription = 'Ainda não foram publicadas fotos na galeria pública.',
}: MediaGalleryTabProps) {
  const { data, isLoading } = useMediaUsages(ownerType, ownerId)
  const [activePhotoIndex, setActivePhotoIndex] = useState<number | null>(null)

  const usages = data?.results ?? []
  // Filter for gallery role and image mime types, or fallback to any image usages if role is gallery
  const galleryItems = usages.filter(
    (u) =>
      u.is_active &&
      (u.role === 'gallery' || u.role === 'news_image' || u.asset.mime_type.startsWith('image/'))
  )

  const activeAsset: MediaAsset | null =
    activePhotoIndex !== null && galleryItems[activePhotoIndex]
      ? galleryItems[activePhotoIndex].asset
      : null

  const handlePrev = () => {
    if (activePhotoIndex === null) return
    setActivePhotoIndex((activePhotoIndex - 1 + galleryItems.length) % galleryItems.length)
  }

  const handleNext = () => {
    if (activePhotoIndex === null) return
    setActivePhotoIndex((activePhotoIndex + 1) % galleryItems.length)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') setActivePhotoIndex(null)
    if (e.key === 'ArrowLeft') handlePrev()
    if (e.key === 'ArrowRight') handleNext()
  }

  return (
    <div className="space-y-lg">
      <Card variant="flat" padding="none" className="shadow-[0_18px_40px_-30px_rgba(15,17,23,0.18)]">
        <CardHeader className="flex flex-row items-center justify-between border-b border-outline-variant/10 px-lg py-md">
          <CardTitle className="flex items-center gap-sm text-lg">
            <Images className="h-5 w-5 text-primary" />
            <span>{title}</span>
          </CardTitle>
          {galleryItems.length > 0 && (
            <span className="rounded-full bg-surface-container px-md py-xs text-xs font-semibold text-on-surface-variant">
              {galleryItems.length} {galleryItems.length === 1 ? 'foto' : 'fotos'}
            </span>
          )}
        </CardHeader>

        <CardContent className="p-lg">
          {isLoading ? (
            <div className="grid grid-cols-2 gap-md sm:grid-cols-3 md:grid-cols-4">
              {[1, 2, 3, 4, 5, 6].map((idx) => (
                <Skeleton key={idx} className="aspect-[4/3] w-full rounded-2xl" />
              ))}
            </div>
          ) : galleryItems.length === 0 ? (
            <EmptyState
              icon={Images}
              title={emptyTitle}
              description={emptyDescription}
            />
          ) : (
            <div className="grid grid-cols-2 gap-md sm:grid-cols-3 md:grid-cols-4">
              {galleryItems.map((item, idx) => {
                const asset = item.asset
                const thumbnail = resolveMediaUrl(asset.thumbnail_url || asset.public_url)
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActivePhotoIndex(idx)}
                    className="group relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-outline-variant/20 bg-surface-container transition-all hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
                    aria-label={`Ver foto: ${asset.name}`}
                  >
                    <img
                      src={thumbnail}
                      alt={asset.name}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                      <Maximize2 className="h-6 w-6 text-white" />
                    </div>
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-sm text-left">
                      <p className="truncate text-xs font-medium text-white">{asset.name}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lightbox Modal */}
      {activeAsset && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-md"
          role="dialog"
          aria-modal="true"
          aria-label={activeAsset.name}
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          <button
            type="button"
            onClick={() => setActivePhotoIndex(null)}
            className="absolute right-md top-md rounded-full bg-white/10 p-sm text-white transition hover:bg-white/20"
            aria-label="Fechar visualizador"
          >
            <X className="h-6 w-6" />
          </button>

          {galleryItems.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  handlePrev()
                }}
                className="absolute left-md top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-sm text-white transition hover:bg-white/20"
                aria-label="Foto anterior"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  handleNext()
                }}
                className="absolute right-md top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-sm text-white transition hover:bg-white/20"
                aria-label="Próxima foto"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}

          <div
            className="flex max-h-[85vh] max-w-4xl flex-col items-center gap-sm overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={resolveMediaUrl(activeAsset.public_url || activeAsset.thumbnail_url)}
              alt={activeAsset.name}
              className="max-h-[75vh] w-auto max-w-full rounded-xl object-contain shadow-2xl"
            />
            <div className="flex w-full items-center justify-between text-white/90">
              <span className="truncate text-sm font-semibold">{activeAsset.name}</span>
              <div className="flex items-center gap-sm">
                <span className="text-xs text-white/60">
                  {activePhotoIndex! + 1} de {galleryItems.length}
                </span>
                {activeAsset.public_url && (
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/10 hover:text-white"
                  >
                    <a
                      href={resolveMediaUrl(activeAsset.public_url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      download={activeAsset.original_filename || activeAsset.name}
                    >
                      <Download className="h-4 w-4" />
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
