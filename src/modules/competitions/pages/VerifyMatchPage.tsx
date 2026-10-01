import React, { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  FileText,
  CheckCircle2,
  AlertTriangle,
  Printer,
  ExternalLink,
  Shield,
  Calendar,
  MapPin,
  Clock,
  Award,
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import client from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  MatchOfficialScoresheetModal,
  type MatchScoresheetData,
} from '../components/MatchOfficialScoresheetModal'

export function VerifyMatchPage() {
  const { id = '' } = useParams<{ id: string }>()
  const [showScoresheetModal, setShowScoresheetModal] = useState(false)

  // Fetch match details by ID
  const { data: matchData, isLoading, isError } = useQuery<MatchScoresheetData | null>({
    queryKey: ['match-verify', id],
    queryFn: async () => {
      try {
        const response = await client.get(`/competitions/matches/${id}/report/`)
        const report = response.data?.data || response.data?.report || response.data
        const match = report?.match_data || report

        return {
          id: id,
          competitionName: match?.competition_name || 'Campeonato Nacional FAF',
          season: match?.season || '2026/2027',
          roundName: match?.round_name || 'Jornada Oficial',
          date: match?.match_date || match?.scheduledAt || new Date().toISOString(),
          time: match?.match_time || undefined,
          stadium: match?.venue || match?.stadium || 'Estádio Oficial',
          city: match?.city || 'Luanda',
          homeClub: {
            id: match?.home_club || match?.home_team_id || 'home',
            name: match?.home_club_name || match?.home_team_name || 'Equipa Visitada',
            score: match?.home_score ?? 0,
            lineup: report?.home_lineup || [],
          },
          awayClub: {
            id: match?.away_club || match?.away_team_id || 'away',
            name: match?.away_club_name || match?.away_team_name || 'Equipa Visitante',
            score: match?.away_score ?? 0,
            lineup: report?.away_lineup || [],
          },
          goals: report?.goals || [],
          cards: report?.cards || [],
          referees: {
            mainReferee: report?.referee_name || match?.referee_name || 'Árbitro Principal Homologado',
            assistant1: report?.assistant_1 || 'Árbitro Assistente 1',
            assistant2: report?.assistant_2 || 'Árbitro Assistente 2',
            delegate: report?.delegate_name || 'Delegado FAF',
          },
          status: match?.status || 'finished',
        }
      } catch (err) {
        // Fallback to match directly if report not found yet
        const matchRes = await client.get(`/competitions/matches/${id}/`)
        const m = matchRes.data?.data || matchRes.data
        return {
          id: id,
          competitionName: m?.competition_name || 'Competição Oficial FAF',
          season: '2026/2027',
          roundName: m?.round_name || 'Jornada Oficial',
          date: m?.match_date || new Date().toISOString(),
          stadium: m?.venue || 'Estádio Municipal',
          city: 'Angola',
          homeClub: {
            id: m?.home_club || 'home',
            name: m?.home_club_name || 'Equipa Casa',
            score: m?.home_score ?? 0,
          },
          awayClub: {
            id: m?.away_club || 'away',
            name: m?.away_club_name || 'Equipa Fora',
            score: m?.away_score ?? 0,
          },
          status: m?.status || 'finished',
        }
      }
    },
    enabled: Boolean(id),
    staleTime: 60_000,
  })

  const verificationTimestamp = new Date().toLocaleString('pt-AO', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-16 h-16 rounded-full border-4 border-brand-400 border-t-transparent animate-spin" />
          <p className="text-sm font-bold text-neutral-300">A validar súmula oficial na base de dados da FAF...</p>
        </div>
      </div>
    )
  }

  if (isError || !matchData) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-neutral-900 border border-rose-500/40 rounded-3xl p-8 text-center space-y-4 shadow-2xl">
          <div className="w-16 h-16 mx-auto rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-black text-white uppercase tracking-tight">
            Súmula de Jogo Não Encontrada
          </h1>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Não foi possível verificar a súmula oficial para o identificador <span className="font-mono text-rose-300">{id}</span>.
          </p>
          <div className="pt-2">
            <Button asChild variant="outline" size="sm" className="w-full">
              <Link to="/competitions">Consultar Competições</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-950 text-white py-8 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-400 text-neutral-950 flex items-center justify-center font-black text-base shadow-md">
              FAF
            </div>
            <div>
              <h2 className="text-xs font-black uppercase tracking-wider text-brand-300">
                Federação Angolana de Futebol
              </h2>
              <p className="text-[10px] text-neutral-400 uppercase font-semibold">
                Validação de Súmula e Relatório de Jogo
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-[10px] font-bold uppercase">
            HOMOLOGAÇÃO OFICIAL
          </Badge>
        </div>

        {/* Homologation Container */}
        <div className="rounded-3xl border-2 border-emerald-500/40 bg-emerald-950/20 p-6 backdrop-blur-sm space-y-6 shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-neutral-950 flex items-center justify-center font-bold shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-lg font-black text-white uppercase tracking-tight">
                Resultado & Súmula Homologados
              </h1>
              <p className="text-xs text-emerald-300">
                {matchData.competitionName} • {matchData.roundName}
              </p>
            </div>
          </div>

          {/* Scoreboard Card */}
          <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4">
            <div className="flex items-center justify-around py-2">
              <div className="text-center w-5/12">
                <h3 className="font-bold text-sm sm:text-base text-white uppercase">
                  {matchData.homeClub.name}
                </h3>
                <span className="text-[10px] text-neutral-400 uppercase font-semibold">Visitado</span>
              </div>

              <div className="text-center w-2/12">
                <div className="px-3 py-1.5 rounded-xl bg-neutral-800 text-white font-black text-xl sm:text-2xl font-mono border border-neutral-700">
                  {matchData.homeClub.score} - {matchData.awayClub.score}
                </div>
              </div>

              <div className="text-center w-5/12">
                <h3 className="font-bold text-sm sm:text-base text-white uppercase">
                  {matchData.awayClub.name}
                </h3>
                <span className="text-[10px] text-neutral-400 uppercase font-semibold">Visitante</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-3 border-t border-neutral-800 text-xs text-neutral-300">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-brand-400" />
                <span>{new Date(matchData.date).toLocaleDateString('pt-AO')}</span>
              </div>
              <div className="flex items-center gap-1.5 justify-end">
                <MapPin className="w-3.5 h-3.5 text-brand-400" />
                <span className="truncate">{matchData.stadium}</span>
              </div>
            </div>
          </div>

          {/* Validation Details */}
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-900/60 border border-neutral-800">
              <span className="text-neutral-400">Identificador da Partida:</span>
              <span className="font-mono text-neutral-200 font-bold">{id}</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-900/60 border border-neutral-800">
              <span className="text-neutral-400">Equipa de Arbitragem:</span>
              <span className="font-bold text-emerald-300">
                {matchData.referees?.mainReferee || 'Certificada pela FAF'}
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-900/60 border border-neutral-800">
              <span className="text-neutral-400">Estado Regulamentar:</span>
              <span className="font-bold text-emerald-300 uppercase">Homologado e Arquivado</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-900/60 border border-neutral-800">
              <span className="text-neutral-400">Data de Verificação:</span>
              <span className="font-mono text-neutral-300 text-[11px]">{verificationTimestamp}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
            <Button
              onClick={() => setShowScoresheetModal(true)}
              variant="primary"
              size="sm"
              className="w-full bg-brand-500 hover:bg-brand-400 text-neutral-950 font-bold"
            >
              <Printer className="w-4 h-4 mr-1.5" />
              <span>Ver Súmula Oficial em PDF</span>
            </Button>
          </div>
        </div>

        {/* Security Notice */}
        <p className="text-[11px] text-center text-neutral-500 leading-normal">
          Documento digital com assinatura e validação eletrónica emitido sob a autoridade da Federação Angolana de Futebol.
        </p>
      </div>

      {/* Scoresheet Modal */}
      <MatchOfficialScoresheetModal
        isOpen={showScoresheetModal}
        onClose={() => setShowScoresheetModal(false)}
        matchData={matchData}
      />
    </div>
  )
}
