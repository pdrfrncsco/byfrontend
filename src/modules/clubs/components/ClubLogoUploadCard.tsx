import { useRef, useState } from 'react'
import { Check, FolderOpen, Loader2, Trash2, UploadCloud, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { MediaAssetPicker } from '@/modules/media_manager/components/MediaAssetPicker'
import { ClubLogo } from './ClubLogo'
import { useRemoveClubLogo, useUploadClubLogo } from '../hooks/useClubs'
import { cn } from '@/lib/utils'

interface ClubLogoUploadCardProps {
  clubId: string
  clubName: string
  shortName?: string | null
  currentLogoUrl?: string | null
  primaryColor?: string
  onLogoChange?: (newUrl: string | null) => void
}

export function ClubLogoUploadCard({
  clubId,
  clubName,
  shortName,
  currentLogoUrl,
  primaryColor = '#1B4D3E',
  onLogoChange,
}: ClubLogoUploadCardProps) {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const uploadMutation = useUploadClubLogo()
  const removeMutation = useRemoveClubLogo()

  const isBusy = uploadMutation.isPending || removeMutation.isPending

  const handleUpload = (file: File) => {
    // Basic validation
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
    if (!validTypes.includes(file.type)) {
      toast.error('Formato não suportado. Utilize PNG, JPG, WebP ou SVG.')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('O ficheiro excede o tamanho máximo de 5MB.')
      return
    }

    uploadMutation.mutate(file, {
      onSuccess: (updatedClub) => {
        onLogoChange?.(updatedClub.logo_url || null)
      },
    })
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (file) {
      handleUpload(file)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleUpload(file)
    }
  }

  const handleRemove = () => {
    removeMutation.mutate(undefined, {
      onSuccess: () => {
        onLogoChange?.(null)
      },
    })
  }

  const handleDamSelected = (url: string) => {
    onLogoChange?.(url)
    toast.success('Logo selecionado da biblioteca com sucesso.')
  }

  return (
    <Card variant="glass" padding="none" className="overflow-hidden border border-outline-variant/30">
      <CardHeader className="border-b border-outline-variant/20 bg-surface-container/40 p-lg">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-sm text-base">
            <UploadCloud className="h-5 w-5 text-primary" />
            <span>Logótipo Oficial do Clube</span>
          </CardTitle>
          {currentLogoUrl && (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-sm py-0.5 text-xs font-semibold text-primary">
              <Check className="h-3 w-3" />
              Configurado
            </span>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-lg p-lg">
        {/* Top: Current Logo Display & Quick Info */}
        <div className="flex flex-col gap-lg sm:flex-row sm:items-center">
          <div className="relative group">
            <ClubLogo
              name={clubName}
              logoUrl={currentLogoUrl}
              shortName={shortName}
              primaryColor={primaryColor}
              size="xl"
              shape="squircle"
              className="border-2 border-outline-variant/40 bg-surface shadow-md"
            />
            {isBusy && (
              <div className="absolute inset-0 flex items-center justify-center rounded-3xl bg-surface/80 backdrop-blur-sm">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            )}
          </div>

          <div className="space-y-xs">
            <p className="font-semibold text-on-surface">Emblema principal</p>
            <p className="text-xs text-on-surface-variant">
              Utilizado na classificação, fichas de jogo, perfil público e cartões do clube.
            </p>
            <div className="flex flex-wrap items-center gap-xs pt-1 text-[11px] text-outline">
              <span className="rounded bg-surface-container px-1.5 py-0.5">PNG / SVG / JPG</span>
              <span className="rounded bg-surface-container px-1.5 py-0.5">Máx. 5MB</span>
              <span className="rounded bg-surface-container px-1.5 py-0.5">Recomendado 1:1</span>
            </div>
          </div>
        </div>

        {/* Middle: Drag & Drop Zone */}
        <div
          onDragOver={(e) => {
            e.preventDefault()
            setIsDragging(true)
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => !isBusy && fileInputRef.current?.click()}
          className={cn(
            'group relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-lg text-center transition-all duration-200',
            isDragging
              ? 'border-primary bg-primary/5 scale-[0.99]'
              : 'border-outline-variant/40 bg-surface-container-low/40 hover:border-primary/60 hover:bg-surface-container-high/60',
            isBusy && 'pointer-events-none opacity-60',
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/svg+xml"
            onChange={handleFileSelect}
            className="hidden"
            disabled={isBusy}
          />
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
            <UploadCloud className="h-5 w-5" />
          </div>
          <p className="mt-sm text-sm font-semibold text-on-surface">
            {isDragging ? 'Solte a imagem aqui' : 'Arraste o ficheiro ou clique para procurar'}
          </p>
          <p className="text-xs text-on-surface-variant">
            PNG ou SVG com fundo transparente recomendado
          </p>
        </div>

        {/* Bottom: Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-sm border-t border-outline-variant/15 pt-md">
          <div className="flex flex-wrap items-center gap-sm">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              loading={uploadMutation.isPending}
              disabled={isBusy}
            >
              <UploadCloud className="mr-1.5 h-4 w-4" />
              Carregar ficheiro
            </Button>

            <MediaAssetPicker
              ownerType="club"
              ownerId={clubId}
              role="logo"
              accept="image"
              autoAttach={true}
              onSelected={handleDamSelected}
              trigger={
                <Button type="button" variant="secondary" size="sm" disabled={isBusy}>
                  <FolderOpen className="mr-1.5 h-4 w-4" />
                  Biblioteca DAM
                </Button>
              }
            />
          </div>

          {currentLogoUrl && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              loading={removeMutation.isPending}
              disabled={isBusy}
              className="text-danger hover:bg-danger/10 hover:text-danger"
            >
              <Trash2 className="mr-1.5 h-4 w-4" />
              Remover logo
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
