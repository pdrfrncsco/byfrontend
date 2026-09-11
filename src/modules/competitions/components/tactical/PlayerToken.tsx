import React from 'react'

export interface PlayerTokenProps {
  id: string
  number?: string | number
  name?: string
  x: number // 0..1 normalized
  y: number // 0..1 normalized
  radius?: number
  team?: 'home' | 'away'
  isGK?: boolean
  onPointerDown?: (e: React.PointerEvent, id: string) => void
}

function getShortName(fullName?: string): string {
  if (!fullName) return ''
  const parts = fullName.trim().split(/\s+/)
  if (parts.length === 1) return parts[0]
  const firstInitial = parts[0].charAt(0).toUpperCase()
  const lastName = parts[parts.length - 1]
  return `${firstInitial}. ${lastName}`
}

export default function PlayerToken({
  id,
  number,
  name,
  x,
  y,
  radius = 20,
  team = 'home',
  isGK = false,
  onPointerDown,
}: PlayerTokenProps) {
  const cx = x * 1000
  const cy = y * 700

  const fillColor = isGK
    ? '#d97706'
    : team === 'home'
      ? '#1e40af'
      : '#b91c1c'

  const strokeColor = isGK
    ? '#fde68a'
    : team === 'home'
      ? '#60a5fa'
      : '#f87171'

  const shortName = getShortName(name)

  return (
    <g
      role={`player-${id}`}
      transform={`translate(${cx}, ${cy})`}
      style={{ cursor: 'grab' }}
      className="transition-transform duration-75 active:scale-110 select-none"
      onPointerDown={(e) => onPointerDown && onPointerDown(e, id)}
    >
      {/* Circle Token */}
      <circle
        r={radius}
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth={2.5}
      />

      {/* Shirt number */}
      <text
        x={0}
        y={6}
        textAnchor="middle"
        fill="#ffffff"
        fontWeight={800}
        fontFamily="monospace"
        fontSize={radius * 0.85}
      >
        {number}
      </text>

      {/* Name Label */}
      {shortName && (
        <g transform={`translate(0, ${radius + 12})`}>
          <rect
            x={-36}
            y={-8}
            width={72}
            height={15}
            rx={3.5}
            fill="rgba(15, 23, 42, 0.85)"
            stroke="rgba(255, 255, 255, 0.15)"
            strokeWidth={0.5}
          />
          <text
            x={0}
            y={3}
            textAnchor="middle"
            fill="#ffffff"
            fontSize="8.5"
            fontWeight={600}
            fontFamily="system-ui, sans-serif"
          >
            {shortName}
          </text>
        </g>
      )}

      <title>{name ? `${name} (#${number})` : `#${number}`}</title>
    </g>
  )
}
