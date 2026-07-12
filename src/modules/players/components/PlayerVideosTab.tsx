import { Play, Star, Video } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { Skeleton } from '@/components/ui/skeleton'
import { usePlayerVideos } from '../hooks'
import type { PlayerVideo } from '../types'

interface PlayerVideosTabProps {
  slug: string
  fallbackVideos?: PlayerVideo[]
}

function statusVariant(status: PlayerVideo['status']) {
  switch (status) {
    case 'published':
      return 'primary' as const
    case 'archived':
      return 'outline' as const
    default:
      return 'warning' as const
  }
}

export function PlayerVideosTab({ slug, fallbackVideos = [] }: PlayerVideosTabProps) {
  const { data, isLoading } = usePlayerVideos(slug)
  const videos = data ?? fallbackVideos

  if (isLoading && videos.length === 0) {
    return (
      <div className="grid gap-md md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-56 w-full rounded-2xl" />
        ))}
      </div>
    )
  }

  if (videos.length === 0) {
    return (
      <EmptyState
        icon={Video}
        title="Sem vídeos"
        description="Este jogador ainda não publicou vídeos no perfil."
      />
    )
  }

  return (
    <div className="grid gap-md md:grid-cols-2 xl:grid-cols-3">
      {videos.map((video) => {
        const watchUrl = video.video_url || video.url
        const thumbnail = video.thumbnail_url || video.thumbnail

        return (
          <Card key={video.id} variant="flat" padding="none" className="overflow-hidden">
            <div className="relative aspect-video bg-surface-container-high">
              {thumbnail ? (
                <img src={thumbnail} alt={video.title} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-on-surface-variant">
                  <Video className="h-10 w-10 opacity-40" />
                </div>
              )}
              {watchUrl && (
                <Button
                  asChild
                  size="sm"
                  variant="secondary"
                  className="absolute bottom-3 right-3"
                >
                  <a href={watchUrl} target="_blank" rel="noreferrer">
                    <Play className="h-4 w-4" />
                    Ver
                  </a>
                </Button>
              )}
            </div>
            <CardContent className="space-y-sm p-lg">
              <div className="flex flex-wrap items-center gap-sm">
                <p className="font-semibold text-on-surface">{video.title}</p>
                {video.is_featured && (
                  <Badge variant="primary">
                    <Star className="mr-1 h-3 w-3" />
                    Destaque
                  </Badge>
                )}
              </div>
              <div className="flex flex-wrap gap-sm">
                <Badge variant="outline">{video.video_type_label || video.video_type}</Badge>
                <Badge variant={statusVariant(video.status)}>{video.status_label || video.status}</Badge>
              </div>
              {video.description && (
                <p className="line-clamp-2 text-sm text-on-surface-variant">{video.description}</p>
              )}
              {video.match_info && (
                <p className="text-xs text-on-surface-variant">
                  {video.match_info.home_club} vs {video.match_info.away_club}
                </p>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
