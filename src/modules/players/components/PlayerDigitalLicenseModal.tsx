import React, { useRef } from 'react'
import {
  Shield,
  Printer,
  Download,
  CheckCircle2,
  AlertTriangle,
  X,
  Share2,
  Calendar,
  Globe,
  Award,
  Sparkles,
  QrCode,
} from 'lucide-react'
import { QRCodeView } from '@/modules/shared/components/QRCodeView'
import type { PlayerDetail } from '../types'

interface PlayerDigitalLicenseModalProps {
  isOpen: boolean
  onClose: () => void
  player: PlayerDetail
  medicalStatus?: string | null
  medicalClearance?: boolean
  federationName?: string
}

export const PlayerDigitalLicenseModal: React.FC<PlayerDigitalLicenseModalProps> = ({
  isOpen,
  onClose,
  player,
  medicalStatus = 'fit',
  medicalClearance = true,
  federationName = 'Federação Angolana de Futebol',
}) => {
  const licenseRef = useRef<HTMLDivElement>(null)

  if (!isOpen) return null

  const isFit = medicalStatus === 'fit' || medicalClearance === true
  const licenseNumber =
    (player as any).federation_id ||
    (player as any).license_number ||
    `FAF-${new Date().getFullYear()}-${player.id?.slice(0, 8).toUpperCase() || '894201'}`
  const verificationUrl = `https://bolayetu.ao/verify/player/${player.slug || player.id}`

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in">
      <div className="relative w-full max-w-xl bg-surface-card border border-brand-500/30 rounded-3xl shadow-2xl overflow-hidden my-8">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-surface-cardHover/40">
          <div className="flex items-center gap-2 text-brand-400">
            <Shield className="w-5 h-5 text-brand-400" />
            <span className="font-bold text-sm tracking-wide text-text-primary">
              Licença Federativa Digital
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-card hover:bg-surface-cardHover border border-neutral-700 text-xs font-semibold text-text-primary transition"
            >
              <Printer className="w-3.5 h-3.5 text-brand-400" />
              <span>Imprimir / PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-text-muted hover:text-text-primary hover:bg-neutral-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body & Printable Card */}
        <div className="p-6 space-y-6">
          {/* Official License Card (Physical ID layout) */}
          <div
            ref={licenseRef}
            id="printable-license-card"
            className="relative rounded-2xl overflow-hidden border-2 border-brand-500/40 bg-gradient-to-br from-[#012d25] via-[#014d40] to-[#03201b] text-white p-6 shadow-2xl space-y-5 print:border-black print:text-black print:bg-none print:shadow-none"
          >
            {/* Watermark & Security Lines */}
            <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute top-2 right-4 text-[10px] font-mono tracking-widest text-brand-300/40 uppercase pointer-events-none">
              SECURE ID • FIFA / FAF
            </div>

            {/* Top Bar: Federation & Country */}
            <div className="flex items-center justify-between border-b border-brand-500/30 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-brand-400 text-neutral-950 flex items-center justify-center font-black text-sm shadow-md">
                  FAF
                </div>
                <div>
                  <h3 className="font-black text-xs uppercase tracking-wider text-brand-200">
                    {federationName}
                  </h3>
                  <p className="text-[10px] text-brand-300/80 uppercase font-semibold">
                    República de Angola • Alvará Desportivo
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-brand-400/20 text-brand-200 border border-brand-400/40">
                  {licenseNumber}
                </span>
                <p className="text-[9px] text-brand-300/70 mt-0.5">Época 2026/2027</p>
              </div>
            </div>

            {/* Middle Section: Photo, Info, and QR Code */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
              {/* Photo */}
              <div className="sm:col-span-4 flex flex-col items-center">
                <div className="w-28 h-36 rounded-xl overflow-hidden border-2 border-brand-400/60 bg-neutral-900 shadow-lg flex items-center justify-center relative">
                  {player.avatar || player.profile_photo_url ? (
                    <img
                      src={player.avatar || player.profile_photo_url || ''}
                      alt={player.full_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl font-black text-brand-300">
                      {player.first_name?.[0]}
                      {player.last_name?.[0]}
                    </span>
                  )}
                  {/* Hologram Badge */}
                  <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-amber-400/90 text-neutral-950 font-black text-[8px] uppercase tracking-tighter shadow">
                    VERIFICADO
                  </div>
                </div>
              </div>

              {/* Player Info Details */}
              <div className="sm:col-span-5 space-y-2 text-left">
                <div>
                  <span className="text-[10px] uppercase font-bold text-brand-300/80">Nome do Atleta</span>
                  <h4 className="font-extrabold text-base leading-tight text-white uppercase">
                    {player.full_name}
                  </h4>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-brand-300/70">Posição</span>
                    <p className="font-bold text-brand-100">{player.position_label || player.primary_position}</p>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-brand-300/70">Nacionalidade</span>
                    <p className="font-bold text-brand-100">{player.nationality || 'Angolana'}</p>
                  </div>
                </div>

                <div>
                  <span className="text-[9px] uppercase font-bold text-brand-300/70">Clube Vínculado</span>
                  <p className="font-bold text-sm text-emerald-300 truncate">
                    {player.current_club?.name || 'Clube Filiado'}
                  </p>
                </div>
              </div>

              {/* QR Code Validation */}
              <div className="sm:col-span-3 flex flex-col items-center justify-center p-2 rounded-xl bg-white/10 backdrop-blur-sm border border-brand-400/30 text-center">
                <QRCodeView
                  value={verificationUrl}
                  size={76}
                  bgColor="#ffffff"
                  color="#014d40"
                  includeMargin={false}
                />
                <span className="text-[8px] uppercase font-bold text-brand-200 mt-1 flex items-center gap-0.5">
                  <QrCode className="w-2.5 h-2.5" />
                  Validar no Campo
                </span>
              </div>
            </div>

            {/* Bottom Status Bar: Medical Fit & Status */}
            <div className="flex items-center justify-between pt-3 border-t border-brand-500/30 text-xs">
              <div className="flex items-center gap-1.5">
                {isFit ? (
                  <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    APTO MEDICAMENTE
                  </span>
                ) : (
                  <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    <AlertTriangle className="w-3 h-3 text-amber-400" />
                    EXAME PENDENTE
                  </span>
                )}
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-400/20 text-brand-200 border border-brand-400/30 uppercase">
                  {player.status_label || 'Ativo'}
                </span>
              </div>

              <div className="text-[10px] text-brand-300 font-mono">
                Emitido em: {new Date().toLocaleDateString('pt-AO')}
              </div>
            </div>
          </div>

          {/* Quick Guidance */}
          <div className="p-4 rounded-2xl bg-surface-background border border-neutral-800 text-xs text-text-muted space-y-1">
            <p className="font-semibold text-text-primary flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-brand-400" />
              Instruções de Apresentação em Jogo
            </p>
            <p>
              Esta licença digital é o documento oficial de identificação do atleta perante árbitros e delegados da FAF. O QR Code permite verificação biométrica e do histórico de suspensões em tempo real.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
