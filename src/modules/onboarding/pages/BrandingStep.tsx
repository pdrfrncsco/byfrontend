import { useEffect, useState, useRef } from 'react'
import OnboardingLayout from './OnboardingLayout'
import { useOrganizationMe, useUpdateOrganization, useUploadLogo } from '@/modules/organizations'

export default function BrandingStep() {
  const { data: org, isLoading } = useOrganizationMe()
  const updateOrg = useUpdateOrganization()
  const uploadLogo = useUploadLogo()

  const [primary, setPrimary] = useState('#94D3C1')
  const [secondary, setSecondary] = useState('#E9C349')
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [uploadingBanner, setUploadingBanner] = useState(false)

  useEffect(() => {
    if (org) {
      setPrimary((org as any).primary_color || '#94D3C1')
      setSecondary((org as any).secondary_color || '#E9C349')
    }
  }, [org])

  // Autosave colors debounced
  const timer = useRef<number | null>(null)
  useEffect(() => {
    if (!org) return
    if (timer.current) window.clearTimeout(timer.current)
    timer.current = window.setTimeout(async () => {
      try {
        await updateOrg.mutateAsync({ primary_color: primary, secondary_color: secondary } as any)
      } catch (e) {
        console.error('Failed saving colors', e)
      }
    }, 700)
    return () => { if (timer.current) window.clearTimeout(timer.current) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [primary, secondary])

  async function handleLogo(file?: File) {
    if (!file) return
    setUploadingLogo(true)
    try {
      await uploadLogo.mutateAsync(file)
    } catch (e) {
      console.error('Logo upload failed', e)
    } finally {
      setUploadingLogo(false)
    }
  }

  async function handleBanner(file?: File) {
    if (!file) return
    setUploadingBanner(true)
    try {
      // Banner upload endpoint not yet available — logo/colors are persisted today.
      console.info('Banner upload pending backend endpoint', file.name)
    } catch (e) {
      console.error('Banner update failed', e)
    } finally {
      setUploadingBanner(false)
    }
  }

  if (isLoading) return <OnboardingLayout step={2}><div>Carregando...</div></OnboardingLayout>

  return (
    <OnboardingLayout step={2}>
      <div className="glass-card p-lg rounded-xl">
        <h2 className="font-title-md text-title-md text-primary mb-md">Identidade Visual</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
          <div className="space-y-lg">
            <div>
              <label className="font-label-sm text-on-surface-variant">Carregar Logótipo</label>
              <input type="file" accept="image/*" onChange={(e) => handleLogo(e.target.files?.[0])} className="block mt-sm" />
              <div className="text-label-sm text-on-surface-variant mt-sm">Min 512x512px. {uploadingLogo ? 'A carregar...' : ''}</div>
            </div>

            <div>
              <label className="font-label-sm text-on-surface-variant">Carregar Banner</label>
              <input type="file" accept="image/*" onChange={(e) => handleBanner(e.target.files?.[0])} className="block mt-sm" />
              <div className="text-label-sm text-on-surface-variant mt-sm">1920x400px recomendado. {uploadingBanner ? 'A carregar...' : ''}</div>
            </div>

            <div className="glass-panel p-md rounded-xl">
              <label className="font-label-sm text-on-surface-variant">Paleta de Cores</label>
              <div className="mt-md grid grid-cols-2 gap-md">
                <div className="flex items-center gap-md">
                  <input type="color" value={primary} onChange={(e) => setPrimary(e.target.value.toUpperCase())} className="w-12 h-12 rounded" />
                  <div>
                    <div className="font-label-sm">Cor Primária</div>
                    <div className="font-data-tabular">{primary}</div>
                  </div>
                </div>

                <div className="flex items-center gap-md">
                  <input type="color" value={secondary} onChange={(e) => setSecondary(e.target.value.toUpperCase())} className="w-12 h-12 rounded" />
                  <div>
                    <div className="font-label-sm">Cor Secundária</div>
                    <div className="font-data-tabular">{secondary}</div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          <aside className="space-y-md">
            <h3 className="font-label-sm text-on-surface-variant">Pré-visualização em Tempo Real</h3>
            <div className="bg-surface-container rounded-xl overflow-hidden border border-white/10">
              <div className="h-36" style={{ background: `linear-gradient(90deg, ${primary}33, ${secondary}33)` }}>
                <div className="absolute -mt-10 ml-4 w-16 h-16 bg-surface-container rounded-lg border border-white/10 flex items-center justify-center p-2">
                  {org?.logo_url || org?.logo ? <img src={(org.logo_url || org.logo) as string} alt="logo" className="w-12 h-12 object-contain"/> : <div className="text-primary">Logo</div>}
                </div>
              </div>
              <div className="p-md">
                <h4 className="font-title-md">{org?.name || 'Nome da Organização'}</h4>
                <p className="text-on-surface-variant">{org?.slug || 'slug-da-organizacao'}</p>
                <div className="mt-md flex gap-sm">
                  <button className="bg-primary text-on-primary px-md py-sm rounded">Perfil</button>
                  <button className="border border-secondary text-secondary px-md py-sm rounded">Estatísticas</button>
                </div>
              </div>
            </div>

          </aside>
        </div>
      </div>
    </OnboardingLayout>
  )
}
