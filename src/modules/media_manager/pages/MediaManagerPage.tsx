import { useRef, useState } from 'react'
import { FileImage, FolderOpen, Info, Loader2, Search, Trash2, UploadCloud, X } from 'lucide-react'
import { DashboardLayout } from '@/app/layouts/DashboardLayout'
import { Button, Card, EmptyState, Input, Skeleton } from '@/components/ui'
import { useTenant } from '@/app/providers/TenantProvider'
import { getOrganizationSidebarSections } from '@/modules/organizations/constants/navigation'
import { getMediaAssetUrl } from '../services'
import { useDeleteMediaAsset, useMediaAsset, useMediaAssets, useUploadMediaAsset } from '../hooks'
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
  const [uploadCategory, setUploadCategory] = useState('gallery')
  const [filterCategory, setFilterCategory] = useState('')
  const [assetType, setAssetType] = useState('')
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const listParams = {
    ...(query ? { q: query } : {}),
    ...(filterCategory ? { category: filterCategory } : {}),
    ...(assetType ? { asset_type: assetType } : {}),
  }
  const { data, isLoading } = useMediaAssets(listParams)
  const { data: selectedAsset, isLoading: isDetailLoading } = useMediaAsset(selectedAssetId)
  const uploadMutation = useUploadMediaAsset()
  const deleteMutation = useDeleteMediaAsset()
  const resolvedOwnerId = ownerId ?? (ownerType === 'organization' ? tenant?.id : undefined)
  const assets = data?.results ?? []

  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file || !resolvedOwnerId) return
    setError(null)
    uploadMutation.mutate({ file, ownerId: resolvedOwnerId, ownerType, category: uploadCategory }, { onError: () => setError('Não foi possível carregar este ficheiro.') })
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
          <label className="flex items-center gap-sm text-sm text-on-surface-variant">Upload como
            <select value={uploadCategory} onChange={event => setUploadCategory(event.target.value)} className="rounded-md border border-outline-variant/40 bg-surface px-sm py-2 text-sm text-on-surface">
              <option value="gallery">Galeria</option><option value="logo">Logótipo</option><option value="banner">Banner</option><option value="document">Documento</option><option value="report">Relatório</option>
            </select>
          </label>
          <label className="flex items-center gap-sm text-sm text-on-surface-variant">Tipo
            <select value={assetType} onChange={event => setAssetType(event.target.value)} className="rounded-md border border-outline-variant/40 bg-surface px-sm py-2 text-sm text-on-surface">
              <option value="">Todos</option><option value="IMAGE">Imagem</option><option value="VIDEO">Vídeo</option><option value="DOCUMENT">Documento</option><option value="AUDIO">Áudio</option><option value="PDF">PDF</option>
            </select>
          </label>
          <label className="flex items-center gap-sm text-sm text-on-surface-variant">Categoria
            <select value={filterCategory} onChange={event => setFilterCategory(event.target.value)} className="rounded-md border border-outline-variant/40 bg-surface px-sm py-2 text-sm text-on-surface">
              <option value="">Todas</option><option value="gallery">Galeria</option><option value="logo">Logótipo</option><option value="banner">Banner</option><option value="document">Documento</option><option value="report">Relatório</option>
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
              <button type="button" onClick={() => setSelectedAssetId(asset.id)} className="flex aspect-[4/3] w-full items-center justify-center bg-surface-container text-outline" aria-label={`Ver detalhes de ${asset.name}`}>
                {preview && asset.mime_type.startsWith('image/') ? <img src={preview} alt={asset.name} className="h-full w-full object-cover transition-transform group-hover:scale-105" /> : <FileImage className="h-10 w-10" aria-hidden="true" />}
              </button>
              <div className="space-y-sm p-md"><p className="truncate font-semibold text-on-surface" title={asset.name}>{asset.name}</p><div className="flex items-center justify-between text-xs text-on-surface-variant"><span>{asset.category}</span><span>{formatBytes(asset.size_bytes)}</span></div>
                <Button variant="ghost" size="sm" className="w-full" disabled={deleteMutation.isPending} onClick={() => { if (window.confirm(`Eliminar ${asset.name}?`)) deleteMutation.mutate(asset.id) }}><Trash2 className="h-4 w-4" />Eliminar</Button>
              </div>
            </Card>
          })}
        </div>}
      </div>
      {selectedAssetId && <div className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/40 p-md" role="dialog" aria-modal="true" aria-label="Detalhes do asset" onClick={() => setSelectedAssetId(null)}>
        <Card padding="lg" className="relative max-h-[90vh] w-full max-w-xl overflow-y-auto" onClick={event => event.stopPropagation()}>
          <Button variant="ghost" size="sm" className="absolute right-sm top-sm" onClick={() => setSelectedAssetId(null)} aria-label="Fechar detalhes"><X className="h-4 w-4" /></Button>
          {isDetailLoading || !selectedAsset ? <Skeleton className="h-48 w-full" /> : <div className="space-y-md">
            <div className="flex items-center gap-sm"><Info className="h-5 w-5 text-primary" /><h3 className="text-lg font-semibold text-on-surface">{selectedAsset.name}</h3></div>
            <div className="grid grid-cols-2 gap-sm text-sm">
              <span className="text-on-surface-variant">Ficheiro</span><span className="truncate text-right text-on-surface">{selectedAsset.original_filename || selectedAsset.name}</span>
              <span className="text-on-surface-variant">Tipo</span><span className="text-right text-on-surface">{selectedAsset.mime_type}</span>
              <span className="text-on-surface-variant">Dimensão</span><span className="text-right text-on-surface">{selectedAsset.width && selectedAsset.height ? `${selectedAsset.width} x ${selectedAsset.height} px` : 'Não disponível'}</span>
              <span className="text-on-surface-variant">Visibilidade</span><span className="text-right text-on-surface">{selectedAsset.visibility || 'Não disponível'}</span>
              <span className="text-on-surface-variant">Variantes</span><span className="text-right text-on-surface">{selectedAsset.variants?.length ?? 0}</span>
            </div>
            {selectedAsset.variants && selectedAsset.variants.length > 0 && <div className="space-y-xs"><p className="text-sm font-semibold text-on-surface">Variantes disponíveis</p>{selectedAsset.variants.map(variant => <div key={variant.id} className="flex justify-between text-xs text-on-surface-variant"><span>{variant.variant_type}</span><span>{variant.width && variant.height ? `${variant.width} x ${variant.height} px` : variant.mime_type}</span></div>)}</div>}
            <Button onClick={() => void openAsset(selectedAsset)}><FileImage className="h-4 w-4" />Abrir asset</Button>
          </div>}
        </Card>
      </div>}
    </DashboardLayout>
  )
}

export default MediaManagerPage