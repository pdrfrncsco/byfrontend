import { useMemo } from 'react'
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

const VIDEO_TYPES = [
  { value: 'highlights', label: 'Melhores momentos' },
  { value: 'skills', label: 'Skills' },
  { value: 'interview', label: 'Entrevista' },
  { value: 'match_clip', label: 'Clip de jogo' },
  { value: 'training', label: 'Treino' },
  { value: 'other', label: 'Outro' },
] as const

interface PlayerVideosSectionProps {
  slug: string
}

export function PlayerVideosSection({ slug }: PlayerVideosSectionProps) {
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
          <CardTitle>Adicionar vídeo</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-md">
            <div className="grid gap-md md:grid-cols-2">
              <FormField label="Título" htmlFor="video-title" error={errors.title?.message} required>
                <Input id="video-title" {...register('title')} state={errors.title ? 'error' : 'default'} />
              </FormField>
              <FormField label="Tipo" htmlFor="video-type" error={errors.video_type?.message} required>
                <select
                  id="video-type"
                  {...register('video_type')}
                  className="flex h-10 w-full rounded-lg border border-outline-variant bg-surface-container px-md py-sm text-sm text-on-surface focus:border-primary focus:outline-none"
                >
                  {VIDEO_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </FormField>
            </div>

            <FormField label="Descrição" htmlFor="video-description" error={errors.description?.message}>
              <Textarea id="video-description" rows={3} {...register('description')} />
            </FormField>

            <div className="grid gap-md md:grid-cols-2">
              <FormField label="URL do vídeo" htmlFor="video-url" error={errors.video_url?.message}>
                <Input id="video-url" {...register('video_url')} placeholder="https://..." />
              </FormField>
              <FormField label="URL da miniatura" htmlFor="video-thumbnail" error={errors.thumbnail_url?.message}>
                <Input id="video-thumbnail" {...register('thumbnail_url')} placeholder="https://..." />
              </FormField>
            </div>

            <div className="grid gap-md md:grid-cols-2">
              <FormField label="ID do media asset" htmlFor="video-asset" error={errors.media_asset?.message}>
                <Input id="video-asset" {...register('media_asset')} placeholder="UUID do media asset" />
              </FormField>
              <FormField label="Ordem" htmlFor="video-order" error={errors.order?.message}>
                <Input id="video-order" type="number" {...register('order')} />
              </FormField>
            </div>

            <label className="inline-flex items-center gap-sm text-sm text-on-surface">
              <input type="checkbox" {...register('is_featured')} className="rounded border-outline-variant" />
              Destacar no perfil
            </label>

            <Button type="submit" loading={createMutation.isPending}>
              Guardar vídeo
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card variant="flat" padding="none">
        <CardHeader>
          <CardTitle>Vídeos ({rows.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-on-surface-variant">A carregar vídeos...</p>
          ) : rows.length === 0 ? (
            <EmptyState icon={Video} title="Sem vídeos" description="Adicione o primeiro vídeo do jogador." />
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
                    <p className="text-sm text-on-surface-variant">{video.description || 'Sem descrição'}</p>
                  </div>
                  <div className="flex flex-wrap gap-sm">
                    {video.status !== 'published' && (
                      <Button
                        variant="secondary"
                        size="sm"
                        loading={publishMutation.isPending}
                        onClick={() => publishMutation.mutate(video.id)}
                      >
                        Publicar
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
                      Eliminar
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
