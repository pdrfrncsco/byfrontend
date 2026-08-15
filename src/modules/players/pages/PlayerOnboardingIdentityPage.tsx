import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, ArrowLeft } from 'lucide-react'
import { Button, Input, Label } from '@/components/ui'
import { ROUTES } from '@/constants/routes'
import { useCreateIdentityDocument, useCompleteOnboardingStep, usePlayerOnboardingStatus } from '../hooks'
import type { PlayerIdentityDocumentCreate } from '../types'
import { PlayerOnboardingLayout } from './PlayerOnboardingLayout'

type IdentityForm = Omit<PlayerIdentityDocumentCreate, 'document_front' | 'document_back'> & { document_front?: FileList; document_back?: FileList }

export function PlayerOnboardingIdentityPage() {
  const navigate = useNavigate()
  const { data: status } = usePlayerOnboardingStatus()
  const slug = status?.player?.slug ?? ''
  const { register, handleSubmit } = useForm<IdentityForm>({ defaultValues: { document_type: 'national_id' } })
  const create = useCreateIdentityDocument(slug)
  const complete = useCompleteOnboardingStep()

  const onSubmit = async (values: IdentityForm) => {
    await create.mutateAsync({
      document_type: values.document_type,
      document_number: values.document_number,
      issuing_country: values.issuing_country,
      issuing_authority: values.issuing_authority,
      issue_date: values.issue_date,
      expiry_date: values.expiry_date,
      document_front: values.document_front?.[0],
      document_back: values.document_back?.[0],
    })
    await complete.mutateAsync('identity')
    navigate(ROUTES.ONBOARDING_PLAYER_PROFILE)
  }

  return (
    <PlayerOnboardingLayout step={2}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-lg">
        <div><h2 className="text-xl font-semibold text-on-surface">Identidade</h2><p className="mt-xs text-sm text-on-surface-variant">Registe um documento oficial para validar a identidade do jogador.</p></div>
        <div className="grid gap-md md:grid-cols-2">
          <div><Label htmlFor="document_type">Tipo de documento</Label><select id="document_type" {...register('document_type')} className="flex h-10 w-full rounded-lg border border-outline-variant bg-surface-container px-md text-sm"><option value="national_id">Bilhete de identidade</option><option value="passport">Passaporte</option><option value="birth_certificate">Certidão de nascimento</option><option value="residence_permit">Título de residência</option><option value="other">Outro</option></select></div>
          <div><Label htmlFor="document_number">Número</Label><Input id="document_number" {...register('document_number')} /></div>
          <div><Label htmlFor="issuing_country">País emissor</Label><Input id="issuing_country" maxLength={3} {...register('issuing_country')} /></div>
          <div><Label htmlFor="issuing_authority">Autoridade emissora</Label><Input id="issuing_authority" {...register('issuing_authority')} /></div>
          <div><Label htmlFor="issue_date">Data de emissão</Label><Input id="issue_date" type="date" {...register('issue_date')} /></div>
          <div><Label htmlFor="expiry_date">Data de validade</Label><Input id="expiry_date" type="date" {...register('expiry_date')} /></div>
          <div><Label htmlFor="document_front">Frente do documento</Label><Input id="document_front" type="file" {...register('document_front')} /></div>
          <div><Label htmlFor="document_back">Verso do documento</Label><Input id="document_back" type="file" {...register('document_back')} /></div>
        </div>
        <div className="flex justify-between gap-sm"><Button type="button" variant="secondary" onClick={() => navigate(ROUTES.ONBOARDING_PLAYER)}><ArrowLeft className="h-4 w-4" />Voltar</Button><Button type="submit" loading={create.isPending || complete.isPending}>Continuar<ArrowRight className="h-4 w-4" /></Button></div>
      </form>
    </PlayerOnboardingLayout>
  )
}
