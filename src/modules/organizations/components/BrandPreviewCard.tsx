import { Palette } from 'lucide-react'
import { Card, CardHeader, CardTitle } from '@/components/ui'

interface BrandPreviewCardProps {
  bannerUrl?: string | null
  logoUrl?: string | null
  orgName: string
  orgType: string
  orgTypeLabel?: string
  primaryColor: string
  secondaryColor: string
  firstLetter: string
}

export function BrandPreviewCard({
  bannerUrl,
  logoUrl,
  orgName,
  orgType,
  orgTypeLabel,
  primaryColor,
  secondaryColor,
  firstLetter,
}: BrandPreviewCardProps) {
  return (
    <Card padding="none" className="overflow-hidden">
      <CardHeader>
        <CardTitle>
          <Palette className="h-4 w-4 text-primary" aria-hidden="true" />
          <span>Pré-visualização de Marca (Live Preview)</span>
        </CardTitle>
      </CardHeader>

      <div className="relative h-44 w-full overflow-hidden bg-surface-lowest">
        {bannerUrl ? (
          <img src={bannerUrl} alt="Banner preview" className="h-full w-full object-cover opacity-60" />
        ) : (
          <div
            className="h-full w-full opacity-40 transition-colors duration-500"
            style={{
              background: `linear-gradient(135deg, ${primaryColor || '#1B4D3E'} 0%, #031427 100%)`,
            }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-surface-container-high via-transparent to-transparent" />

        <div className="absolute bottom-md left-md flex items-end gap-md">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt="Logo preview"
              className="h-16 w-16 rounded-lg border-2 border-surface-container-high bg-surface-container object-cover shadow-md"
            />
          ) : (
            <div
              className="flex h-16 w-16 items-center justify-center rounded-lg border-2 border-surface-container-high font-display-lg text-xl text-white shadow-md transition-colors duration-500"
              style={{ backgroundColor: primaryColor || '#1B4D3E' }}
            >
              {firstLetter}
            </div>
          )}

          <div className="mb-xs">
            <h4 className="font-title-md text-sm text-on-surface drop-shadow-md">
              {orgName}
            </h4>
            <p
              className="text-[10px] font-bold uppercase tracking-wider drop-shadow"
              style={{ color: secondaryColor || '#D4AF37' }}
            >
              {orgTypeLabel || orgType}
            </p>
          </div>
        </div>
      </div>
    </Card>
  )
}
