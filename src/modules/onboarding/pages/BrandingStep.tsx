import { useEffect, useState, useRef } from 'react'
import OnboardingLayout from './OnboardingLayout'
import { useOrganizationMe, useUpdateOrganization, useUploadLogo, useUploadBanner } from '@/modules/organizations'

export default function BrandingStep() {
  const { data: org, isLoading } = useOrganizationMe()
  const updateOrg = useUpdateOrganization()
  const uploadLogo = useUploadLogo()
  const uploadBanner = useUploadBanner()

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
      await uploadBanner.mutateAsync(file)
    } catch (e) {
      console.error('Banner update failed', e)
    } finally {
      setUploadingBanner(false)
    }
  }

  if (isLoading) return <OnboardingLayout step={2}><div>Carregando...</div></OnboardingLayout>

  return (
    <OnboardingLayout step={2}>
      <div className="glass-card p-lg rounded-xl space-y-lg">
        <div>
          <h2 className="font-title-md text-title-md text-primary mb-xs">Identidade Visual (Branding)</h2>
          <p className="text-on-surface-variant text-body-sm">
            Personalize a aparência oficial da sua organização.
          </p>
        </div>

        {/* Dica de Branding */}
        <div className="bg-primary/10 border border-primary/20 rounded-xl p-md flex gap-md items-start">
          <div className="p-sm bg-primary/20 rounded-lg text-primary font-bold text-lg shrink-0">
            💡
          </div>
          <div>
            <h4 className="font-title-sm text-primary font-bold mb-xs">Dica de Branding</h4>
            <p className="text-on-surface-variant text-body-sm leading-relaxed">
              Use as cores oficiais do seu escudo ou uniformes para manter consistência visual. O sistema aplica automaticamente suas cores nos perfis públicos, certificados e comunicações.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
          <div className="space-y-lg">
            <div>
              <label className="font-label-sm text-on-surface-variant block mb-xs">
                Upload do Logótipo Oficial
              </label>
              <input
                type="file"
                accept="image/png, image/jpeg"
                onChange={(e) => handleLogo(e.target.files?.[0])}
                className="block w-full text-body-sm file:mr-md file:py-sm file:px-md file:rounded-lg file:border-0 file:text-label-sm file:bg-primary/20 file:text-primary hover:file:bg-primary/30 cursor-pointer"
              />
              <div className="text-label-sm text-on-surface-variant mt-xs">
                Formatos: PNG ou JPEG (mínimo 200x200 px). {uploadingLogo ? 'A carregar...' : ''}
              </div>
            </div>

            <div>
              <label className="font-label-sm text-on-surface-variant block mb-xs">
                Carregar Banner Oficial (Opcional)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleBanner(e.target.files?.[0])}
                className="block w-full text-body-sm file:mr-md file:py-sm file:px-md file:rounded-lg file:border-0 file:text-label-sm file:bg-surface-container-high file:text-on-surface hover:file:bg-surface-container-highest cursor-pointer"
              />
              <div className="text-label-sm text-on-surface-variant mt-xs">
                Recomendado: 1920x400 px. {uploadingBanner ? 'A carregar...' : ''}
              </div>
            </div>

            <div className="glass-panel p-md rounded-xl space-y-md">
              <label className="font-label-sm text-on-surface-variant block">Definição das Cores</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
                <div className="flex items-center gap-md p-sm bg-surface-container-low rounded-lg border border-outline/10">
                  <input
                    type="color"
                    value={primary}
                    onChange={(e) => setPrimary(e.target.value.toUpperCase())}
                    className="w-10 h-10 rounded cursor-pointer border-0 bg-transparent"
                  />
                  <div>
                    <div className="font-label-sm text-on-surface">Cor Primária</div>
                    <div className="font-data-tabular text-body-sm text-on-surface-variant">{primary}</div>
                  </div>
                </div>

                <div className="flex items-center gap-md p-sm bg-surface-container-low rounded-lg border border-outline/10">
                  <input
                    type="color"
                    value={secondary}
                    onChange={(e) => setSecondary(e.target.value.toUpperCase())}
                    className="w-10 h-10 rounded cursor-pointer border-0 bg-transparent"
                  />
                  <div>
                    <div className="font-label-sm text-on-surface">Cor Secundária</div>
                    <div className="font-data-tabular text-body-sm text-on-surface-variant">{secondary}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <aside className="space-y-md">
            <h3 className="font-label-sm text-on-surface-variant">Pré-visualização em Tempo Real</h3>
            <div className="bg-surface-container rounded-xl overflow-hidden border border-outline/10 relative">
              <div className="h-36 relative" style={{ background: `linear-gradient(135deg, ${primary}44, ${secondary}44)` }}>
                <div className="absolute -bottom-6 left-4 w-16 h-16 bg-surface-container rounded-lg border border-outline/10 flex items-center justify-center p-2 shadow-lg">
                  {org?.logo_url || org?.logo ? (
                    <img src={(org.logo_url || org.logo) as string} alt="logo" className="w-12 h-12 object-contain"/>
                  ) : (
                    <div className="text-primary font-bold text-xs">Logo</div>
                  )}
                </div>
              </div>
              <div className="pt-8 p-md">
                <h4 className="font-title-md">{org?.name || 'Nome da Organização'}</h4>
                <p className="text-on-surface-variant text-body-sm">{org?.slug || 'slug-da-organizacao'}</p>
                <div className="mt-md flex gap-sm">
                  <button
                    style={{ backgroundColor: primary, color: '#000000' }}
                    className="px-md py-sm rounded font-label-sm font-bold shadow"
                  >
                    Perfil Público
                  </button>
                  <button
                    style={{ borderColor: secondary, color: secondary }}
                    className="border px-md py-sm rounded font-label-sm font-bold"
                  >
                    Certificados
                  </button>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </OnboardingLayout>
  )
}

