import { useRef } from 'react'
import { Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useUploadPlayerAvatar } from '../hooks'

interface PlayerAvatarUploadProps {
  slug?: string
  avatarUrl?: string | null
  initials: string
  accentColor?: string
  onUploaded?: (avatarUrl: string) => void
}

export function PlayerAvatarUpload({
  slug,
  avatarUrl,
  initials,
  accentColor = '#94d3c1',
  onUploaded,
}: PlayerAvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const uploadMutation = useUploadPlayerAvatar(slug)

  const handlePick = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    uploadMutation.mutate(file, {
      onSuccess: (player) => {
        if (player.avatar) {
          onUploaded?.(player.avatar)
        }
      },
    })
  }

  return (
    <div className="space-y-sm">
      <div
        className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-3xl border border-outline-variant/20 text-2xl font-bold text-on-primary shadow-lg"
        style={{ background: accentColor }}
      >
        {avatarUrl ? (
          <img src={avatarUrl} alt="Avatar do jogador" className="h-full w-full object-cover" />
        ) : (
          initials
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handlePick}
      />
      <Button
        type="button"
        variant="secondary"
        size="sm"
        loading={uploadMutation.isPending}
        onClick={() => inputRef.current?.click()}
      >
        <Upload className="h-4 w-4" />
        Carregar fotografia
      </Button>
      {uploadMutation.isError && (
        <p className="text-sm text-error">Não foi possível carregar a fotografia. Tente novamente.</p>
      )}
    </div>
  )
}
