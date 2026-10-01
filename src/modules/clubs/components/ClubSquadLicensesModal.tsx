import React, { useState } from 'react'
import {
  Printer,
  X,
  Shield,
  Users,
  CheckCircle2,
  AlertTriangle,
  QrCode,
  Tag,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { QRCodeView } from '@/modules/shared/components/QRCodeView'
import { resolveMediaUrl } from '@/lib/media'
import type { ClubMember, ClubSquadMember } from '@/modules/clubs/types'

interface ClubSquadLicensesModalProps {
  isOpen: boolean
  onClose: () => void
  clubName: string
  clubLogoUrl?: string | null
  players: (ClubMember | ClubSquadMember)[]
  categories?: Array<{ id: string; name: string; slug?: string }>
  federationName?: string
}

export const ClubSquadLicensesModal: React.FC<ClubSquadLicensesModalProps> = ({
  isOpen,
  onClose,
  clubName,
  clubLogoUrl,
  players,
  categories = [],
  federationName = 'Federação Angolana de Futebol',
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  if (!isOpen) return null

  const filteredPlayers = players.filter((player) => {
    if (selectedCategory === 'all') return true
    const catId = (player as any).category?.id || (player as any).category_id
    const catSlug = (player as any).category?.slug || (player as any).category_slug
    return catId === selectedCategory || catSlug === selectedCategory
  })

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in">
      <div className="relative w-full max-w-5xl bg-surface-card border border-brand-500/30 rounded-3xl shadow-2xl overflow-hidden my-6">
        {/* Top Controls Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-6 py-4 border-b border-neutral-800 bg-surface-cardHover/50 print:hidden">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/10 text-brand-400">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-bold text-base text-text-primary">
                Licenças Federativas do Plantel • {clubName}
              </h2>
              <p className="text-xs text-text-muted">
                {filteredPlayers.length} atletas selecionados para emissão e verificação em campo
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {categories.length > 0 && (
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="rounded-xl border border-neutral-700 bg-neutral-900 px-3 py-1.5 text-xs font-semibold text-text-primary focus:outline-hidden focus:ring-2 focus:ring-brand-400"
              >
                <option value="all">Todos os Escalões ({players.length})</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            )}

            <Button
              onClick={handlePrint}
              variant="primary"
              size="sm"
              className="gap-1.5 bg-brand-500 text-neutral-950 font-bold hover:bg-brand-400"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir Plantel (PDF)</span>
            </Button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-neutral-800 transition"
              aria-label="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Multi-Card Layout */}
        <div className="p-6 max-h-[82vh] overflow-y-auto bg-neutral-950 space-y-6 print:bg-white print:p-0 print:max-h-none print:overflow-visible">
          {/* Print Header */}
          <div className="hidden print:flex items-center justify-between border-b-2 border-neutral-900 pb-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#014d40] text-white flex items-center justify-center font-black text-sm">
                FAF
              </div>
              <div>
                <h1 className="text-sm font-black uppercase tracking-wider text-neutral-900">
                  {federationName}
                </h1>
                <p className="text-xs font-bold text-neutral-700">
                  Dossier Oficial de Licenças de Atletas • {clubName}
                </p>
              </div>
            </div>
            <div className="text-right text-[10px] font-mono text-neutral-600">
              Emitido em: {new Date().toLocaleDateString('pt-AO')} • Época 2026/2027
            </div>
          </div>

          {filteredPlayers.length === 0 ? (
            <div className="text-center py-12 text-neutral-400">
              <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Nenhum atleta encontrado no filtro selecionado.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:grid-cols-2 print:gap-3">
              {filteredPlayers.map((player) => {
                const name =
                  ('display_name' in player && player.display_name) ||
                  ('full_name' in player && player.full_name) ||
                  'Sem nome'
                const jersey = player.jersey_number ?? null
                const position = player.position_label || player.position || 'Jogador'
                const avatar = resolveMediaUrl(player.avatar)
                const licenseNumber =
                  (player as any).federation_id ||
                  (player as any).license_number ||
                  `FAF-${new Date().getFullYear()}-${player.id?.slice(0, 8).toUpperCase() || '894201'}`
                const verificationUrl = `https://bolayetu.ao/verify/player/${(player as any).slug || (player as any).player_slug || player.id}`

                return (
                  <div
                    key={player.id}
                    className="relative rounded-2xl overflow-hidden border-2 border-brand-500/40 bg-gradient-to-br from-[#012d25] via-[#014d40] to-[#03201b] text-white p-4 shadow-xl space-y-3 break-inside-avoid print:border-neutral-900 print:text-neutral-900 print:bg-white print:shadow-none"
                  >
                    {/* Card Top */}
                    <div className="flex items-center justify-between border-b border-brand-500/30 print:border-neutral-300 pb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-md bg-brand-400 text-neutral-950 flex items-center justify-center font-black text-xs print:bg-neutral-900 print:text-white">
                          FAF
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-wider text-brand-200 print:text-neutral-900">
                            Licença Federativa
                          </p>
                          <p className="text-[8px] text-brand-300/80 font-mono print:text-neutral-600">
                            {licenseNumber}
                          </p>
                        </div>
                      </div>

                      {jersey !== null && (
                        <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-brand-400/20 text-brand-200 border border-brand-400/40 print:bg-neutral-100 print:text-neutral-900 print:border-neutral-400">
                          #{jersey}
                        </span>
                      )}
                    </div>

                    {/* Card Body */}
                    <div className="flex items-center gap-3">
                      {/* Photo */}
                      <div className="w-16 h-20 shrink-0 rounded-xl overflow-hidden border border-brand-400/50 bg-neutral-900 flex items-center justify-center relative print:border-neutral-400">
                        {avatar ? (
                          <img src={avatar} alt={name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xl font-black text-brand-300 print:text-neutral-700">
                            {name.slice(0, 2).toUpperCase()}
                          </span>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0 space-y-0.5">
                        <h4 className="font-bold text-sm text-white truncate uppercase print:text-neutral-900">
                          {name}
                        </h4>
                        <p className="text-[10px] text-brand-200 font-semibold uppercase print:text-neutral-700">
                          {position}
                        </p>
                        <p className="text-[10px] text-emerald-300 font-medium truncate print:text-emerald-800">
                          {clubName}
                        </p>
                        <div className="flex items-center gap-1 text-[9px] text-brand-300/80 pt-1 print:text-neutral-600">
                          <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                          <span>Apto para o jogo oficial</span>
                        </div>
                      </div>

                      {/* QR Code */}
                      <div className="shrink-0 flex flex-col items-center justify-center p-1.5 rounded-lg bg-white/10 border border-brand-400/30 print:bg-transparent print:border-neutral-300">
                        <QRCodeView
                          value={verificationUrl}
                          size={48}
                          bgColor="#ffffff"
                          color="#014d40"
                          includeMargin={false}
                        />
                        <span className="text-[7px] font-bold text-brand-200 mt-0.5 print:text-neutral-700">
                          Validar
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
