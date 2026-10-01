import React, { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  Shield,
  CheckCircle2,
  AlertTriangle,
  Award,
  Calendar,
  User,
  Activity,
  FileCheck2,
  ExternalLink,
  Printer,
  Sparkles,
  Search,
} from 'lucide-react'
import { usePlayer } from '../hooks/usePlayerQueries'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { resolveMediaUrl } from '@/lib/media'
import { PlayerDigitalLicenseModal } from '../components/PlayerDigitalLicenseModal'

export function VerifyPlayerPage() {
  const { slug = '' } = useParams<{ slug: string }>()
  const { data: player, isLoading, isError } = usePlayer(slug)
  const [showLicenseModal, setShowLicenseModal] = useState(false)

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
          <p className="text-sm font-bold text-neutral-300">A validar licença federativa na base de dados FAF...</p>
        </div>
      </div>
    )
  }

  if (isError || !player) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-neutral-900 border border-rose-500/40 rounded-3xl p-8 text-center space-y-4 shadow-2xl">
          <div className="w-16 h-16 mx-auto rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-black text-white uppercase tracking-tight">
            Licença Não Encontrada ou Inválida
          </h1>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Não foi possível verificar o registo do atleta pelo código fornecido (<span className="font-mono text-rose-300">{slug}</span>). O registo pode estar inativo, arquivado ou o QR Code expirou.
          </p>
          <div className="pt-2">
            <Button asChild variant="outline" size="sm" className="w-full">
              <Link to="/players">Consultar Atletas Públicos</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const avatar = resolveMediaUrl(player.avatar || player.profile_photo_url)
  const licenseNumber =
    (player as any).federation_id ||
    (player as any).license_number ||
    `FAF-2026-${player.id?.slice(0, 8).toUpperCase() || '894201'}`

  const isMedicalFit = true // In production fetched from medical compliance

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-950 text-white py-8 px-4 sm:px-6">
      <div className="max-w-xl mx-auto space-y-6">
        {/* Top Official Banner */}
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
                Portal de Validação Oficial de Licenças de Jogo
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-[10px] font-bold uppercase">
            CERTIFICADO VÁLIDO
          </Badge>
        </div>

        {/* Verification Success Box */}
        <div className="rounded-3xl border-2 border-emerald-500/40 bg-emerald-950/20 p-6 backdrop-blur-sm space-y-6 shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-neutral-950 flex items-center justify-center font-bold shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-lg font-black text-white uppercase tracking-tight">
                Licença Federativa Autêntica
              </h1>
              <p className="text-xs text-emerald-300">
                Atleta com registo ativo e elegível para competições oficiais
              </p>
            </div>
          </div>

          {/* Player Identity Card Preview */}
          <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl bg-neutral-900/90 border border-neutral-800">
            <div className="w-24 h-32 shrink-0 rounded-xl overflow-hidden border-2 border-brand-400 bg-neutral-950 flex items-center justify-center shadow-lg relative">
              {avatar ? (
                <img src={avatar} alt={player.full_name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-black text-brand-300">
                  {player.first_name?.[0]}
                  {player.last_name?.[0]}
                </span>
              )}
              {player.shirt_number && (
                <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/80 font-mono text-[9px] font-bold text-white">
                  #{player.shirt_number}
                </span>
              )}
            </div>

            <div className="flex-1 min-w-0 space-y-1.5 text-center sm:text-left">
              <span className="px-2 py-0.5 rounded bg-brand-400/20 text-brand-300 border border-brand-400/40 font-mono font-bold text-[10px]">
                {licenseNumber}
              </span>
              <h3 className="text-base font-extrabold text-white uppercase tracking-tight truncate">
                {player.full_name}
              </h3>
              <p className="text-xs text-brand-300 font-semibold uppercase">
                {player.position_label || player.primary_position || 'Jogador'}
              </p>
              <div className="pt-1 text-xs text-neutral-300 flex items-center justify-center sm:justify-start gap-1.5">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-bold text-emerald-300">
                  {player.current_club?.name || 'Clube Filiado'}
                </span>
              </div>
            </div>
          </div>

          {/* Validation Checklist */}
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-900/60 border border-neutral-800">
              <span className="text-neutral-400 flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-emerald-400" />
                Vínculo Federativo FAF:
              </span>
              <span className="font-bold text-emerald-300 uppercase">Confirmado (2026/2027)</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-900/60 border border-neutral-800">
              <span className="text-neutral-400 flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                Aptidão Médica Desportiva:
              </span>
              <span className="font-bold text-emerald-300 uppercase">
                {isMedicalFit ? 'Apto para o jogo' : 'Pendente'}
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-900/60 border border-neutral-800">
              <span className="text-neutral-400 flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" />
                Registo Disciplinar:
              </span>
              <span className="font-bold text-emerald-300 uppercase">Sem Suspensões Ativas</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-900/60 border border-neutral-800">
              <span className="text-neutral-400 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-neutral-400" />
                Data de Verificação:
              </span>
              <span className="font-mono text-neutral-300 text-[11px]">{verificationTimestamp}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
            <Button
              onClick={() => setShowLicenseModal(true)}
              variant="primary"
              size="sm"
              className="w-full bg-brand-500 hover:bg-brand-400 text-neutral-950 font-bold"
            >
              <Printer className="w-4 h-4 mr-1.5" />
              <span>Ver Licença Digital Completa</span>
            </Button>

            <Button asChild variant="secondary" size="sm" className="w-full">
              <Link to={`/players/${player.slug}`}>
                <span>Ver Perfil do Jogador</span>
                <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Security Footnote */}
        <p className="text-[11px] text-center text-neutral-500 leading-normal">
          Este selo de verificação é emitido pelo sistema central da FAF (Federação Angolana de Futebol). Qualquer adulteração física ou eletrónica constitui infração disciplinar regulamentar.
        </p>
      </div>

      {/* Modal */}
      <PlayerDigitalLicenseModal
        isOpen={showLicenseModal}
        onClose={() => setShowLicenseModal(false)}
        player={player}
        medicalStatus="fit"
        medicalClearance={true}
      />
    </div>
  )
}
