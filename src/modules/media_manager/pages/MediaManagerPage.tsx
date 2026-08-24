import { useRef, useState } from 'react'
import { FileImage, FolderOpen, Loader2, Search, Trash2, UploadCloud } from 'lucide-react'
import { DashboardLayout } from '@/app/layouts/DashboardLayout'
import { Button, Card, EmptyState, Input, Skeleton } from '@/components/ui'
import { useTenant } from '@/app/providers/TenantProvider'
import { getOrganizationSidebarSections } from '@/modules/organizations/constants/navigation'
import { getMediaAssetUrl } from '../services'
import { useDeleteMediaAsset, useMediaAssets, useUploadMediaAsset } from '../hooks'
import type { MediaAsset } from '../types'

interface MediaManagerPageProps {
  ownerType: 'organization' | 'club' | 'player'
  ownerId?: string | null
  title?: string
  dashboardType?: 'organization' | 'club' | 'player'
  sidebarLinks?: React.ComponentProps<typeof DashboardLayout>['sidebarLinks']
  sidebarSections?: React.ComponentProps<typeof DashboardLayout>['sidebarSections']
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function MediaManagerPage({
  ownerType,
  ownerId,
  title = 'Biblioteca de Media',
  dashboardType = 'organization',
  sidebarLinks,
  sidebarSections,
}: MediaManagerPageProps) {
  const { tenant } = useTenant()
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('gallery')
  const [error, setError] = useState<string | null>(null)
  const { data, isLoading } = useMediaAssets(query ? { q: query } : {})
  const uploadMutation = useUploadMediaAsset()
  const deleteMutation = useDeleteMediaAsset()
  const resolvedOwnerId = ownerId ?? (ownerType === 'organization' ? tenant?.id : undefined)
  const assets = data?.results ?? []

  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file || !resolvedOwnerId) return
    setError(null)
    uploadMutation.mutate({ file, ownerId: resolvedOwnerId, ownerType, category }, { onError: () => setError('Não foi possível carregar este ficheiro.') })
  }

  const openAsset = async (asset: MediaAsset) => {
    try {
      window.open(await getMediaAssetUrl(asset), '_blank', 'noopener,noreferrer')
    } catch {
      setError('Não foi possível abrir este asset.')
    }
  }

  return (
    <DashboardLayout
      title={title}
      subtitle="Centralize, reutilize e mantenha os ativos digitais da sua organização."
      dashboardType={dashboardType}
      sidebarLinks={sidebarLinks}
      sidebarSections={sidebarSections ?? (ownerType === 'organization' ? getOrganizationSidebarSections('media') : undefined)}
      headerActions={<Button onClick={() => inputRef.current?.click()} disabled={!resolvedOwnerId || uploadMutation.isPending}>
        {uploadMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
        <span>{uploadMutation.isPending ? 'A carregar...' : 'Carregar ficheiro'}</span>
      </Button>}
    >
      <input ref={inputRef} type="file" className="hidden" onChange={handleUpload} accept="image/*,video/*,audio/*,.pdf,.zip" />
      <div className="space-y-lg">
        <Card padding="md" className="flex flex-col gap-md md:flex-row md:items-center md:justify-between">
          <div className="relative max-w-xl flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-outline" aria-hidden="true" />
            <Input value={query} onChange={event => setQuery(event.target.value)} placeholder="Pesquisar por nome" className="pl-10" aria-label="Pesquisar assets" />
          </div>
          <label className="flex items-center gap-sm text-sm text-on-surface-variant">Categoria
            <select value={category} onChange={event => setCategory(event.target.value)} className="rounded-md border border-outline-variant/40 bg-surface px-sm py-2 text-sm text-on-surface">
              <option value="gallery">Galeria</option><option value="logo">Logótipo</option><option value="banner">Banner</option><option value="document">Documento</option><option value="report">Relatório</option>
            </select>
          </label>
        </Card>
        {error && <p role="alert" className="rounded-md border border-error/30 bg-error-container/30 px-md py-sm text-sm text-error">{error}</p>}
        {isLoading ? <div className="grid gap-md sm:grid-cols-2 lg:grid-cols-4">{[1, 2, 3, 4].map(item => <Skeleton key={item} className="h-56 rounded-xl" />)}</div> : assets.length === 0 ? (
          <EmptyState icon={FolderOpen} title="A biblioteca está vazia" description="Carregue o primeiro ficheiro para começar a reutilizar media na plataforma." action={{ label: 'Carregar ficheiro', onClick: () => inputRef.current?.click() }} />
        ) : <div className="grid gap-md sm:grid-cols-2 lg:grid-cols-4">
          {assets.map(asset => {
            const preview = asset.thumbnail_url || asset.public_url
            return <Card key={asset.id} padding="none" className="group overflow-hidden">
              <button type="button" onClick={() => void openAsset(asset)} className="flex aspect-[4/3] w-full items-center justify-center bg-surface-container text-outline" aria-label={`Abrir ${asset.name}`}>
                {preview && asset.mime_type.startsWith('image/') ? <img src={preview} alt={asset.name} className="h-full w-full object-cover transition-transform group-hover:scale-105" /> : <FileImage className="h-10 w-10" aria-hidden="true" />}
              </button>
              <div className="space-y-sm p-md"><p className="truncate font-semibold text-on-surface" title={asset.name}>{asset.name}</p><div className="flex items-center justify-between text-xs text-on-surface-variant"><span>{asset.category}</span><span>{formatBytes(asset.size_bytes)}</span></div>
                <Button variant="ghost" size="sm" className="w-full" disabled={deleteMutation.isPending} onClick={() => { if (window.confirm(`Eliminar ${asset.name}?`)) deleteMutation.mutate(asset.id) }}><Trash2 className="h-4 w-4" />Eliminar</Button>
              </div>
            </Card>
          })}
        </div>}
      </div>
    </DashboardLayout>
  )
}

export default MediaManagerPage