import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MediaAssetPicker } from '@/modules/media_manager/components/MediaAssetPicker'
import { resolveMediaUrl } from '@/lib/media'

interface PlayerAvatarUploadProps {
  slug?: string
  ownerId: string
  avatarUrl?: string | null
  initials: string
  accentColor?: string
  onUploaded?: (avatarUrl: string) => void
}

export function PlayerAvatarUpload({
  slug,
  avatarUrl,
  initials,
  ownerId,
  accentColor = '#94d3c1',
  onUploaded,
}: PlayerAvatarUploadProps) {
  const { t } = useTranslation()
  const [imgError, setImgError] = useState(false)
  const resolvedUrl = resolveMediaUrl(avatarUrl)

  useEffect(() => {
    setImgError(false)
  }, [avatarUrl])

  return (
    <div className="space-y-sm">
      <div
        className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-3xl border border-outline-variant/20 text-2xl font-bold text-on-primary shadow-lg"
        style={{ background: accentColor }}
      >
        {resolvedUrl && !imgError ? (
          <img
            src={resolvedUrl}
            alt={t('players.avatar.alt')}
            className="h-full w-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          initials
        )}
      </div>
      <MediaAssetPicker
        ownerType="player"
        ownerId={ownerId}
        role="avatar"
        accept="image"
        autoAttach={true}
        onSelected={(url) => onUploaded?.(url)}
        trigger={<Button type="button" variant="secondary" size="sm"><Upload className="h-4 w-4" />Selecionar avatar</Button>}
      />
    </div>
  )
}
