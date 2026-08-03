import { useEffect, useRef, useState } from 'react'

export interface MatchCountdownProps {
  scheduledAt: string
  className?: string
  /** Called once when the countdown reaches zero */
  onExpire?: () => void
}

function formatRemaining(milliseconds: number) {
  const totalMinutes = Math.max(0, Math.floor(milliseconds / 60_000))
  const days = Math.floor(totalMinutes / 1_440)
  const hours = Math.floor((totalMinutes % 1_440) / 60)
  const minutes = totalMinutes % 60

  if (days > 0) return `${days}d ${hours}h ${minutes}m`
  if (hours > 0) return `${hours}h ${minutes}m`
  if (minutes > 0) return `${minutes}m`
  return 'Em breve'
}

export function MatchCountdown({ scheduledAt, className = '', onExpire }: MatchCountdownProps) {
  const [remaining, setRemaining] = useState(() => new Date(scheduledAt).getTime() - Date.now())
  const expiredRef = useRef(false)

  useEffect(() => {
    expiredRef.current = false
    const update = () => {
      const next = new Date(scheduledAt).getTime() - Date.now()
      setRemaining(next)
      if (next <= 0 && !expiredRef.current) {
        expiredRef.current = true
        onExpire?.()
      }
    }
    update()
    // Poll every 10s — precise enough for a minute-level countdown
    const interval = window.setInterval(update, 10_000)
    return () => window.clearInterval(interval)
  }, [scheduledAt, onExpire])

  if (!Number.isFinite(remaining) || remaining < 0 || remaining > 7 * 24 * 60 * 60_000) return null

  return (
    <span className={`font-mono text-xs tabular-nums text-on-surface-variant ${className}`}>
      {formatRemaining(remaining)}
    </span>
  )
}
