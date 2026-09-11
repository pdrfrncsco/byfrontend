import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { CheckCircle2, Info, ShieldCheck, User } from "lucide-react"
import { ROUTES } from "@/constants/routes"
import { Button, Card, CardContent, Input, NativeSelect, Badge } from "@/components/ui"
import { FormField } from "@/components/ui/form-field"
import {
  useCompleteOnboardingStep,
  usePlayerWizard,
  usePlayerMe,
  useCreatePlayerGuardian,
  usePlayerGuardians,
} from "../hooks"
import { PlayerOnboardingLayout } from "./PlayerOnboardingLayout"

export function PlayerOnboardingGuardianPage() {
  const navigate = useNavigate()
  const complete = useCompleteOnboardingStep()
  const { markStepCompleted } = usePlayerWizard()
  const { data: player, isLoading: playerLoading } = usePlayerMe()
  const createGuardian = useCreatePlayerGuardian(player?.slug ?? "")
  const { data: existingGuardians = [] } = usePlayerGuardians(player?.slug ?? "")

  const [name, setName] = useState("")
  const [relationship, setRelationship] = useState("parent")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [documentNumber, setDocumentNumber] = useState("")

  const isMinor = player?.is_minor ?? false

  const onContinue = async () => {
    if (name.trim() && phone.trim() && player?.slug) {
      await createGuardian.mutateAsync({
        name: name.trim(),
        relationship,
        phone: phone.trim(),
        email: email.trim() || undefined,
        document_number: documentNumber.trim() || undefined,
      })
    }
    markStepCompleted("guardian")
    await complete.mutateAsync("guardian")
    navigate(ROUTES.ONBOARDING_PLAYER_CLUB)
  }

  return (
    <PlayerOnboardingLayout
      step={6}
      isSaving={complete.isPending || createGuardian.isPending}
      onNext={onContinue}
      onBack={() => navigate(ROUTES.ONBOARDING_PLAYER_IDENTITY)}
    >
      <div className="space-y-lg">
        <div>
          <div className="flex items-center gap-sm">
            <h2 className="text-xl font-bold text-on-surface">Responsável Legal</h2>
            {isMinor ? (
              <Badge variant="warning" className="text-xs">
                Obrigatório (Menor de idade)
              </Badge>
            ) : (
              <Badge variant="secondary" className="text-xs">
                Opcional (Maior de idade)
              </Badge>
            )}
          </div>
          <p className="mt-xs text-sm text-on-surface-variant">
            {isMinor
              ? "Como o jogador é menor de 18 anos, é necessário identificar um encarregado de educação ou tutor legal."
              : "Como o perfil é maior de 18 anos, este passo é opcional e pode avançar diretamente."}
          </p>
        </div>

        {existingGuardians.length > 0 && (
          <div className="space-y-xs">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
              Responsáveis já registados:
            </h4>
            {existingGuardians.map((g) => (
              <div
                key={g.id}
                className="flex items-center justify-between rounded-xl border border-outline-variant/30 bg-surface-container p-md text-sm"
              >
                <div>
                  <p className="font-semibold text-on-surface">{g.name}</p>
                  <p className="text-xs text-on-surface-variant">{g.relationship} • {g.phone}</p>
                </div>
                <Badge variant="success" className="gap-1 text-xs">
                  <CheckCircle2 className="h-3 w-3" /> Registado
                </Badge>
              </div>
            ))}
          </div>
        )}

        {/* Guardian input form */}
        <Card variant="flat" className="border-outline-variant/30 bg-surface-container/50">
          <CardContent className="space-y-md p-md md:p-lg">
            <h3 className="font-semibold text-sm text-on-surface flex items-center gap-xs">
              <User className="h-4 w-4 text-primary" />
              {existingGuardians.length > 0 ? "Adicionar outro responsável" : "Dados do Responsável"}
            </h3>

            <div className="grid gap-md sm:grid-cols-2">
              <FormField label="Nome Completo do Responsável" required={isMinor}>
                <Input
                  placeholder="Ex: Manuel António Domingos"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </FormField>

              <FormField label="Grau de Parentesco / Relação">
                <NativeSelect
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                >
                  <option value="parent">Pai / Mãe</option>
                  <option value="legal_guardian">Encarregado de Educação</option>
                  <option value="tutor">Tutor Legal Certificado</option>
                  <option value="other">Outro familiar</option>
                </NativeSelect>
              </FormField>

              <FormField label="Telefone de Contacto" required={isMinor}>
                <Input
                  placeholder="+244 9..."
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </FormField>

              <FormField label="Email">
                <Input
                  type="email"
                  placeholder="responsavel@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </FormField>

              <div className="sm:col-span-2">
                <FormField label="Nº do Documento de Identificação (B.I. / Passaporte)">
                  <Input
                    placeholder="Ex: 004829182LA041"
                    value={documentNumber}
                    onChange={(e) => setDocumentNumber(e.target.value)}
                  />
                </FormField>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PlayerOnboardingLayout>
  )
}

export function PlayerOnboardingClubPage() {
  const navigate = useNavigate()
  const complete = useCompleteOnboardingStep()
  const { markStepCompleted } = usePlayerWizard()

  const onContinue = async () => {
    markStepCompleted("club")
    await complete.mutateAsync("club")
    navigate(ROUTES.ONBOARDING_PLAYER_REVIEW)
  }

  return (
    <PlayerOnboardingLayout
      step={7}
      isSaving={complete.isPending}
      onNext={onContinue}
      onBack={() => navigate(ROUTES.ONBOARDING_PLAYER_GUARDIAN)}
    >
      <div className="space-y-lg">
        <div>
          <h2 className="text-xl font-bold text-on-surface">Ligação a um Clube</h2>
          <p className="mt-xs text-sm text-on-surface-variant">
            A ligação a um clube é opcional. Pode enviar um pedido de vínculo a partir do portal do jogador após concluir o onboarding.
          </p>
        </div>

        <div className="flex items-start gap-md rounded-lg border border-primary/30 bg-primary/10 p-md text-sm text-foreground">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <p>
            Poderá pesquisar e solicitar vinculação a qualquer clube registado no Bolayetu a qualquer altura através do seu painel.
          </p>
        </div>
      </div>
    </PlayerOnboardingLayout>
  )
}

export function PlayerOnboardingSupplementalPage({ kind = 'guardian' }: { kind?: 'guardian' | 'club' }) {
  return kind === 'guardian' ? <PlayerOnboardingGuardianPage /> : <PlayerOnboardingClubPage />
}
