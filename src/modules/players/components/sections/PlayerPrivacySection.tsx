import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { Lock, Globe, Eye, EyeOff, Shield, Download, AlertCircle } from 'lucide-react'
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Alert, AlertDescription, Badge } from '@/components/ui'
import { playerPrivacySchema, type PlayerPrivacyFormData } from '../../schemas/guardian.schema'

interface PlayerPrivacySectionProps {
  onSubmit: (data: PlayerPrivacyFormData) => Promise<void>
  isLoading?: boolean
  initialData?: PlayerPrivacyFormData
}

export function PlayerPrivacySection({ onSubmit, isLoading = false, initialData }: PlayerPrivacySectionProps) {
  const { t } = useTranslation()
  const [isSaving, setIsSaving] = useState(false)
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isDirty },
  } = useForm<PlayerPrivacyFormData>({
    resolver: zodResolver(playerPrivacySchema),
    defaultValues: initialData,
  })

  const profileVisibility = watch('profile_visibility')
  const showContactInfo = watch('show_contact_info')
  const showMedicalData = watch('show_medical_data')
  const showContractData = watch('show_contract_data')

  const handleFormSubmit = async (data: PlayerPrivacyFormData) => {
    setIsSaving(true)
    try {
      await onSubmit(data)
    } finally {
      setIsSaving(false)
    }
  }

  const getVisibilityDescription = (visibility: string) => {
    switch (visibility) {
      case 'public':
        return 'Seu perfil é visível para todos, incluindo público geral.'
      case 'clubs_only':
        return 'Seu perfil é visível apenas para clubes registados na plataforma.'
      case 'private':
        return 'Seu perfil é privado. Apenas você e a equipa de administração podem ver.'
      default:
        return ''
    }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-lg">
      {/* Profile Visibility Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-md">
            <Globe className="h-5 w-5" />
            Visibilidade do Perfil
          </CardTitle>
          <CardDescription>
            Controle quem pode ver seu perfil na plataforma Bolayetu.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-lg">
          {/* Visibility Options */}
          <div className="space-y-md">
            {['public', 'clubs_only', 'private'].map((option) => (
              <label
                key={option}
                className="flex cursor-pointer items-center gap-md rounded-lg border border-outline p-md hover:bg-surface-container-high"
              >
                <input
                  type="radio"
                  {...register('profile_visibility')}
                  value={option}
                  className="h-4 w-4 text-primary"
                />
                <div className="flex-1">
                  <p className="font-medium text-on-surface">
                    {option === 'public' && '🌍 Público'}
                    {option === 'clubs_only' && '🏆 Apenas Clubes'}
                    {option === 'private' && '🔒 Privado'}
                  </p>
                  <p className="text-sm text-on-surface-variant">{getVisibilityDescription(option)}</p>
                </div>
              </label>
            ))}
          </div>

          {/* Visibility Preview */}
          <div className="rounded-lg bg-surface-container-low p-md">
            <p className="text-sm font-medium text-on-surface">
              Visibilidade Atual: <Badge variant="secondary">{profileVisibility?.toUpperCase()}</Badge>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Data Sharing Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-md">
            <Shield className="h-5 w-5" />
            Partilha de Dados
          </CardTitle>
          <CardDescription>
            Escolha quais informações podem ser partilhadas com terceiros autorizados.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-lg">
          {/* Alert */}
          <Alert variant="info">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Estes dados só serão acedidos por entidades autorizadas com fins legitimados.
            </AlertDescription>
          </Alert>

          {/* Contact Info Toggle */}
          <div className="flex items-center justify-between rounded-lg border border-outline p-md">
            <div>
              <p className="font-medium text-on-surface">Informações de Contacto</p>
              <p className="text-sm text-on-surface-variant">
                Email e telefone visíveis para clubes
              </p>
            </div>
            <input
              type="checkbox"
              {...register('show_contact_info')}
              className="h-4 w-4 text-primary"
            />
          </div>

          {/* Medical Data Toggle */}
          <div className="flex items-center justify-between rounded-lg border border-outline p-md">
            <div>
              <p className="font-medium text-on-surface">Dados Médicos</p>
              <p className="text-sm text-on-surface-variant">
                Partilhar com equipa médica autorizada
              </p>
            </div>
            <input
              type="checkbox"
              {...register('show_medical_data')}
              className="h-4 w-4 text-primary"
            />
          </div>

          {/* Contract Data Toggle */}
          <div className="flex items-center justify-between rounded-lg border border-outline p-md">
            <div>
              <p className="font-medium text-on-surface">Dados de Contrato</p>
              <p className="text-sm text-on-surface-variant">
                Informações de contrato visíveis para clubes
              </p>
            </div>
            <input
              type="checkbox"
              {...register('show_contract_data')}
              className="h-4 w-4 text-primary"
            />
          </div>

          {/* Scout Contact Toggle */}
          <div className="flex items-center justify-between rounded-lg border border-outline p-md">
            <div>
              <p className="font-medium text-on-surface">Contacto de Scouts</p>
              <p className="text-sm text-on-surface-variant">
                Permitir contacto direto de scouts e agentes
              </p>
            </div>
            <input
              type="checkbox"
              {...register('allow_scout_contact')}
              className="h-4 w-4 text-primary"
            />
          </div>

          {/* Agent Contact Toggle */}
          <div className="flex items-center justify-between rounded-lg border border-outline p-md">
            <div>
              <p className="font-medium text-on-surface">Contacto de Agentes</p>
              <p className="text-sm text-on-surface-variant">
                Permitir contacto direto de agentes FIFA
              </p>
            </div>
            <input
              type="checkbox"
              {...register('allow_agent_contact')}
              className="h-4 w-4 text-primary"
            />
          </div>
        </CardContent>
      </Card>

      {/* Data Export Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-md">
            <Download className="h-5 w-5" />
            Dados Pessoais (RGPD)
          </CardTitle>
          <CardDescription>
            Solicitar ou exportar seus dados pessoais conforme previsto no RGPD.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-lg">
          <div className="rounded-lg border border-outline-variant bg-surface-container-low p-md">
            <p className="mb-md text-sm text-on-surface">
              Tem direito a aceder, exportar ou eliminar seus dados pessoais.
            </p>
            <div className="flex gap-md">
              <Button variant="secondary" size="sm">
                <Download className="h-4 w-4" />
                Exportar Dados
              </Button>
              <Button variant="outline" size="sm">
                <AlertCircle className="h-4 w-4" />
                Eliminar Conta
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      {isDirty && (
        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          disabled={isSaving || isLoading}
        >
          {isSaving || isLoading ? 'A guardar...' : 'Guardar Configurações de Privacidade'}
        </Button>
      )}
    </form>
  )
}
