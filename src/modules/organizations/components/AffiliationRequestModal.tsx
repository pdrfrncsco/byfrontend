import React, { useState } from 'react'
import { X, Building2 } from 'lucide-react'
import { Button, Input, Textarea } from '@/components/ui'
import { useSubmitClubRequest } from '../hooks'
import type { ClubAffiliationCreateData } from '../types'

interface AffiliationRequestModalProps {
  organizationSlug: string
  organizationName: string
  isOpen: boolean
  onClose: () => void
}

export function AffiliationRequestModal({
  organizationSlug,
  organizationName,
  isOpen,
  onClose,
}: AffiliationRequestModalProps) {
  const submitMutation = useSubmitClubRequest()

  const [formData, setFormData] = useState<ClubAffiliationCreateData>({
    name: '',
    short_name: '',
    city: '',
    country: 'Angola',
    email: '',
    phone: '',
    stadium_name: '',
    description: '',
  })

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) return

    submitMutation.mutate(
      {
        slug: organizationSlug,
        data: formData,
      },
      {
        onSuccess: () => {
          onClose()
        },
      }
    )
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="affiliation-modal-title"
    >
      <div className="relative w-full max-w-lg rounded-2xl border border-outline-variant/30 bg-surface p-lg shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-outline-variant/20 pb-md">
          <div className="flex items-center gap-sm">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h2 id="affiliation-modal-title" className="font-display text-base font-bold text-on-surface">
                Solicitar Filiação
              </h2>
              <p className="text-xs text-on-surface-variant">
                Ao {organizationName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={submitMutation.isPending}
            className="rounded-lg p-1.5 text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors cursor-pointer"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-md space-y-md">
          <div>
            <label className="block text-xs font-semibold text-on-surface-variant mb-1 uppercase tracking-wider">
              Nome do Clube *
            </label>
            <Input
              required
              placeholder="Ex.: Atlético Sport Aviação"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-md">
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant mb-1 uppercase tracking-wider">
                Sigla / Nome Curto
              </label>
              <Input
                placeholder="Ex.: ASA"
                value={formData.short_name || ''}
                onChange={e => setFormData({ ...formData, short_name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant mb-1 uppercase tracking-wider">
                Cidade
              </label>
              <Input
                placeholder="Ex.: Luanda"
                value={formData.city || ''}
                onChange={e => setFormData({ ...formData, city: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-md">
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant mb-1 uppercase tracking-wider">
                Email Oficial
              </label>
              <Input
                type="email"
                placeholder="clube@dominio.ao"
                value={formData.email || ''}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant mb-1 uppercase tracking-wider">
                Telefone
              </label>
              <Input
                placeholder="+244 9..."
                value={formData.phone || ''}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-on-surface-variant mb-1 uppercase tracking-wider">
              Estádio / Campo Principal
            </label>
            <Input
              placeholder="Ex.: Estádio dos Coqueiros"
              value={formData.stadium_name || ''}
              onChange={e => setFormData({ ...formData, stadium_name: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-on-surface-variant mb-1 uppercase tracking-wider">
              Apresentação / Mensagem Adicional
            </label>
            <Textarea
              rows={3}
              placeholder="Descreva brevemente a história ou motivação para a filiação..."
              value={formData.description || ''}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="flex items-center justify-end gap-sm pt-sm border-t border-outline-variant/20">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={submitMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={submitMutation.isPending}
              disabled={!formData.name.trim()}
            >
              Enviar Pedido
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
