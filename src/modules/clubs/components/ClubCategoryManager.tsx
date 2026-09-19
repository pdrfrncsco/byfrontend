import React, { useState } from 'react'
import { Plus, Edit2, Trash2, ShieldCheck, Tag, Users, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  useClubCategories,
  useCreateClubCategory,
  useUpdateClubCategory,
  useDeleteClubCategory,
} from '@/modules/players/hooks/usePlayerCategories'
import { PlayerCategoryBadge } from '@/modules/players/components/PlayerCategoryBadge'
import type { PlayerCategory, CreateCategoryDto } from '@/modules/players/types/player-category.types'

interface ClubCategoryManagerProps {
  clubIdOrSlug?: string
}

export const ClubCategoryManager: React.FC<ClubCategoryManagerProps> = ({
  clubIdOrSlug = 'me',
}) => {
  const { data: categories = [], isLoading } = useClubCategories(clubIdOrSlug)
  const createMutation = useCreateClubCategory(clubIdOrSlug)
  const updateMutation = useUpdateClubCategory(clubIdOrSlug)
  const deleteMutation = useDeleteClubCategory(clubIdOrSlug)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<PlayerCategory | null>(null)

  // Form states
  const [formName, setFormName] = useState('')
  const [formMinAge, setFormMinAge] = useState<string>('')
  const [formMaxAge, setFormMaxAge] = useState<string>('')
  const [formGender, setFormGender] = useState<'male' | 'female' | 'mixed'>('mixed')
  const [formError, setFormError] = useState('')

  const openCreateModal = () => {
    setEditingCategory(null)
    setFormName('')
    setFormMinAge('')
    setFormMaxAge('')
    setFormGender('mixed')
    setFormError('')
    setIsModalOpen(true)
  }

  const openEditModal = (cat: PlayerCategory) => {
    setEditingCategory(cat)
    setFormName(cat.name)
    setFormMinAge(cat.min_age !== null && cat.min_age !== undefined ? String(cat.min_age) : '')
    setFormMaxAge(cat.max_age !== null && cat.max_age !== undefined ? String(cat.max_age) : '')
    setFormGender(cat.gender)
    setFormError('')
    setIsModalOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')

    if (!formName.trim()) {
      setFormError('O nome do escalão é obrigatório.')
      return
    }

    const min = formMinAge.trim() ? Number(formMinAge) : null
    const max = formMaxAge.trim() ? Number(formMaxAge) : null

    if (min !== null && max !== null && min >= max) {
      setFormError('A idade mínima deve ser inferior à idade máxima.')
      return
    }

    const payload: CreateCategoryDto = {
      name: formName.trim(),
      min_age: min,
      max_age: max,
      gender: formGender,
    }

    try {
      if (editingCategory) {
        await updateMutation.mutateAsync({
          categoryId: editingCategory.id,
          data: payload,
        })
      } else {
        await createMutation.mutateAsync(payload)
      }
      setIsModalOpen(false)
    } catch {
      // Error handled by mutation onError
    }
  }

  const handleDelete = async (cat: PlayerCategory) => {
    if (confirm(`Tem a certeza que deseja eliminar a categoria "${cat.name}"?`)) {
      await deleteMutation.mutateAsync(cat.id)
    }
  }

  const federationCategories = categories.filter((c) => !c.is_custom && c.scope !== 'club')
  const customCategories = categories.filter((c) => c.is_custom || c.scope === 'club')

  if (isLoading) {
    return (
      <div className="space-y-md">
        <Skeleton className="h-28 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    )
  }

  return (
    <div className="space-y-xl">
      {/* Top Banner / Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-md rounded-2xl border border-outline-variant/30 bg-surface p-lg shadow-xs">
        <div>
          <div className="flex items-center gap-xs">
            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-[11px]">
              <Tag className="mr-1 h-3 w-3" />
              Gestão de Escalões
            </Badge>
          </div>
          <h2 className="mt-1 text-xl font-bold text-on-surface">Escalões & Categorias do Clube</h2>
          <p className="text-xs text-on-surface-variant">
            Categorias oficiais da federação herdadas automaticamente e escalões internos personalizados.
          </p>
        </div>

        <Button onClick={openCreateModal} variant="primary" size="sm" className="shrink-0">
          <Plus className="mr-xs h-4 w-4" />
          <span>Nova Categoria Personalizada</span>
        </Button>
      </div>

      {/* Official Federation Categories */}
      <div className="space-y-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-xs">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-bold text-on-surface uppercase tracking-wider">
              Categorias Oficiais da Federação ({federationCategories.length})
            </h3>
          </div>
          <span className="text-[11px] text-on-surface-variant">Definidas pelo regulamento oficial</span>
        </div>

        <div className="grid gap-sm sm:grid-cols-2 lg:grid-cols-3">
          {federationCategories.map((cat) => (
            <Card
              key={cat.id}
              variant="flat"
              padding="none"
              className="border border-outline-variant/30 bg-surface shadow-2xs hover:border-primary/30 transition-all"
            >
              <CardContent className="p-md flex items-center justify-between">
                <div>
                  <PlayerCategoryBadge category={cat} size="md" />
                  <p className="mt-1 text-xs text-on-surface-variant font-medium">
                    {cat.min_age && cat.max_age
                      ? `${cat.min_age} a ${cat.max_age} anos`
                      : cat.min_age
                      ? `A partir de ${cat.min_age} anos`
                      : 'Sem limite'}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-xs font-semibold text-on-surface-variant">
                  <Users className="h-3.5 w-3.5 opacity-70" />
                  <span>{cat.players_count ?? 0}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Custom Club Categories */}
      <div className="space-y-md pt-md border-t border-outline-variant/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-xs">
            <Tag className="h-4 w-4 text-secondary" />
            <h3 className="text-sm font-bold text-on-surface uppercase tracking-wider">
              Escalões Internos do Clube ({customCategories.length})
            </h3>
          </div>
          <span className="text-[11px] text-on-surface-variant">Categorias criadas pela comissão técnica</span>
        </div>

        {customCategories.length === 0 ? (
          <Card variant="flat" padding="lg" className="border-dashed border-outline-variant/40 bg-surface-container-low text-center py-xl">
            <Tag className="mx-auto h-8 w-8 text-on-surface-variant/40 mb-xs" />
            <p className="text-sm font-bold text-on-surface">Nenhum escalão personalizado</p>
            <p className="text-xs text-on-surface-variant mt-0.5">
              O seu clube utiliza apenas as categorias oficiais da federação. Pode criar escalões como Sub-15, Sub-17 ou Equipa B.
            </p>
            <Button onClick={openCreateModal} variant="outline" size="sm" className="mt-md">
              <Plus className="mr-xs h-4 w-4" />
              <span>Criar Primeiro Escalão</span>
            </Button>
          </Card>
        ) : (
          <div className="grid gap-sm sm:grid-cols-2 lg:grid-cols-3">
            {customCategories.map((cat) => (
              <Card
                key={cat.id}
                variant="flat"
                padding="none"
                className="border border-outline-variant/30 bg-surface shadow-2xs hover:border-primary/30 transition-all"
              >
                <CardContent className="p-md flex items-center justify-between">
                  <div>
                    <PlayerCategoryBadge category={cat} size="md" />
                    <p className="mt-1 text-xs text-on-surface-variant font-medium">
                      {cat.min_age && cat.max_age
                        ? `${cat.min_age} a ${cat.max_age} anos`
                        : cat.min_age
                        ? `+${cat.min_age} anos`
                        : 'Personalizada'}
                    </p>
                  </div>
                  <div className="flex items-center gap-xs">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-on-surface-variant hover:text-primary"
                      onClick={() => openEditModal(cat)}
                      title="Editar"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-on-surface-variant hover:text-error"
                      onClick={() => handleDelete(cat)}
                      title="Eliminar"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Modal / Dialog for Create / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-md backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border border-outline-variant/40 bg-surface p-lg shadow-xl">
            <h3 className="text-lg font-bold text-on-surface">
              {editingCategory ? 'Editar Escalão do Clube' : 'Novo Escalão do Clube'}
            </h3>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Configure as idades e o género de atletas para este escalão interno.
            </p>

            <form onSubmit={handleSave} className="mt-md space-y-md">
              {formError && (
                <div className="flex items-center gap-2 rounded-xl bg-error/10 p-3 text-xs text-error font-medium">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">
                  Nome do Escalão <span className="text-error">*</span>
                </label>
                <Input
                  type="text"
                  placeholder="Ex: Sub-17 B, Juniores de 1º Ano"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  required
                  className="rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-sm">
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">
                    Idade Mínima
                  </label>
                  <Input
                    type="number"
                    min={0}
                    max={99}
                    placeholder="Ex: 15"
                    value={formMinAge}
                    onChange={(e) => setFormMinAge(e.target.value)}
                    className="rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">
                    Idade Máxima
                  </label>
                  <Input
                    type="number"
                    min={0}
                    max={99}
                    placeholder="Ex: 17"
                    value={formMaxAge}
                    onChange={(e) => setFormMaxAge(e.target.value)}
                    className="rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">
                  Género Elegível
                </label>
                <select
                  value={formGender}
                  onChange={(e) => setFormGender(e.target.value as any)}
                  className="w-full rounded-xl border border-outline-variant/30 bg-surface px-3 py-2 text-xs font-medium text-on-surface shadow-2xs"
                >
                  <option value="mixed">Misto (Todos os géneros)</option>
                  <option value="male">Masculino</option>
                  <option value="female">Feminino</option>
                </select>
              </div>

              <div className="flex justify-end gap-sm pt-md border-t border-outline-variant/20">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {createMutation.isPending || updateMutation.isPending ? 'A guardar...' : 'Guardar'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
