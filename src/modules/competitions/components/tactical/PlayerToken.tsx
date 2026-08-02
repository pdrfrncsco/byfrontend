import React from 'react'

export interface PlayerTokenProps {
  id: string
  number?: string | number
  name?: string
  x: number // 0..1 normalized
  y: number // 0..1 normalized
  radius?: number
  onPointerDown?: (e: React.PointerEvent, id: string) => void
}

export default function PlayerToken({ id, number, name, x, y, radius = 20, onPointerDown }: PlayerTokenProps) {
  const cx = x * 1000
  const cy = y * 700

  return (
    <g
      role={`player-${id}`}
      transform={`translate(${cx}, ${cy})`}
      style={{ cursor: 'grab' }}
      onPointerDown={(e) => onPointerDown && onPointerDown(e, id)}
    >
      <circle r={radius} fill="#0052cc" stroke="#fff" strokeWidth={2} />
      <text x={0} y={6} textAnchor="middle" fill="#fff" fontWeight={700} fontSize={radius * 0.9}>
        {number}
      </text>
      <title>{name}</title>
    </g>
  )
}
