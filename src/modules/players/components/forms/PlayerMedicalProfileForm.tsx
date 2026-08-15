import { useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
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
} from '@/components/ui'
import { AlertCircle, Loader2 } from 'lucide-react'
import { medicalProfileSchema, type MedicalProfile } from '../../schemas/medical.schema'
import { getBloodTypeOptions, getMedicalStatusInfo } from '../../hooks/usePlayerMedical'

interface PlayerMedicalProfileFormProps {
  playerId: string
  defaultValues?: Partial<MedicalProfile>
  onSubmit: (data: MedicalProfile) => Promise<void>
  isLoading?: boolean
  onCancel?: () => void
  isStaffOnly?: boolean
}

export function PlayerMedicalProfileForm({
  playerId,
  defaultValues,
  onSubmit,
  isLoading = false,
  onCancel,
  isStaffOnly = true,
}: PlayerMedicalProfileFormProps) {
  const { t } = useTranslation()
  const bloodTypes = getBloodTypeOptions()

  const form = useForm<MedicalProfile>({
    resolver: zodResolver(medicalProfileSchema),
    defaultValues: {
      blood_type: 'unknown',
      medical_status: 'fit',
      medical_clearance: false,
      ...defaultValues,
    },
  })

  const medicalStatus = form.watch('medical_status')
  const statusInfo = getMedicalStatusInfo(medicalStatus)

  const handleSubmit = async (data: MedicalProfile) => {
    try {
      await onSubmit(data)
      form.reset()
    } catch (error) {
      console.error('Error submitting medical profile form:', error)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Editar Perfil Médico</CardTitle>
        <CardDescription>Atualize as informações médicas do jogador</CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-lg">
            {/* Blood Type */}
            <FormField
              control={form.control}
              name="blood_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo Sanguíneo *</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo sanguíneo..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {bloodTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>Tipo sanguíneo do jogador</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Medical Status */}
            <FormField
              control={form.control}
              name="medical_status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estado Médico *</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o estado..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="fit">Apto</SelectItem>
                      <SelectItem value="injured">Lesionado</SelectItem>
                      <SelectItem value="recovering">Em Recuperação</SelectItem>
                      <SelectItem value="suspended_medical">Suspenso (Médico)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    {statusInfo.label} — {statusInfo.icon}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Injury Status (conditional) */}
            {medicalStatus === 'injured' && (
              <FormField
                control={form.control}
                name="injury_status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição da Lesão *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Descreva detalhadamente a lesão..."
                        className="resize-none"
                        rows={4}
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormDescription>Máximo 500 caracteres</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Medical Clearance */}
            <div className="flex items-center gap-md p-md bg-surface/50 rounded-lg">
              <input
                type="checkbox"
                id="medical_clearance"
                {...form.register('medical_clearance')}
                className="h-4 w-4 rounded border-outline"
              />
              <label htmlFor="medical_clearance" className="text-sm font-medium cursor-pointer">
                Apto para Competir
              </label>
            </div>

            {/* Fitness Status */}
            <FormField
              control={form.control}
              name="fitness_status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estado Físico</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: 90% de forma física"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormDescription>Avaliação geral da condição física</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Medical Exams */}
            <div className="grid gap-md sm:grid-cols-2">
              <FormField
                control={form.control}
                name="last_medical_exam"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Último Exame Médico</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
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
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="next_medical_exam"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Próximo Exame Médico</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
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
                    <FormDescription>Deve ser no futuro</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Emergency Medical Info (Staff-only) */}
            {isStaffOnly && (
              <>
                <div className="border-t border-outline pt-lg">
                  <h3 className="text-sm font-semibold text-on-surface mb-md">
                    Informações de Emergência (🔒 Confidencial)
                  </h3>

                  <FormField
                    control={form.control}
                    name="allergies"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Alergias</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Ex: Penicilina, Amendoim..."
                            className="resize-none"
                            rows={2}
                            {...field}
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormDescription>Máximo 500 caracteres</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="current_medications"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Medicamentos Atuais</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Ex: Ibuprofen 400mg, 2x dia..."
                            className="resize-none"
                            rows={2}
                            {...field}
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormDescription>Máximo 500 caracteres</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="medical_conditions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Condições Médicas Pré-existentes</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Ex: Asma leve, Histórico de lesão no joelho..."
                            className="resize-none"
                            rows={2}
                            {...field}
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormDescription>Máximo 500 caracteres</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="medical_notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notas Médicas (Confidencial)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Observações adicionais para pessoal médico..."
                            className="resize-none"
                            rows={3}
                            {...field}
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormDescription>Máximo 1000 caracteres. Acesso restrito.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </>
            )}

            {/* Info Alert */}
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-md">
              <div className="flex gap-md">
                <AlertCircle className="h-5 w-5 flex-shrink-0 text-blue-700" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium">Dados Confidenciais</p>
                  <p className="mt-sm">
                    As informações médicas são confidenciais e acesso é restrito a pessoal autorizado.
                  </p>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex gap-md pt-md">
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-md h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  'Guardar Perfil Médico'
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
