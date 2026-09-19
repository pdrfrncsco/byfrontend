import { useState, useEffect } from 'react'
import { Calendar, MapPin, Loader2, X, AlertTriangle } from 'lucide-react'
import { Button, Input, NativeSelect } from '@/components/ui'
import { FormField } from '@/components/ui/form-field'
import { useUpdateMatch } from '../hooks/useCompetitionMatches'
import type { Match } from '../types'

interface EditMatchModalProps {
  competitionId: string
  match: Match | null
  isOpen: boolean
  onClose: () => void
  clubs?: Array<{ id: string; name: string }>
}

export function EditMatchModal({
  competitionId,
  match,
  isOpen,
  onClose,
  clubs = [],
}: EditMatchModalProps) {
  const updateMatch = useUpdateMatch(competitionId)

  const [matchDate, setMatchDate] = useState('')
  const [venue, setVenue] = useState('')
  const [roundNumber, setRoundNumber] = useState(1)
  const [roundName, setRoundName] = useState('')
  const [status, setStatus] = useState('scheduled')
  const [homeClub, setHomeClub] = useState('')
  const [awayClub, setAwayClub] = useState('')

  useEffect(() => {
    if (match) {
      // Format datetime-local string (YYYY-MM-DDTHH:mm)
      try {
        const d = new Date(match.match_date)
        if (!isNaN(d.getTime())) {
          const pad = (n: number) => String(n).padStart(2, '0')
          const dateStr = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
          setMatchDate(dateStr)
        } else {
          setMatchDate('')
        }
      } catch {
        setMatchDate('')
      }
      setVenue(match.venue || '')
      setRoundNumber(match.round_number || 1)
      setRoundName(match.round_name || '')
      setStatus(match.status || 'scheduled')
      setHomeClub(match.home_club || '')
      setAwayClub(match.away_club || '')
    }
  }, [match])

  if (!isOpen || !match) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const payload: {
      match_date?: string
      venue?: string
      round_number?: number
      round_name?: string
      status?: string
      home_club?: string
      away_club?: string
    } = {}

    if (matchDate) {
      payload.match_date = new Date(matchDate).toISOString()
    }
    payload.venue = venue
    payload.round_number = Number(roundNumber)
    payload.round_name = roundName || undefined
    payload.status = status
    if (homeClub && homeClub !== match.home_club) payload.home_club = homeClub
    if (awayClub && awayClub !== match.away_club) payload.away_club = awayClub

    updateMatch.mutate(
      {
        matchId: match.id,
        data: payload,
      },
      {
        onSuccess: () => {
          onClose()
        },
      }
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg rounded-2xl border border-outline-variant/30 bg-surface p-6 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 rounded-lg p-1.5 text-on-surface-variant hover:bg-surface-container-high transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-5">
          <h3 className="text-lg font-bold text-on-surface flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Editar Partida
          </h3>
          <p className="text-xs text-on-surface-variant mt-1">
            {match.home_club_name} vs {match.away_club_name} (Jornada {match.round_number})
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Data e Hora */}
          <FormField label="Data e Hora do Jogo" htmlFor="edit-match-date">
            <Input
              id="edit-match-date"
              type="datetime-local"
              value={matchDate}
              onChange={(e) => setMatchDate(e.target.value)}
              required
            />
          </FormField>

          {/* Local / Estádio */}
          <FormField label="Estádio / Campo" htmlFor="edit-match-venue">
            <Input
              id="edit-match-venue"
              type="text"
              placeholder="Ex: Estádio 11 de Novembro"
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
            />
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            {/* Jornada / Ronda */}
            <FormField label="Número da Ronda/Jornada" htmlFor="edit-match-round">
              <Input
                id="edit-match-round"
                type="number"
                min={1}
                value={roundNumber}
                onChange={(e) => setRoundNumber(Number(e.target.value))}
                required
              />
            </FormField>

            {/* Nome da Ronda */}
            <FormField label="Rótulo / Nome da Ronda" htmlFor="edit-match-round-name">
              <Input
                id="edit-match-round-name"
                type="text"
                placeholder="Ex: Jornada 1"
                value={roundName}
                onChange={(e) => setRoundName(e.target.value)}
              />
            </FormField>
          </div>

          {/* Estado da Partida */}
          <FormField label="Estado da Partida" htmlFor="edit-match-status">
            <NativeSelect
              id="edit-match-status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="scheduled">Agendado (Scheduled)</option>
              <option value="pre_match">Pré-Jogo (Pre-Match)</option>
              <option value="live">Em Curso (Live)</option>
              <option value="halftime">Intervalo (Halftime)</option>
              <option value="finished">Concluído (Finished)</option>
              <option value="postponed">Adiado (Postponed)</option>
              <option value="cancelled">Cancelado (Cancelled)</option>
              <option value="walkover">Desqualificação / Walkover</option>
            </NativeSelect>
          </FormField>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-outline-variant/15">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={updateMatch.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={updateMatch.isPending}
            >
              {updateMatch.isPending ? (
                <>
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                  A guardar...
                </>
              ) : (
                'Guardar Alterações'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
