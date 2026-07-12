import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Trash2, Video } from 'lucide-react'
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  EmptyState,
  FormField,
  Input,
  Textarea,
} from '@/components/ui'
import {
  useCreatePlayerVideo,
  useDeletePlayerVideo,
  usePlayerVideos,
  usePublishPlayerVideo,
} from '../hooks'
import { playerVideoSchema, type PlayerVideoFormData } from '../schemas'

const VIDEO_TYPE_VALUES = ['highlights', 'skills', 'interview', 'match_clip', 'training', 'other'] as const

interface PlayerVideosSectionProps {
  slug: string
}

export function PlayerVideosSection({ slug }: PlayerVideosSectionProps) {
  const { t } = useTranslation()
  const { data: videos = [], isLoading } = usePlayerVideos(slug)
  const createMutation = useCreatePlayerVideo(slug)
  const deleteMutation = useDeletePlayerVideo(slug)
  const publishMutation = usePublishPlayerVideo(slug)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PlayerVideoFormData>({
    resolver: zodResolver(playerVideoSchema),
    defaultValues: {
      title: '',
      description: '',
      video_type: 'highlights',
      video_url: '',
      thumbnail_url: '',
      media_asset: '',
      match: '',
      is_featured: false,
      order: '',
    },
  })

  const rows = useMemo(() => (Array.isArray(videos) ? videos : []), [videos])

  const onSubmit = (data: PlayerVideoFormData) => {
    createMutation.mutate(
      {
        title: data.title,
        description: data.description || undefined,
        video_type: data.video_type,
        video_url: data.video_url || undefined,
        thumbnail_url: data.thumbnail_url || undefined,
        media_asset: data.media_asset || undefined,
        match: data.match || undefined,
        is_featured: data.is_featured,
        order: data.order || undefined,
      },
      {
        onSuccess: () => reset(),
      },
    )
  }

  return (
    <div className="space-y-lg">
      <Card variant="flat" padding="none">
        <CardHeader>
          <CardTitle>{t('players.videos.section.addTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-md">
            <div className="grid gap-md md:grid-cols-2">
              <FormField
                label={t('players.videos.section.title')}
                htmlFor="video-title"
                error={errors.title?.message}
                required
              >
                <Input id="video-title" {...register('title')} state={errors.title ? 'error' : 'default'} />
              </FormField>
              <FormField
                label={t('players.videos.section.type')}
                htmlFor="video-type"
                error={errors.video_type?.message}
                required
              >
                <select
                  id="video-type"
                  {...register('video_type')}
                  className="flex h-10 w-full rounded-lg border border-outline-variant bg-surface-container px-md py-sm text-sm text-on-surface focus:border-primary focus:outline-none"
                >
                  {VIDEO_TYPE_VALUES.map((type) => (
                    <option key={type} value={type}>
                      {t(`players.videos.types.${type}`)}
                    </option>
                  ))}
                </select>
              </FormField>
            </div>

            <FormField
              label={t('players.videos.section.description')}
              htmlFor="video-description"
              error={errors.description?.message}
            >
              <Textarea id="video-description" rows={3} {...register('description')} />
            </FormField>

            <div className="grid gap-md md:grid-cols-2">
              <FormField
                label={t('players.videos.section.videoUrl')}
                htmlFor="video-url"
                error={errors.video_url?.message}
              >
                <Input id="video-url" {...register('video_url')} placeholder="https://..." />
              </FormField>
              <FormField
                label={t('players.videos.section.thumbnailUrl')}
                htmlFor="video-thumbnail"
                error={errors.thumbnail_url?.message}
              >
                <Input id="video-thumbnail" {...register('thumbnail_url')} placeholder="https://..." />
              </FormField>
            </div>

            <div className="grid gap-md md:grid-cols-2">
              <FormField
                label={t('players.videos.section.mediaAsset')}
                htmlFor="video-asset"
                error={errors.media_asset?.message}
              >
                <Input
                  id="video-asset"
                  {...register('media_asset')}
                  placeholder={t('players.documents.section.assetPlaceholder')}
                />
              </FormField>
              <FormField label={t('players.videos.section.order')} htmlFor="video-order" error={errors.order?.message}>
                <Input id="video-order" type="number" {...register('order')} />
              </FormField>
            </div>

            <label className="inline-flex items-center gap-sm text-sm text-on-surface">
              <input type="checkbox" {...register('is_featured')} className="rounded border-outline-variant" />
              {t('players.videos.section.featuredLabel')}
            </label>

            <Button type="submit" loading={createMutation.isPending}>
              {t('players.videos.section.save')}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card variant="flat" padding="none">
        <CardHeader>
          <CardTitle>{t('players.videos.section.listTitle', { count: rows.length })}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-on-surface-variant">{t('players.videos.section.loading')}</p>
          ) : rows.length === 0 ? (
            <EmptyState
              icon={Video}
              title={t('players.videos.section.emptyTitle')}
              description={t('players.videos.section.emptyDescription')}
            />
          ) : (
            <div className="space-y-sm">
              {rows.map((video) => (
                <div
                  key={video.id}
                  className="flex flex-col gap-md rounded-2xl border border-outline-variant/20 bg-surface-container p-md md:flex-row md:items-center md:justify-between"
                >
                  <div className="space-y-xs">
                    <div className="flex flex-wrap items-center gap-sm">
                      <p className="font-semibold text-on-surface">{video.title}</p>
                      <Badge variant="outline">{video.video_type_label || video.video_type}</Badge>
                      <Badge variant="secondary">{video.status_label || video.status}</Badge>
                    </div>
                    <p className="text-sm text-on-surface-variant">
                      {video.description || t('players.common.noDescription')}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-sm">
                    {video.status !== 'published' && (
                      <Button
                        variant="secondary"
                        size="sm"
                        loading={publishMutation.isPending}
                        onClick={() => publishMutation.mutate(video.id)}
                      >
                        {t('players.videos.section.publish')}
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-error hover:bg-error-container/20 hover:text-error"
                      loading={deleteMutation.isPending}
                      onClick={() => deleteMutation.mutate(video.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                      {t('players.common.delete')}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
