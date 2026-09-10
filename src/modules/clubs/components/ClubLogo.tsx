import { useEffect, useState } from 'react'
import { resolveMediaUrl } from '@/lib/media'
import { cn } from '@/lib/utils'

export type ClubLogoSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'custom'
export type ClubLogoShape = 'squircle' | 'circle' | 'rounded'

export interface ClubLogoProps {
  name: string
  logoUrl?: string | null
  shortName?: string | null
  primaryColor?: string | null
  size?: ClubLogoSize
  shape?: ClubLogoShape
  className?: string
  imgClassName?: string
  fallbackClassName?: string
  priority?: boolean
}

const SIZE_MAP: Record<Exclude<ClubLogoSize, 'custom'>, { container: string; text: string; radius: string }> = {
  xs: {
    container: 'h-6 w-6',
    text: 'text-[10px]',
    radius: 'rounded-md',
  },
  sm: {
    container: 'h-8 w-8',
    text: 'text-xs font-semibold',
    radius: 'rounded-lg',
  },
  md: {
    container: 'h-14 w-14',
    text: 'text-base font-bold',
    radius: 'rounded-2xl',
  },
  lg: {
    container: 'h-16 w-16',
    text: 'text-lg font-bold',
    radius: 'rounded-2xl',
  },
  xl: {
    container: 'h-20 w-20',
    text: 'text-2xl font-bold',
    radius: 'rounded-3xl',
  },
  '2xl': {
    container: 'h-24 w-24',
    text: 'text-3xl font-bold',
    radius: 'rounded-3xl',
  },
}

export function ClubLogo({
  name,
  logoUrl,
  shortName,
  primaryColor,
  size = 'md',
  shape = 'squircle',
  className,
  imgClassName,
  fallbackClassName,
  priority = false,
}: ClubLogoProps) {
  const [imgError, setImgError] = useState(false)
  const resolvedUrl = resolveMediaUrl(logoUrl)
  const bgColor = primaryColor || '#1B4D3E'

  useEffect(() => {
    setImgError(false)
  }, [logoUrl])

  const initials = (shortName || name || '?').slice(0, 2).toUpperCase()

  const sizeConfig = size === 'custom' ? null : SIZE_MAP[size]
  const containerSizeClass = sizeConfig ? sizeConfig.container : ''
  const textSizeClass = sizeConfig ? sizeConfig.text : 'text-base font-bold'

  const shapeClass =
    shape === 'circle'
      ? 'rounded-full'
      : shape === 'rounded'
        ? 'rounded-xl'
        : sizeConfig
          ? sizeConfig.radius
          : 'rounded-2xl'

  const hasValidImage = Boolean(resolvedUrl && !imgError)

  return (
    <div
      className={cn(
        'relative flex shrink-0 items-center justify-center overflow-hidden transition-all duration-200',
        containerSizeClass,
        shapeClass,
        !hasValidImage && 'text-on-primary shadow-sm',
        className,
      )}
      style={!hasValidImage ? { backgroundColor: bgColor } : undefined}
      title={name}
      aria-label={`${name} logo`}
    >
      {hasValidImage ? (
        <img
          src={resolvedUrl}
          alt={`${name} logo`}
          loading={priority ? 'eager' : 'lazy'}
          className={cn('h-full w-full object-cover', imgClassName)}
          onError={() => setImgError(true)}
        />
      ) : (
        <span className={cn('select-none tracking-wider text-on-primary', textSizeClass, fallbackClassName)}>
          {initials}
        </span>
      )}
    </div>
  )
}
