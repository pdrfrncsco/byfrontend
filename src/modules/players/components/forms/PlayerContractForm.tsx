import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { DollarSign, Plus, Trash2 } from 'lucide-react'
import {
  playerContractFormSchema,
  type PlayerContractFormData,
} from '../../schemas/contract.schema'
import { getContractTypeLabel } from '../../hooks/usePlayerContracts'

interface PlayerContractFormProps {
  playerId: string
  initialData?: Partial<PlayerContractFormData>
  onSubmit: (data: PlayerContractFormData) => Promise<void>
  onCancel?: () => void
  isSubmitting?: boolean
}

const CONTRACT_TYPES = [
  { value: 'professional', label: 'Profissional' },
  { value: 'youth', label: 'Juniores' },
  { value: 'amateur', label: 'Amador' },
  { value: 'short_term', label: 'Curto Prazo' },
  { value: 'trial', label: 'Período de Teste' },
  { value: 'loan', label: 'Empréstimo' },
  { value: 'extension', label: 'Renovação' },
]

const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'AOA', 'BRL']

const BONUS_TYPES = [
  { key: 'appearance', label: 'Por Presença' },
  { key: 'goal', label: 'Por Golo' },
  { key: 'assist', label: 'Por Assistência' },
  { key: 'win', label: 'Por Vitória' },
  { key: 'clean_sheet', label: 'Por Defesa Intacta' },
  { key: 'man_of_the_match', label: 'Por Melhor em Campo' },
]

export function PlayerContractForm({
  playerId,
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: PlayerContractFormProps) {
  const { t } = useTranslation()
  const [bonusFields, setBonusFields] = useState<string[]>(
    Object.keys(initialData?.bonuses || {})
  )

  const {
    control,
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setValue,
  } = useForm<PlayerContractFormData>({
    resolver: zodResolver(playerContractFormSchema),
    defaultValues: {
      club: initialData?.club || '',
      contract_type: initialData?.contract_type || 'professional',
      status: initialData?.status || 'draft',
      start_date: initialData?.start_date || '',
      end_date: initialData?.end_date || '',
      salary: initialData?.salary || undefined,
      currency: initialData?.currency || 'USD',
      bonuses: initialData?.bonuses || {},
      release_clause: initialData?.release_clause || undefined,
      has_image_rights: initialData?.has_image_rights || false,
      option_year: initialData?.option_year || false,
      termination_clause: initialData?.termination_clause || '',
    },
  })

  const bonuses = watch('bonuses')
  const currency = watch('currency')

  const handleAddBonus = (bonusType: string) => {
    if (!bonusFields.includes(bonusType)) {
      setBonusFields([...bonusFields, bonusType])
      setValue('bonuses', {
        ...bonuses,
        [bonusType]: 0,
      })
    }
  }

  const handleRemoveBonus = (bonusType: string) => {
    setBonusFields(bonusFields.filter((b) => b !== bonusType))
    const newBonuses = { ...bonuses }
    delete newBonuses[bonusType]
    setValue('bonuses', newBonuses)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-lg">
      {/* Club Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Informações Básicas</CardTitle>
          <CardDescription>Detalhes do contrato</CardDescription>
        </CardHeader>
        <CardContent className="space-y-md">
          {/* Club */}
          <div>
            <Label htmlFor="club">Clube*</Label>
            <Input
              id="club"
              placeholder="Selecionar clube"
              {...register('club')}
              className={errors.club ? 'border-error' : ''}
            />
            {errors.club && <p className="mt-1 text-xs text-error">{errors.club.message}</p>}
          </div>

          {/* Type and Status */}
          <div className="grid gap-md sm:grid-cols-2">
            <div>
              <Label htmlFor="contract_type">Tipo de Contrato*</Label>
              <select
                id="contract_type"
                {...register('contract_type')}
                className="flex h-10 w-full rounded-lg border border-outline bg-surface px-md py-sm text-sm text-on-surface placeholder:text-on-surface-variant focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                {CONTRACT_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="status">Estado*</Label>
              <select
                id="status"
                {...register('status')}
                className="flex h-10 w-full rounded-lg border border-outline bg-surface px-md py-sm text-sm text-on-surface placeholder:text-on-surface-variant focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <option value="draft">Rascunho</option>
                <option value="active">Ativo</option>
                <option value="expired">Expirado</option>
                <option value="terminated">Terminado</option>
                <option value="suspended">Suspenso</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dates */}
      <Card>
        <CardHeader>
          <CardTitle>Período do Contrato</CardTitle>
        </CardHeader>
        <CardContent className="space-y-md">
          <div className="grid gap-md sm:grid-cols-2">
            <div>
              <Label htmlFor="start_date">Data de Início*</Label>
              <Input
                id="start_date"
                type="date"
                {...register('start_date')}
                className={errors.start_date ? 'border-error' : ''}
              />
              {errors.start_date && (
                <p className="mt-1 text-xs text-error">{errors.start_date.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="end_date">Data de Fim*</Label>
              <Input
                id="end_date"
                type="date"
                {...register('end_date')}
                className={errors.end_date ? 'border-error' : ''}
              />
              {errors.end_date && <p className="mt-1 text-xs text-error">{errors.end_date.message}</p>}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financial Terms */}
      <Card>
        <CardHeader>
          <CardTitle>Termos Financeiros</CardTitle>
          <CardDescription>Salário, bónus e cláusulas monetárias</CardDescription>
        </CardHeader>
        <CardContent className="space-y-md">
          {/* Salary */}
          <div className="grid gap-md sm:grid-cols-2">
            <div>
              <Label htmlFor="salary">Salário Anual</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
                <Input
                  id="salary"
                  type="number"
                  placeholder="0"
                  {...register('salary', { valueAsNumber: true })}
                  className="pl-8"
                />
              </div>
              {errors.salary && <p className="mt-1 text-xs text-error">{errors.salary.message}</p>}
            </div>

            <div>
              <Label htmlFor="currency">Moeda</Label>
              <select
                id="currency"
                {...register('currency')}
                className="flex h-10 w-full rounded-lg border border-outline bg-surface px-md py-sm text-sm text-on-surface placeholder:text-on-surface-variant focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                {CURRENCIES.map((curr) => (
                  <option key={curr} value={curr}>
                    {curr}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Release Clause */}
          <div>
            <Label htmlFor="release_clause">Cláusula de Rescisão</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
              <Input
                id="release_clause"
                type="number"
                placeholder="0"
                {...register('release_clause', { valueAsNumber: true })}
                className="pl-8"
              />
            </div>
            {errors.release_clause && (
              <p className="mt-1 text-xs text-error">{errors.release_clause.message}</p>
            )}
          </div>

          {/* Bonuses */}
          <div className="space-y-md border-t border-outline pt-md">
            <div className="flex items-center justify-between">
              <Label>Bónus de Desempenho</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const availableBonus = BONUS_TYPES.find((b) => !bonusFields.includes(b.key))
                  if (availableBonus) {
                    handleAddBonus(availableBonus.key)
                  }
                }}
                disabled={bonusFields.length >= BONUS_TYPES.length}
              >
                <Plus className="h-4 w-4" />
                Adicionar
              </Button>
            </div>

            {bonusFields.length > 0 ? (
              <div className="space-y-sm">
                {bonusFields.map((bonusKey) => {
                  const bonusType = BONUS_TYPES.find((b) => b.key === bonusKey)
                  if (!bonusType) return null

                  return (
                    <div key={bonusKey} className="flex gap-sm items-end">
                      <div className="flex-1">
                        <Label className="text-xs">{bonusType.label}</Label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
                          <Input
                            type="number"
                            placeholder="0"
                            {...register(`bonuses.${bonusKey}`, { valueAsNumber: true })}
                            className="pl-8"
                          />
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveBonus(bonusKey)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-xs text-on-surface-variant">Sem bónus adicionados</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Clauses */}
      <Card>
        <CardHeader>
          <CardTitle>Cláusulas Especiais</CardTitle>
        </CardHeader>
        <CardContent className="space-y-md">
          <label className="flex items-center gap-md cursor-pointer">
            <input
              type="checkbox"
              {...register('has_image_rights')}
              className="h-4 w-4 rounded border-outline text-primary"
            />
            <span className="text-sm text-on-surface">Direitos de Imagem Inclusos</span>
          </label>

          <label className="flex items-center gap-md cursor-pointer">
            <input
              type="checkbox"
              {...register('option_year')}
              className="h-4 w-4 rounded border-outline text-primary"
            />
            <span className="text-sm text-on-surface">Opção de Renovação</span>
          </label>

          <div>
            <Label htmlFor="termination_clause">Cláusula de Rescisão (Texto)</Label>
            <Textarea
              id="termination_clause"
              placeholder="Descrever termos de rescisão..."
              {...register('termination_clause')}
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-md justify-end">
        <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Guardando...' : 'Guardar Contrato'}
        </Button>
      </div>
    </form>
  )
}
