import React, { useRef } from 'react'
import {
  FileText,
  Printer,
  X,
  Shield,
  Calendar,
  MapPin,
  Clock,
  Award,
  CheckCircle2,
  Users,
  AlertTriangle,
  QrCode,
  Sparkles,
} from 'lucide-react'
import { QRCodeView } from '@/modules/shared/components/QRCodeView'

export interface MatchScoresheetData {
  id: string
  competitionName: string
  season?: string
  roundName?: string
  date: string
  time?: string
  stadium: string
  city: string
  homeClub: {
    id: string
    name: string
    logoUrl?: string
    score?: number
    lineup?: Array<{ number: number; name: string; position: string; isCaptain?: boolean; isStarter: boolean }>
  }
  awayClub: {
    id: string
    name: string
    logoUrl?: string
    score?: number
    lineup?: Array<{ number: number; name: string; position: string; isCaptain?: boolean; isStarter: boolean }>
  }
  goals?: Array<{ minute: number; playerName: string; team: 'home' | 'away'; type?: string }>
  cards?: Array<{ minute: number; playerName: string; team: 'home' | 'away'; card: 'yellow' | 'red'; reason?: string }>
  substitutions?: Array<{ minute: number; playerIn: string; playerOut: string; team: 'home' | 'away' }>
  referees?: {
    mainReferee?: string
    assistant1?: string
    assistant2?: string
    fourthOfficial?: string
    delegate?: string
  }
  status?: string
}

interface MatchOfficialScoresheetModalProps {
  isOpen: boolean
  onClose: () => void
  matchData: MatchScoresheetData
  federationName?: string
}

export const MatchOfficialScoresheetModal: React.FC<MatchOfficialScoresheetModalProps> = ({
  isOpen,
  onClose,
  matchData,
  federationName = 'Federação Angolana de Futebol',
}) => {
  const scoresheetRef = useRef<HTMLDivElement>(null)

  if (!isOpen) return null

  const verificationUrl = `https://bolayetu.ao/verify/match/${matchData.id}`
  const matchDateFormatted = matchData.date
    ? new Date(matchData.date).toLocaleDateString('pt-AO', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : 'Data a definir'

  const homeStarters = matchData.homeClub.lineup?.filter((p) => p.isStarter) || []
  const homeSubs = matchData.homeClub.lineup?.filter((p) => !p.isStarter) || []
  const awayStarters = matchData.awayClub.lineup?.filter((p) => p.isStarter) || []
  const awaySubs = matchData.awayClub.lineup?.filter((p) => !p.isStarter) || []

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in">
      <div className="relative w-full max-w-4xl bg-surface-card border border-brand-500/30 rounded-3xl shadow-2xl overflow-hidden my-6">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-surface-cardHover/50">
          <div className="flex items-center gap-2 text-brand-400">
            <FileText className="w-5 h-5 text-brand-400" />
            <span className="font-bold text-sm tracking-wide text-text-primary">
              Súmula Oficial de Jogo (Ficha de Jogo FAF)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-400 text-neutral-950 text-xs font-bold shadow-lg shadow-brand-500/20 transition active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / Exportar PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-neutral-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Scoresheet Document Area */}
        <div className="p-6 md:p-8 max-h-[80vh] overflow-y-auto bg-neutral-950 print:bg-white print:p-0 print:max-h-none print:overflow-visible">
          <div
            ref={scoresheetRef}
            id="printable-scoresheet-document"
            className="bg-white text-neutral-900 p-8 rounded-2xl shadow-xl space-y-6 border border-neutral-300 print:border-none print:shadow-none print:p-4 text-xs font-sans"
          >
            {/* 1. Header: Federation & Competition */}
            <div className="flex items-center justify-between border-b-2 border-neutral-900 pb-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#014d40] text-white flex items-center justify-center font-black text-lg shadow">
                  FAF
                </div>
                <div>
                  <h1 className="font-black text-base uppercase tracking-wider text-neutral-900">
                    {federationName}
                  </h1>
                  <h2 className="font-bold text-xs uppercase text-emerald-800">
                    {matchData.competitionName} {matchData.season ? `• ${matchData.season}` : ''}
                  </h2>
                  <p className="text-[10px] text-neutral-600 uppercase font-semibold">
                    Relatório Oficial de Arbitragem e Súmula Eletrónica
                  </p>
                </div>
              </div>

              <div className="text-right flex flex-col items-end">
                <span className="px-3 py-1 rounded bg-neutral-900 text-white font-mono font-bold text-xs">
                  ID: {matchData.id.slice(0, 8).toUpperCase()}
                </span>
                <span className="text-[10px] text-neutral-600 font-bold uppercase mt-1">
                  {matchData.roundName || 'Jornada Oficial'}
                </span>
              </div>
            </div>

            {/* 2. Match Venue & Time Info */}
            <div className="grid grid-cols-3 gap-2 p-3 rounded-lg bg-neutral-100 border border-neutral-200 text-center">
              <div>
                <span className="text-[9px] uppercase font-bold text-neutral-500 block">Data & Hora</span>
                <span className="font-bold text-neutral-900">
                  {matchDateFormatted} {matchData.time ? `• ${matchData.time}` : ''}
                </span>
              </div>
              <div>
                <span className="text-[9px] uppercase font-bold text-neutral-500 block">Estádio & Cidade</span>
                <span className="font-bold text-neutral-900">
                  {matchData.stadium || 'Estádio Municipal'}, {matchData.city || 'Luanda'}
                </span>
              </div>
              <div>
                <span className="text-[9px] uppercase font-bold text-neutral-500 block">Estado Oficial</span>
                <span className="font-bold text-emerald-800 uppercase">
                  {matchData.status === 'finished' ? 'Terminado (Homologado)' : 'Oficial'}
                </span>
              </div>
            </div>

            {/* 3. Match Result Header */}
            <div className="flex items-center justify-around py-4 border-y-2 border-neutral-300 bg-neutral-50 rounded-xl">
              <div className="text-center w-5/12">
                <h3 className="font-black text-sm uppercase text-neutral-900">{matchData.homeClub.name}</h3>
                <span className="text-[10px] uppercase font-semibold text-neutral-500">Equipa Visitada</span>
              </div>

              <div className="text-center w-2/12 flex items-center justify-center">
                <div className="px-4 py-2 rounded-xl bg-neutral-900 text-white font-black text-2xl tracking-wider">
                  {matchData.homeClub.score ?? 0} - {matchData.awayClub.score ?? 0}
                </div>
              </div>

              <div className="text-center w-5/12">
                <h3 className="font-black text-sm uppercase text-neutral-900">{matchData.awayClub.name}</h3>
                <span className="text-[10px] uppercase font-semibold text-neutral-500">Equipa Visitante</span>
              </div>
            </div>

            {/* 4. Lineups (Onzes Iniciais e Suplentes) */}
            <div className="grid grid-cols-2 gap-4">
              {/* Home Team Squad */}
              <div className="space-y-3 p-3 rounded-xl border border-neutral-200">
                <h4 className="font-black text-xs uppercase text-neutral-900 border-b pb-1">
                  Plantel: {matchData.homeClub.name}
                </h4>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase text-neutral-500">Titulares</span>
                  {homeStarters.length > 0 ? (
                    homeStarters.map((p, idx) => (
                      <div key={idx} className="flex items-center justify-between text-[11px] py-0.5 border-b border-neutral-100">
                        <span className="font-mono font-bold w-6 text-neutral-700">{p.number}</span>
                        <span className="flex-1 font-semibold text-neutral-900">
                          {p.name} {p.isCaptain ? '(C)' : ''}
                        </span>
                        <span className="text-neutral-500 text-[10px] uppercase">{p.position}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-[10px] italic text-neutral-500">Alinhamento conforme ficha submetida.</p>
                  )}
                </div>

                {homeSubs.length > 0 && (
                  <div className="space-y-1 pt-1">
                    <span className="text-[10px] font-bold uppercase text-neutral-500">Suplentes</span>
                    {homeSubs.map((p, idx) => (
                      <div key={idx} className="flex items-center justify-between text-[11px] py-0.5 border-b border-neutral-100">
                        <span className="font-mono font-bold w-6 text-neutral-700">{p.number}</span>
                        <span className="flex-1 text-neutral-800">{p.name}</span>
                        <span className="text-neutral-500 text-[10px] uppercase">{p.position}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Away Team Squad */}
              <div className="space-y-3 p-3 rounded-xl border border-neutral-200">
                <h4 className="font-black text-xs uppercase text-neutral-900 border-b pb-1">
                  Plantel: {matchData.awayClub.name}
                </h4>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase text-neutral-500">Titulares</span>
                  {awayStarters.length > 0 ? (
                    awayStarters.map((p, idx) => (
                      <div key={idx} className="flex items-center justify-between text-[11px] py-0.5 border-b border-neutral-100">
                        <span className="font-mono font-bold w-6 text-neutral-700">{p.number}</span>
                        <span className="flex-1 font-semibold text-neutral-900">
                          {p.name} {p.isCaptain ? '(C)' : ''}
                        </span>
                        <span className="text-neutral-500 text-[10px] uppercase">{p.position}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-[10px] italic text-neutral-500">Alinhamento conforme ficha submetida.</p>
                  )}
                </div>

                {awaySubs.length > 0 && (
                  <div className="space-y-1 pt-1">
                    <span className="text-[10px] font-bold uppercase text-neutral-500">Suplentes</span>
                    {awaySubs.map((p, idx) => (
                      <div key={idx} className="flex items-center justify-between text-[11px] py-0.5 border-b border-neutral-100">
                        <span className="font-mono font-bold w-6 text-neutral-700">{p.number}</span>
                        <span className="flex-1 text-neutral-800">{p.name}</span>
                        <span className="text-neutral-500 text-[10px] uppercase">{p.position}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 5. Match Incidents (Golos, Cartões, Substituições) */}
            <div className="grid grid-cols-2 gap-4">
              {/* Goals */}
              <div className="p-3 rounded-xl border border-neutral-200 space-y-1">
                <h4 className="font-black text-xs uppercase text-neutral-900 border-b pb-1 flex items-center justify-between">
                  <span>⚽ Marcadores de Golos</span>
                </h4>
                {matchData.goals && matchData.goals.length > 0 ? (
                  matchData.goals.map((g, idx) => (
                    <div key={idx} className="flex items-center justify-between text-[11px] py-0.5">
                      <span className="font-semibold text-neutral-900">{g.playerName}</span>
                      <span className="font-mono font-bold text-neutral-600">{g.minute}&apos;</span>
                    </div>
                  ))
                ) : (
                  <p className="text-[10px] italic text-neutral-500 py-1">Sem golos registados.</p>
                )}
              </div>

              {/* Cards & Discipline */}
              <div className="p-3 rounded-xl border border-neutral-200 space-y-1">
                <h4 className="font-black text-xs uppercase text-neutral-900 border-b pb-1">
                  🟨 🟥 Disciplina & Cartões
                </h4>
                {matchData.cards && matchData.cards.length > 0 ? (
                  matchData.cards.map((c, idx) => (
                    <div key={idx} className="flex items-center justify-between text-[11px] py-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-3 h-4 rounded-xs inline-block ${c.card === 'red' ? 'bg-rose-600' : 'bg-amber-400'}`} />
                        <span className="font-semibold text-neutral-900">{c.playerName}</span>
                      </div>
                      <span className="font-mono font-bold text-neutral-600">{c.minute}&apos;</span>
                    </div>
                  ))
                ) : (
                  <p className="text-[10px] italic text-neutral-500 py-1">Jogo sem advertências disciplinares.</p>
                )}
              </div>
            </div>

            {/* 6. Refereeing Team & Official Signatures */}
            <div className="p-4 rounded-xl border-2 border-neutral-300 bg-neutral-50 space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <h4 className="font-black text-xs uppercase text-neutral-900">
                  Equipa de Arbitragem & Homologação
                </h4>
                <span className="text-[10px] font-bold text-emerald-800 uppercase">FAF Certificada</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[10px]">
                <div>
                  <span className="text-neutral-500 font-bold uppercase block">Árbitro Principal</span>
                  <span className="font-bold text-neutral-900">{matchData.referees?.mainReferee || 'Árbitro Nomeado'}</span>
                </div>
                <div>
                  <span className="text-neutral-500 font-bold uppercase block">Assistente 1</span>
                  <span className="font-bold text-neutral-900">{matchData.referees?.assistant1 || 'Assistente 1'}</span>
                </div>
                <div>
                  <span className="text-neutral-500 font-bold uppercase block">Assistente 2</span>
                  <span className="font-bold text-neutral-900">{matchData.referees?.assistant2 || 'Assistente 2'}</span>
                </div>
                <div>
                  <span className="text-neutral-500 font-bold uppercase block">Delegado ao Jogo</span>
                  <span className="font-bold text-neutral-900">{matchData.referees?.delegate || 'Delegado FAF'}</span>
                </div>
              </div>

              {/* Signature Lines & QR Code */}
              <div className="grid grid-cols-4 gap-4 pt-4 border-t border-dashed border-neutral-300 items-end text-center">
                <div>
                  <div className="border-b border-neutral-900 h-8 mb-1" />
                  <span className="text-[9px] uppercase font-bold text-neutral-600">Assinatura Árbitro</span>
                </div>
                <div>
                  <div className="border-b border-neutral-900 h-8 mb-1" />
                  <span className="text-[9px] uppercase font-bold text-neutral-600">Capitão Casa</span>
                </div>
                <div>
                  <div className="border-b border-neutral-900 h-8 mb-1" />
                  <span className="text-[9px] uppercase font-bold text-neutral-600">Capitão Fora</span>
                </div>
                <div className="flex flex-col items-center">
                  <QRCodeView
                    value={verificationUrl}
                    size={48}
                    bgColor="#ffffff"
                    color="#000000"
                    includeMargin={false}
                  />
                  <span className="text-[8px] font-mono font-bold text-neutral-600 mt-1">Selo Digital</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
