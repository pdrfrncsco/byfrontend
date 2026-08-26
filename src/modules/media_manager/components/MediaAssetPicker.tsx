import { useState } from 'react'
import { Check, FileImage, FolderOpen, Loader2, Search, X } from 'lucide-react'
import { Button, Card, Input, Skeleton } from '@/components/ui'
import { getMediaAssetUrl } from '../services'
import { useAttachMediaUsage, useMediaAssets } from '../hooks'
import type { MediaAsset } from '../types'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'

function resolvePreviewUrl(url: string) {
  if (/^https?:\/\//i.test(url)) return url
  return `${apiBaseUrl.replace(/\/api\/v1\/?$/, '')}${url.startsWith('/') ? url : `/${url}`}`
}

interface MediaAssetPickerProps {
  ownerType: 'organization' | 'club' | 'player'
  ownerId: string
  role: string
  accept?: 'image' | 'document' | 'all'
  trigger: React.ReactNode
  onSelected?: (url: string, asset: MediaAsset) => void
}

export function MediaAssetPicker({
  ownerType,
  ownerId,
  role,
  accept = 'all',
  trigger,
  onSelected,
}: MediaAssetPickerProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [error, setError] = useState<string | null>(null)
  const assetType = accept === 'image' ? 'image' : accept === 'document' ? 'document' : undefined
  const { data, isLoading } = useMediaAssets({ ...(query ? { q: query } : {}), ...(assetType ? { asset_type: assetType } : {}), page_size: 24 })
  const attachMutation = useAttachMediaUsage()
  const assets = data?.results ?? []

  const selectAsset = async (asset: MediaAsset) => {
    setError(null)
    try {
      await attachMutation.mutateAsync({ assetId: asset.id, ownerType, ownerId, role })
      onSelected?.(await getMediaAssetUrl(asset), asset)
      setOpen(false)
    } catch {
      setError('Não foi possível associar este asset.')
    }
  }

  return <>
    <span onClick={() => setOpen(true)}>{trigger}</span>
    {open && <div className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/40 p-md" role="dialog" aria-modal="true" aria-label={`Selecionar ${role}`} onClick={() => setOpen(false)}>
      <Card padding="lg" className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto" onClick={event => event.stopPropagation()}>
        <Button variant="ghost" size="sm" className="absolute right-sm top-sm" onClick={() => setOpen(false)} aria-label="Fechar biblioteca"><X className="h-4 w-4" /></Button>
        <div className="mb-lg space-y-xs"><h2 className="text-xl font-semibold text-on-surface">Selecionar da Biblioteca</h2><p className="text-sm text-on-surface-variant">Escolha um asset existente para usar como {role}.</p></div>
        <div className="relative mb-md"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-outline" aria-hidden="true" /><Input value={query} onChange={event => setQuery(event.target.value)} placeholder="Pesquisar por nome" className="pl-10" aria-label="Pesquisar na biblioteca" autoFocus /></div>
        {error && <p role="alert" className="mb-md rounded-md border border-error/30 bg-error-container/30 px-md py-sm text-sm text-error">{error}</p>}
        {isLoading ? <div className="grid gap-md sm:grid-cols-3 lg:grid-cols-4">{[1, 2, 3, 4].map(item => <Skeleton key={item} className="h-36 rounded-lg" />)}</div> : assets.length === 0 ? <div className="flex flex-col items-center gap-sm py-xl text-center text-on-surface-variant"><FolderOpen className="h-8 w-8" /><p>Não existem assets compatíveis.</p></div> : <div className="grid gap-md sm:grid-cols-3 lg:grid-cols-4">{assets.map(asset => { const rawPreview = asset.thumbnail_url || asset.public_url; const preview = rawPreview ? resolvePreviewUrl(rawPreview) : null; return <button key={asset.id} type="button" className="group overflow-hidden rounded-lg border border-outline-variant/30 text-left hover:border-primary" onClick={() => void selectAsset(asset)} disabled={attachMutation.isPending}><div className="flex aspect-[4/3] items-center justify-center bg-surface-container text-outline">{preview && asset.mime_type.startsWith('image/') ? <img src={preview} alt="" className="h-full w-full object-cover" /> : <FileImage className="h-8 w-8" />}</div><div className="flex items-center justify-between gap-xs p-sm"><span className="truncate text-xs font-semibold text-on-surface">{asset.name}</span>{attachMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5 text-primary opacity-0 group-hover:opacity-100" />}</div></button> })}</div>}
      </Card>
    </div>}
  </>
}
