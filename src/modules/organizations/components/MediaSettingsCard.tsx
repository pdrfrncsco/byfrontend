import React from 'react'
import { Image, UploadCloud } from 'lucide-react'
import { Button, Card, CardTitle } from '@/components/ui'

interface MediaSettingsCardProps {
  logoUrl?: string | null
  bannerUrl?: string | null
  orgName: string
  primaryColor: string
  firstLetter: string
  logoInputRef: React.RefObject<HTMLInputElement>
  bannerInputRef: React.RefObject<HTMLInputElement>
  onLogoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  onBannerUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  isLogoUploading: boolean
  isBannerUploading: boolean
}

export function MediaSettingsCard({
  logoUrl,
  bannerUrl,
  orgName,
  primaryColor,
  firstLetter,
  logoInputRef,
  bannerInputRef,
  onLogoUpload,
  onBannerUpload,
  isLogoUploading,
  isBannerUploading,
}: MediaSettingsCardProps) {
  return (
    <div className="grid grid-cols-1 gap-lg md:grid-cols-2">
      <Card padding="md" className="space-y-md">
        <CardTitle className="pb-0">
          <UploadCloud className="h-4 w-4 text-primary" aria-hidden="true" />
          <span>Logótipo Oficial</span>
        </CardTitle>
        <div className="flex items-center gap-md">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={orgName}
              className="h-20 w-20 rounded-xl border border-outline-variant/40 object-cover"
            />
          ) : (
            <div
              className="flex h-20 w-20 items-center justify-center rounded-xl font-display-lg text-2xl text-white"
              style={{ backgroundColor: primaryColor }}
            >
              {firstLetter}
            </div>
          )}
          <div className="space-y-xs">
            <input
              ref={logoInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/svg+xml"
              onChange={onLogoUpload}
              className="hidden"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => logoInputRef.current?.click()}
              loading={isLogoUploading}
            >
              {isLogoUploading ? 'A carregar...' : 'Alterar logo'}
            </Button>
            <p className="text-[10px] text-outline">JPEG, PNG, WebP ou SVG (máx. 5MB)</p>
          </div>
        </div>
      </Card>

      <Card padding="md" className="space-y-md">
        <CardTitle className="pb-0">
          <Image className="h-4 w-4 text-primary" aria-hidden="true" />
          <span>Banner de Capa</span>
        </CardTitle>
        <div className="flex items-center gap-md">
          {bannerUrl ? (
            <img
              src={bannerUrl}
              alt="Banner actual"
              className="h-20 w-24 rounded-xl border border-outline-variant/40 object-cover"
            />
          ) : (
            <div className="flex h-20 w-24 items-center justify-center rounded-xl border border-outline-variant/20 bg-surface-bright text-outline">
              <Image className="h-6 w-6 opacity-30" aria-hidden="true" />
            </div>
          )}
          <div className="space-y-xs">
            <input
              ref={bannerInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={onBannerUpload}
              className="hidden"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => bannerInputRef.current?.click()}
              loading={isBannerUploading}
            >
              {isBannerUploading ? 'A carregar...' : 'Carregar capa'}
            </Button>
            <p className="text-[10px] text-outline">Formato paisagem. Recomendado 1200x400 (máx. 5MB)</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
