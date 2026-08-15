import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { Upload, AlertCircle } from 'lucide-react'
import { Button, Input, Label, Select, Textarea, Card, CardContent, CardDescription, CardHeader, CardTitle, Alert, AlertDescription } from '@/components/ui'
import { playerGuardianSchema, type PlayerGuardianFormData } from '../../schemas/guardian.schema'

interface PlayerGuardianFormProps {
  onSubmit: (data: PlayerGuardianFormData) => Promise<void>
  isLoading?: boolean
  isMinor: boolean
}

export function PlayerGuardianForm({ onSubmit, isLoading = false, isMinor }: PlayerGuardianFormProps) {
  const { t } = useTranslation()
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<PlayerGuardianFormData>({
    resolver: zodResolver(playerGuardianSchema),
  })

  const relationshipValue = watch('guardian_relationship')
  const fileInput = watch('guardian_id_document')

  if (!isMinor) {
    return (
      <div className="rounded-lg bg-info-container p-lg">
        <p className="text-sm text-on-surface">
          Este formulário é apenas necessário se o jogador for menor de idade.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-lg">
      <Card>
        <CardHeader>
          <CardTitle>Responsável Legal</CardTitle>
          <CardDescription>
            Como o jogador é menor de idade, deve indicar um responsável legal.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-lg">
          {/* Warning Alert */}
          <Alert variant="warning">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Os dados do responsável legal são confidenciais e apenas serão utilizados para fins legais e administrativos.
            </AlertDescription>
          </Alert>

          {/* Guardian Name */}
          <div className="space-y-sm">
            <Label htmlFor="guardian_name">
              Nome Completo do Responsável <span className="text-destructive">*</span>
            </Label>
            <Input
              id="guardian_name"
              placeholder="Ex: João Silva"
              {...register('guardian_name')}
              aria-invalid={!!errors.guardian_name}
              disabled={isSubmitting || isLoading}
            />
            {errors.guardian_name && (
              <span className="text-xs text-destructive" role="alert">
                {errors.guardian_name.message}
              </span>
            )}
          </div>

          {/* Guardian Relationship */}
          <div className="space-y-sm">
            <Label htmlFor="guardian_relationship">
              Relação com o Jogador <span className="text-destructive">*</span>
            </Label>
            <select
              id="guardian_relationship"
              {...register('guardian_relationship')}
              className="flex h-10 w-full rounded-lg border border-outline bg-surface px-md py-sm text-sm text-on-surface placeholder:text-on-surface-variant focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isSubmitting || isLoading}
              aria-invalid={!!errors.guardian_relationship}
            >
              <option value="">Selecione uma relação</option>
              <option value="parent">Progenitor/Progenitora</option>
              <option value="legal_guardian">Encarregado de Educação</option>
              <option value="other">Outro</option>
            </select>
            {errors.guardian_relationship && (
              <span className="text-xs text-destructive" role="alert">
                {errors.guardian_relationship.message}
              </span>
            )}
          </div>

          {/* Guardian Email */}
          <div className="space-y-sm">
            <Label htmlFor="guardian_email">
              Email do Responsável <span className="text-destructive">*</span>
            </Label>
            <Input
              id="guardian_email"
              type="email"
              placeholder="Ex: joao.silva@email.com"
              {...register('guardian_email')}
              aria-invalid={!!errors.guardian_email}
              disabled={isSubmitting || isLoading}
            />
            {errors.guardian_email && (
              <span className="text-xs text-destructive" role="alert">
                {errors.guardian_email.message}
              </span>
            )}
          </div>

          {/* Guardian Phone */}
          <div className="space-y-sm">
            <Label htmlFor="guardian_phone">
              Telefone do Responsável <span className="text-destructive">*</span>
            </Label>
            <Input
              id="guardian_phone"
              type="tel"
              placeholder="Ex: +244 912345678"
              {...register('guardian_phone')}
              aria-invalid={!!errors.guardian_phone}
              disabled={isSubmitting || isLoading}
            />
            {errors.guardian_phone && (
              <span className="text-xs text-destructive" role="alert">
                {errors.guardian_phone.message}
              </span>
            )}
          </div>

          {/* Guardian ID Document Upload */}
          <div className="space-y-sm">
            <Label htmlFor="guardian_id_document">
              Documento de Identidade do Responsável <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <input
                id="guardian_id_document"
                type="file"
                {...register('guardian_id_document')}
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png"
                disabled={isSubmitting || isLoading}
                aria-invalid={!!errors.guardian_id_document}
              />
              <label
                htmlFor="guardian_id_document"
                className="flex h-32 w-full cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-outline-variant bg-surface-container-low transition-colors hover:border-primary hover:bg-surface-container-high disabled:cursor-not-allowed disabled:opacity-50"
              >
                <div className="text-center">
                  <Upload className="mx-auto h-6 w-6 text-on-surface-variant" />
                  <p className="mt-sm text-sm font-medium text-on-surface-variant">
                    {fileInput ? 'Ficheiro selecionado' : 'Clique para carregar'}
                  </p>
                  <p className="text-xs text-on-surface-variant/70">PDF, JPG ou PNG (Máx. 5MB)</p>
                </div>
              </label>
            </div>
            {errors.guardian_id_document && (
              <span className="text-xs text-destructive" role="alert">
                {errors.guardian_id_document.message}
              </span>
            )}
          </div>

          {/* Guardian Consent Checkbox */}
          <div className="space-y-sm">
            <div className="flex items-start gap-md">
              <input
                id="guardian_consent"
                type="checkbox"
                {...register('guardian_consent')}
                className="mt-sm h-4 w-4 rounded border-outline text-primary focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isSubmitting || isLoading}
                aria-invalid={!!errors.guardian_consent}
              />
              <label htmlFor="guardian_consent" className="text-sm text-on-surface">
                Confirmo que sou o responsável legal e autorizo o registo deste menor na plataforma Bolayetu.
                <span className="ml-xs text-destructive">*</span>
              </label>
            </div>
            {errors.guardian_consent && (
              <span className="text-xs text-destructive" role="alert">
                {errors.guardian_consent.message}
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="w-full"
        disabled={isSubmitting || isLoading}
      >
        {isSubmitting || isLoading ? 'A guardar...' : 'Guardar Responsável'}
      </Button>
    </form>
  )
}
