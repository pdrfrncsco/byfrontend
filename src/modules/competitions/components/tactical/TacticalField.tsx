import React, { useCallback, useRef, useState } from 'react'
import PlayerToken from './PlayerToken'

export interface TacticalPlayer {
  id: string
  number?: string | number
  name?: string
  x: number // normalized 0..1
  y: number
}

export interface TacticalFieldProps {
  players: TacticalPlayer[]
  onPositionsChange?: (players: TacticalPlayer[]) => void
  width?: number
  height?: number
}

export default function TacticalField({ players: initialPlayers, onPositionsChange, width = 1000, height = 700 }: TacticalFieldProps) {
  const [players, setPlayers] = useState<TacticalPlayer[]>(initialPlayers)
  const dragging = useRef<{ id: string; offsetX: number; offsetY: number } | null>(null)
  const svgRef = useRef<SVGSVGElement | null>(null)

  const findPlayer = useCallback((id: string) => players.find(p => p.id === id), [players])

  const toNormalized = useCallback((clientX: number, clientY: number) => {
    const svg = svgRef.current!
    const pt = svg.createSVGPoint()
    pt.x = clientX
    pt.y = clientY
    const svgP = pt.matrixTransform(svg.getScreenCTM()!.inverse())
    return { x: Math.max(0, Math.min(1, svgP.x / width)), y: Math.max(0, Math.min(1, svgP.y / height)) }
  }, [width, height])

  const onPointerDown = (e: React.PointerEvent, id: string) => {
    const p = findPlayer(id)
    if (!p) return
    const svg = svgRef.current
    if (!svg) return
    (e.target as Element).setPointerCapture(e.pointerId)
    const norm = toNormalized(e.clientX, e.clientY)
    dragging.current = { id, offsetX: norm.x - p.x, offsetY: norm.y - p.y }
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return
    const { id, offsetX, offsetY } = dragging.current
    const norm = toNormalized(e.clientX, e.clientY)
    const next = players.map(p => p.id === id ? { ...p, x: norm.x - offsetX, y: norm.y - offsetY } : p)
    setPlayers(next)
  }

  const onPointerUp = (e: React.PointerEvent) => {
    if (!dragging.current) return
    const id = dragging.current.id
    dragging.current = null
    const p = players.find(pp => pp.id === id)
    if (p && onPositionsChange) onPositionsChange(players)
  }

  return (
    <div className="tactical-field" style={{ width, maxWidth: '100%' }}>
      <svg
        ref={svgRef}
        width="100%"
        viewBox={`0 0 ${width} ${height}`}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        role="img"
        aria-label="Vista táctica da equipa"
      >
        <defs>
          <linearGradient id="grass" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#7cc242" />
            <stop offset="100%" stopColor="#66b032" />
          </linearGradient>
        </defs>

        <rect x={0} y={0} width={width} height={height} rx={20} fill="url(#grass)" stroke="#2a6b1f" strokeWidth={4} />

        {/* halfway line */}
        <line x1={width / 2} y1={0} x2={width / 2} y2={height} stroke="#fff" strokeWidth={2} strokeDasharray="8 8" />

        {/* center circle */}
        <circle cx={width / 2} cy={height / 2} r={60} fill="none" stroke="#fff" strokeWidth={2} />

        {/* Players */}
        {players.map(p => (
          <PlayerToken key={p.id} {...p} onPointerDown={onPointerDown} />
        ))}
      </svg>
    </div>
  )
}
