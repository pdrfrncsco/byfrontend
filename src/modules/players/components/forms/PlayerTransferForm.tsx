import { useCallback, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import {
  Form,
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  FormField,
} from '@/components/ui'
import { AlertCircle, Loader2, Search, X } from 'lucide-react'
import { getStoredAuthToken } from '@/lib/storage'
import { transferRequestSchema, type TransferRequest } from '../../schemas/transfer.schema'
import { getTransferTypeLabel } from '../../hooks/usePlayerTransfers'

interface PlayerTransferFormProps {
  playerId: string
  onSubmit: (data: TransferRequest) => Promise<void>
  isLoading?: boolean
  defaultValues?: Partial<TransferRequest>
  onCancel?: () => void
}

interface Club {
  id: string
  name: string
  slug: string
  country?: string
  league?: string
}

export function PlayerTransferForm({
  playerId,
  onSubmit,
  isLoading = false,
  defaultValues,
  onCancel,
}: PlayerTransferFormProps) {
  const { t } = useTranslation()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedClub, setSelectedClub] = useState<Club | null>(null)
  const [showClubSearch, setShowClubSearch] = useState(false)

  const form = useForm<TransferRequest>({
    resolver: zodResolver(transferRequestSchema),
    defaultValues: {
      transfer_type: 'permanent',
      currency: 'EUR',
      ...defaultValues,
    },
  })

  // Fetch clubs for search
  const { data: clubsData, isFetching: searchingClubs } = useQuery({
    queryKey: ['clubs-search', searchQuery],
    queryFn: async () => {
      if (!searchQuery || searchQuery.length < 2) return []

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'
      const response = await fetch(
        `${apiUrl}/clubs/?search=${encodeURIComponent(searchQuery)}&limit=10`,
        {
          headers: {
            Authorization: `Bearer ${getStoredAuthToken() || ''}`,
          },
        }
      )

      if (!response.ok) return []
      const result = await response.json()
      return result.results || []
    },
    enabled: showClubSearch && searchQuery.length >= 2,
    staleTime: 1000 * 60 * 5,
  })

  const clubs = useMemo(() => (clubsData || []) as Club[], [clubsData])

  // Watch transfer type to show/hide loan duration
  const transferType = form.watch('transfer_type')
  const showLoanDuration = transferType === 'loan'

  const handleClubSelect = useCallback(
    (club: Club) => {
      setSelectedClub(club)
      form.setValue('to_club', club.id)
      setShowClubSearch(false)
      setSearchQuery('')
    },
    [form]
  )

  const handleFormSubmit = async (data: TransferRequest) => {
    try {
      await onSubmit(data)
      form.reset()
      setSelectedClub(null)
    } catch (error) {
      console.error('Error submitting transfer form:', error)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Solicitar Transferência</CardTitle>
        <CardDescription>
          Preencha os detalhes da transferência do jogador
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-lg">
            {/* Club Selection */}
            <div>
              <label className="text-sm font-medium text-on-surface">Clube Destino</label>

              {selectedClub ? (
                <div className="mt-md flex items-center justify-between rounded-lg border border-outline bg-surface/50 p-md">
                  <div>
                    <p className="font-semibold text-on-surface">{selectedClub.name}</p>
                    {selectedClub.country && (
                      <p className="text-xs text-on-surface-variant">{selectedClub.country}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedClub(null)
                      form.setValue('to_club', '')
                    }}
                    className="text-on-surface-variant hover:text-on-surface"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="mt-md space-y-md">
                  <div className="relative">
                    <Search className="absolute left-md top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
                    <Input
                      placeholder="Buscar clube..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={() => setShowClubSearch(true)}
                      className="pl-lg"
                    />
                  </div>

                  {showClubSearch && (
                    <div className="max-h-64 space-y-sm overflow-y-auto rounded-lg border border-outline">
                      {searchingClubs ? (
                        <div className="flex items-center justify-center py-lg">
                          <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        </div>
                      ) : clubs.length > 0 ? (
                        clubs.map((club) => (
                          <button
                            key={club.id}
                            type="button"
                            onClick={() => handleClubSelect(club)}
                            className="w-full px-md py-md text-left hover:bg-surface-variant transition-colors"
                          >
                            <p className="font-medium text-on-surface">{club.name}</p>
                            {club.country && (
                              <p className="text-xs text-on-surface-variant">{club.country}</p>
                            )}
                          </button>
                        ))
                      ) : searchQuery.length >= 2 ? (
                        <div className="px-md py-lg text-center text-sm text-on-surface-variant">
                          Nenhum clube encontrado
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>
              )}

              <FormMessage className="mt-sm">
                {form.formState.errors.to_club?.message}
              </FormMessage>
            </div>

            {/* Transfer Type */}
            <FormField
              control={form.control}
              name="transfer_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Transferência</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="permanent">
                        {getTransferTypeLabel('permanent')}
                      </SelectItem>
                      <SelectItem value="loan">{getTransferTypeLabel('loan')}</SelectItem>
                      <SelectItem value="free">{getTransferTypeLabel('free')}</SelectItem>
                      <SelectItem value="youth">{getTransferTypeLabel('youth')}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Tipo de transferência que está a solicitar
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Effective Date */}
            <FormField
              control={form.control}
              name="effective_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data Efetiva</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      value={
                        field.value
                          ? new Date(field.value).toISOString().split('T')[0]
                          : ''
                      }
                      onChange={(e) => {
                        if (e.target.value) {
                          field.onChange(new Date(e.target.value).toISOString())
                        } else {
                          field.onChange(null)
                        }
                      }}
                    />
                  </FormControl>
                  <FormDescription>Data em que a transferência entra em vigor</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Transfer Fee */}
            <div className="grid gap-md sm:grid-cols-2">
              <FormField
                control={form.control}
                name="transfer_fee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor da Transferência</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        min="0"
                        step="100"
                        value={field.value || ''}
                        onChange={(e) => {
                          const value = e.target.value ? parseFloat(e.target.value) : null
                          field.onChange(value)
                        }}
                      />
                    </FormControl>
                    <FormDescription>Deixe em branco se for uma transferência livre</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Moeda</FormLabel>
                    <Select value={field.value || 'EUR'} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="GBP">GBP (£)</SelectItem>
                        <SelectItem value="CNY">CNY (¥)</SelectItem>
                        <SelectItem value="SAR">SAR (﷼)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Loan Duration */}
            {showLoanDuration && (
              <FormField
                control={form.control}
                name="loan_duration_months"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duração do Empréstimo (meses)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="6"
                        min="1"
                        max="60"
                        value={field.value || ''}
                        onChange={(e) => {
                          const value = e.target.value ? parseInt(e.target.value, 10) : null
                          field.onChange(value)
                        }}
                      />
                    </FormControl>
                    <FormDescription>Duração máxima: 60 meses</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Observações adicionais sobre a transferência..."
                      className="resize-none"
                      rows={4}
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormDescription>Máximo 1000 caracteres</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Info Alert */}
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-md">
              <div className="flex gap-md">
                <AlertCircle className="h-5 w-5 flex-shrink-0 text-amber-700" />
                <div className="text-sm text-amber-800">
                  <p className="font-medium">Informação Importante</p>
                  <p className="mt-sm">
                    A transferência necessitará de aprovação dos clubes envolvidos antes de ser
                    finalizada. Documentos adicionais podem ser solicitados.
                  </p>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex gap-md pt-md">
              <Button
                type="submit"
                disabled={isLoading || !selectedClub}
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-md h-4 w-4 animate-spin" />
                    Solicitando...
                  </>
                ) : (
                  'Solicitar Transferência'
                )}
              </Button>
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancelar
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
