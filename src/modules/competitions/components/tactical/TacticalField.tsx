import React, { useCallback, useEffect, useRef, useState } from 'react'
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

export default function TacticalField({
  players: initialPlayers,
  onPositionsChange,
  width = 1000,
  height = 700,
}: TacticalFieldProps) {
  const [players, setPlayers] = useState<TacticalPlayer[]>(initialPlayers || [])
  const playersRef = useRef<TacticalPlayer[]>(players)
  playersRef.current = players

  const dragging = useRef<{ id: string; offsetX: number; offsetY: number } | null>(null)
  const svgRef = useRef<SVGSVGElement | null>(null)

  // Keep internal state in sync with prop updates
  useEffect(() => {
    setPlayers(initialPlayers || [])
  }, [initialPlayers])

  const findPlayer = useCallback(
    (id: string) => playersRef.current.find(p => p.id === id),
    []
  )

  const toNormalized = useCallback(
    (clientX: number, clientY: number) => {
      const svg = svgRef.current
      if (!svg) return { x: 0.5, y: 0.5 }
      const pt = svg.createSVGPoint()
      pt.x = clientX
      pt.y = clientY
      const ctm = svg.getScreenCTM()
      if (!ctm) return { x: 0.5, y: 0.5 }
      const svgP = pt.matrixTransform(ctm.inverse())
      return {
        x: Math.max(0.02, Math.min(0.98, svgP.x / width)),
        y: Math.max(0.04, Math.min(0.96, svgP.y / height)),
      }
    },
    [width, height]
  )

  const onPointerDown = (e: React.PointerEvent, id: string) => {
    const p = findPlayer(id)
    if (!p) return
    const svg = svgRef.current
    if (!svg) return
    ;(e.target as Element).setPointerCapture?.(e.pointerId)
    const norm = toNormalized(e.clientX, e.clientY)
    dragging.current = { id, offsetX: norm.x - p.x, offsetY: norm.y - p.y }
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return
    const { id, offsetX, offsetY } = dragging.current
    const norm = toNormalized(e.clientX, e.clientY)
    const newX = Math.max(0.02, Math.min(0.98, norm.x - offsetX))
    const newY = Math.max(0.04, Math.min(0.96, norm.y - offsetY))
    const next = playersRef.current.map(p =>
      p.id === id ? { ...p, x: newX, y: newY } : p
    )
    setPlayers(next)
  }

  const onPointerUp = (_e: React.PointerEvent) => {
    if (!dragging.current) return
    dragging.current = null
    if (onPositionsChange) {
      onPositionsChange(playersRef.current)
    }
  }

  // Pitch dimensions with 24px inner margin
  const marginX = 24
  const marginY = 24
  const pitchW = width - marginX * 2
  const pitchH = height - marginY * 2
  const midX = width / 2
  const midY = height / 2

  // Box dimensions
  const penW = 165
  const penH = 340
  const goalAreaW = 55
  const goalAreaH = 160
  const penSpotDist = 110
  const centerRadius = 75

  return (
    <div className="tactical-field relative select-none" style={{ width, maxWidth: '100%' }}>
      <svg
        ref={svgRef}
        width="100%"
        viewBox={`0 0 ${width} ${height}`}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        role="img"
        aria-label="Prancheta táctica do campo de futebol"
        className="touch-none rounded-2xl shadow-xl"
      >
        <defs>
          <linearGradient id="grass-turf" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#1e5f38" />
            <stop offset="50%" stopColor="#1b5432" />
            <stop offset="100%" stopColor="#154227" />
          </linearGradient>
          <pattern id="turf-stripes" width="100" height="700" patternUnits="userSpaceOnUse">
            <rect x="0" y="0" width="50" height="700" fill="rgba(255,255,255,0.02)" />
            <rect x="50" y="0" width="50" height="700" fill="transparent" />
          </pattern>
        </defs>

        {/* Pitch background */}
        <rect x={0} y={0} width={width} height={height} rx={16} fill="url(#grass-turf)" stroke="#0d2b19" strokeWidth={4} />
        <rect x={0} y={0} width={width} height={height} fill="url(#turf-stripes)" />

        {/* Outer boundary touchline */}
        <rect
          x={marginX}
          y={marginY}
          width={pitchW}
          height={pitchH}
          fill="none"
          stroke="rgba(255,255,255,0.75)"
          strokeWidth={3}
        />

        {/* Halfway line */}
        <line
          x1={midX}
          y1={marginY}
          x2={midX}
          y2={height - marginY}
          stroke="rgba(255,255,255,0.7)"
          strokeWidth={2.5}
        />

        {/* Center circle and spot */}
        <circle
          cx={midX}
          cy={midY}
          r={centerRadius}
          fill="none"
          stroke="rgba(255,255,255,0.7)"
          strokeWidth={2.5}
        />
        <circle cx={midX} cy={midY} r={4} fill="rgba(255,255,255,0.9)" />

        {/* Left penalty box */}
        <rect
          x={marginX}
          y={midY - penH / 2}
          width={penW}
          height={penH}
          fill="none"
          stroke="rgba(255,255,255,0.7)"
          strokeWidth={2.5}
        />
        {/* Left goal area (6-yard) */}
        <rect
          x={marginX}
          y={midY - goalAreaH / 2}
          width={goalAreaW}
          height={goalAreaH}
          fill="none"
          stroke="rgba(255,255,255,0.65)"
          strokeWidth={2}
        />
        {/* Left penalty spot */}
        <circle cx={marginX + penSpotDist} cy={midY} r={3.5} fill="rgba(255,255,255,0.9)" />
        {/* Left penalty D arc */}
        <path
          d={`M ${marginX + penW} ${midY - 45} A 65 65 0 0 1 ${marginX + penW} ${midY + 45}`}
          fill="none"
          stroke="rgba(255,255,255,0.65)"
          strokeWidth={2}
        />

        {/* Right penalty box */}
        <rect
          x={width - marginX - penW}
          y={midY - penH / 2}
          width={penW}
          height={penH}
          fill="none"
          stroke="rgba(255,255,255,0.7)"
          strokeWidth={2.5}
        />
        {/* Right goal area */}
        <rect
          x={width - marginX - goalAreaW}
          y={midY - goalAreaH / 2}
          width={goalAreaW}
          height={goalAreaH}
          fill="none"
          stroke="rgba(255,255,255,0.65)"
          strokeWidth={2}
        />
        {/* Right penalty spot */}
        <circle cx={width - marginX - penSpotDist} cy={midY} r={3.5} fill="rgba(255,255,255,0.9)" />
        {/* Right penalty D arc */}
        <path
          d={`M ${width - marginX - penW} ${midY - 45} A 65 65 0 0 0 ${width - marginX - penW} ${midY + 45}`}
          fill="none"
          stroke="rgba(255,255,255,0.65)"
          strokeWidth={2}
        />

        {/* 4 Corner arcs */}
        <path d={`M ${marginX + 15} ${marginY} A 15 15 0 0 1 ${marginX} ${marginY + 15}`} fill="none" stroke="rgba(255,255,255,0.65)" strokeWidth={2} />
        <path d={`M ${marginX} ${height - marginY - 15} A 15 15 0 0 1 ${marginX + 15} ${height - marginY}`} fill="none" stroke="rgba(255,255,255,0.65)" strokeWidth={2} />
        <path d={`M ${width - marginX - 15} ${marginY} A 15 15 0 0 0 ${width - marginX} ${marginY + 15}`} fill="none" stroke="rgba(255,255,255,0.65)" strokeWidth={2} />
        <path d={`M ${width - marginX} ${height - marginY - 15} A 15 15 0 0 0 ${width - marginX - 15} ${height - marginY}`} fill="none" stroke="rgba(255,255,255,0.65)" strokeWidth={2} />

        {/* Goal post indicators */}
        <rect x={marginX - 8} y={midY - 40} width={8} height={80} fill="rgba(255,255,255,0.3)" stroke="rgba(255,255,255,0.8)" strokeWidth={1.5} />
        <rect x={width - marginX} y={midY - 40} width={8} height={80} fill="rgba(255,255,255,0.3)" stroke="rgba(255,255,255,0.8)" strokeWidth={1.5} />

        {/* Players */}
        {players.map(p => (
          <PlayerToken key={p.id} {...p} onPointerDown={onPointerDown} />
        ))}
      </svg>
    </div>
  )
}
