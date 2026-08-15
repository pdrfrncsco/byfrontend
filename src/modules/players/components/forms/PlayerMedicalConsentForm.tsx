import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { AlertCircle, Heart } from 'lucide-react'
import { Button, Input, Label, Select, Textarea, Card, CardContent, CardDescription, CardHeader, CardTitle, Alert, AlertDescription } from '@/components/ui'
import { playerMedicalConsentSchema, type PlayerMedicalConsentFormData } from '../../schemas/guardian.schema'

interface PlayerMedicalConsentFormProps {
  onSubmit: (data: PlayerMedicalConsentFormData) => Promise<void>
  isLoading?: boolean
  initialData?: Partial<PlayerMedicalConsentFormData>
}

export function PlayerMedicalConsentForm({ onSubmit, isLoading = false, initialData }: PlayerMedicalConsentFormProps) {
  const { t } = useTranslation()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PlayerMedicalConsentFormData>({
    resolver: zodResolver(playerMedicalConsentSchema),
    defaultValues: initialData,
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-lg">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-md">
            <Heart className="h-5 w-5 text-destructive" />
            Informações Médicas
          </CardTitle>
          <CardDescription>
            Forneça informações médicas para garantir o seu bem-estar e segurança durante atividades desportivas.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-lg">
          {/* Medical Alert */}
          <Alert variant="info">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              As informações médicas fornecidas são confidenciais e apenas serão acedidas pela equipa médica autorizada.
            </AlertDescription>
          </Alert>

          {/* Blood Type */}
          <div className="space-y-sm">
            <Label htmlFor="blood_type">
              Tipo de Sangue <span className="text-destructive">*</span>
            </Label>
            <select
              id="blood_type"
              {...register('blood_type')}
              className="flex h-10 w-full rounded-lg border border-outline bg-surface px-md py-sm text-sm text-on-surface placeholder:text-on-surface-variant focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isSubmitting || isLoading}
              aria-invalid={!!errors.blood_type}
            >
              <option value="">Selecione o seu tipo de sangue</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
            </select>
            {errors.blood_type && (
              <span className="text-xs text-destructive" role="alert">
                {errors.blood_type.message}
              </span>
            )}
          </div>

          {/* Allergies */}
          <div className="space-y-sm">
            <Label htmlFor="allergies">
              Alergias Conhecidas
            </Label>
            <Textarea
              id="allergies"
              placeholder="Ex: Penicilina, Amendoim, Latex"
              {...register('allergies')}
              disabled={isSubmitting || isLoading}
              rows={3}
            />
            {errors.allergies && (
              <span className="text-xs text-destructive" role="alert">
                {errors.allergies.message}
              </span>
            )}
          </div>

          {/* Medical Conditions */}
          <div className="space-y-sm">
            <Label htmlFor="medical_conditions">
              Condições Médicas Crónicas
            </Label>
            <Textarea
              id="medical_conditions"
              placeholder="Ex: Asma, Diabetes, Hipertensão"
              {...register('medical_conditions')}
              disabled={isSubmitting || isLoading}
              rows={3}
            />
            {errors.medical_conditions && (
              <span className="text-xs text-destructive" role="alert">
                {errors.medical_conditions.message}
              </span>
            )}
          </div>

          {/* Current Medication */}
          <div className="space-y-sm">
            <Label htmlFor="medication">
              Medicação Atual
            </Label>
            <Textarea
              id="medication"
              placeholder="Ex: Nome do fármaco, dosagem, frequência"
              {...register('medication')}
              disabled={isSubmitting || isLoading}
              rows={3}
            />
            {errors.medication && (
              <span className="text-xs text-destructive" role="alert">
                {errors.medication.message}
              </span>
            )}
          </div>

          {/* Divider */}
          <div className="my-lg border-t border-outline-variant" />

          {/* Emergency Contact Section */}
          <div className="space-y-md">
            <h3 className="text-sm font-semibold text-on-surface">Contacto de Emergência</h3>

            {/* Emergency Contact Name */}
            <div className="space-y-sm">
              <Label htmlFor="emergency_contact_name">
                Nome do Contacto de Emergência <span className="text-destructive">*</span>
              </Label>
              <Input
                id="emergency_contact_name"
                placeholder="Ex: Maria Silva"
                {...register('emergency_contact_name')}
                aria-invalid={!!errors.emergency_contact_name}
                disabled={isSubmitting || isLoading}
              />
              {errors.emergency_contact_name && (
                <span className="text-xs text-destructive" role="alert">
                  {errors.emergency_contact_name.message}
                </span>
              )}
            </div>

            {/* Emergency Contact Phone */}
            <div className="space-y-sm">
              <Label htmlFor="emergency_contact_phone">
                Telefone <span className="text-destructive">*</span>
              </Label>
              <Input
                id="emergency_contact_phone"
                type="tel"
                placeholder="Ex: +244 912345678"
                {...register('emergency_contact_phone')}
                aria-invalid={!!errors.emergency_contact_phone}
                disabled={isSubmitting || isLoading}
              />
              {errors.emergency_contact_phone && (
                <span className="text-xs text-destructive" role="alert">
                  {errors.emergency_contact_phone.message}
                </span>
              )}
            </div>

            {/* Emergency Contact Relationship */}
            <div className="space-y-sm">
              <Label htmlFor="emergency_contact_relationship">
                Relação com o Contacto <span className="text-destructive">*</span>
              </Label>
              <Input
                id="emergency_contact_relationship"
                placeholder="Ex: Mãe, Irmão, Tio"
                {...register('emergency_contact_relationship')}
                aria-invalid={!!errors.emergency_contact_relationship}
                disabled={isSubmitting || isLoading}
              />
              {errors.emergency_contact_relationship && (
                <span className="text-xs text-destructive" role="alert">
                  {errors.emergency_contact_relationship.message}
                </span>
              )}
            </div>
          </div>

          {/* Medical Consent Checkbox */}
          <div className="space-y-sm">
            <div className="flex items-start gap-md">
              <input
                id="medical_consent"
                type="checkbox"
                {...register('medical_consent')}
                className="mt-sm h-4 w-4 rounded border-outline text-primary focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isSubmitting || isLoading}
                aria-invalid={!!errors.medical_consent}
              />
              <label htmlFor="medical_consent" className="text-sm text-on-surface">
                Confirmo que as informações médicas fornecidas são precisas e autorizo a equipa médica a aceder a estes dados para garantir a minha segurança.
                <span className="ml-xs text-destructive">*</span>
              </label>
            </div>
            {errors.medical_consent && (
              <span className="text-xs text-destructive" role="alert">
                {errors.medical_consent.message}
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
        {isSubmitting || isLoading ? 'A guardar...' : 'Guardar Informações Médicas'}
      </Button>
    </form>
  )
}
