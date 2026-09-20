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
    acronym: '',
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
    if (!formData.name) return

    try {
      await submitMutation.mutateAsync({
        slug: organizationSlug,
        data: formData,
      })
      onClose()
    } catch {
      // Error handled by hook
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-2xl border border-outline-variant/30 bg-surface-container p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-on-surface-variant hover:bg-surface-container-high transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-on-surface">Solicitar Filiação de Clube</h3>
            <p className="text-xs text-on-surface-variant">Envie os dados do seu clube para aprovação pela associação.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-on-surface-variant mb-1 uppercase tracking-wider">
              Nome Oficial do Clube *
            </label>
            <Input
              required
              placeholder="Ex.: Atlético Clube Petróleos de Luanda"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
            <span className="mt-1 block text-[11px] text-on-surface-variant">Nome legal para documentos oficiais, súmulas e certificados.</span>
          </div>

          <div className="grid grid-cols-2 gap-md">
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant mb-1 uppercase tracking-wider">
                Nome Curto
              </label>
              <Input
                placeholder="Ex.: Petro de Luanda"
                value={formData.short_name || ''}
                onChange={e => setFormData({ ...formData, short_name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant mb-1 uppercase tracking-wider">
                Sigla / Acrónimo
              </label>
              <Input
                placeholder="Ex.: APL"
                maxLength={10}
                value={formData.acronym || ''}
                onChange={e => setFormData({ ...formData, acronym: e.target.value.toUpperCase() })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-md">
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
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant mb-1 uppercase tracking-wider">
                País
              </label>
              <Input
                placeholder="Ex.: Angola"
                value={formData.country || ''}
                onChange={e => setFormData({ ...formData, country: e.target.value })}
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
