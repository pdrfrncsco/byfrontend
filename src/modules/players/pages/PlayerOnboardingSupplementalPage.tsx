import { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  Clock,
  Handshake,
  Info,
  Search,
  ShieldCheck,
  User,
} from "lucide-react"
import { ROUTES } from "@/constants/routes"
import { Button, Card, CardContent, Input, NativeSelect, Badge } from "@/components/ui"
import { FormField } from "@/components/ui/form-field"
import { useClubs } from "@/modules/clubs/hooks/useClubs"
import type { Club } from "@/modules/clubs/types"
import {
  useCompleteOnboardingStep,
  usePlayerWizard,
  usePlayerMe,
  useCreatePlayerGuardian,
  usePlayerGuardians,
  useSubmitRegistrationRequest,
  useMyRegistrationRequests,
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
  const { data: clubsData, isLoading: clubsLoading } = useClubs({ page_size: 100 })
  const { data: requests = [] } = useMyRegistrationRequests()
  const submitRequest = useSubmitRegistrationRequest()

  const [selectedClubId, setSelectedClubId] = useState("")
  const [shirtNumber, setShirtNumber] = useState("")
  const [clubSearch, setClubSearch] = useState("")
  const [requestError, setRequestError] = useState<string | null>(null)

  const clubs = useMemo(() => {
    const rawList = Array.isArray(clubsData)
      ? clubsData
      : (clubsData as unknown as { results?: Club[] } | undefined)?.results ?? []
    const list: Club[] = Array.isArray(rawList) ? rawList : []
    if (!clubSearch.trim()) return list
    const q = clubSearch.toLowerCase()
    return list.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.short_name && c.short_name.toLowerCase().includes(q))
    )
  }, [clubsData, clubSearch])

  const existingRequest = requests.find(
    (r) => ["pending", "approved", "accepted"].includes(r.status?.toLowerCase() || "")
  )

  const handleLinkAndContinue = async () => {
    setRequestError(null)

    if (selectedClubId) {
      try {
        await submitRequest.mutateAsync({
          club_id: selectedClubId,
          joined_date: new Date().toISOString().split("T")[0],
          shirt_number: shirtNumber ? parseInt(shirtNumber, 10) : undefined,
        })
      } catch (err: unknown) {
        const status = (err as { response?: { status?: number } })?.response?.status
        // Se for 409 Conflict, o pedido para este clube já existe (pendente ou activo).
        // Não deve bloquear o onboarding!
        if (status !== 409) {
          setRequestError("Não foi possível registar o pedido de vínculo. Pode tentar novamente ou avançar sem clube.")
          return
        }
      }
    }

    markStepCompleted("club")
    try {
      await complete.mutateAsync("club")
    } catch {
      // Ignora se o passo já estiver concluído no backend
    }
    navigate(ROUTES.ONBOARDING_PLAYER_REVIEW)
  }

  const handleSkipClub = async () => {
    markStepCompleted("club")
    try {
      await complete.mutateAsync("club")
    } catch {
      // Ignora se o passo já estiver concluído
    }
    navigate(ROUTES.ONBOARDING_PLAYER_REVIEW)
  }

  const isSaving = complete.isPending || submitRequest.isPending

  return (
    <PlayerOnboardingLayout
      step={7}
      isSaving={isSaving}
      onNext={handleLinkAndContinue}
      onBack={() => navigate(ROUTES.ONBOARDING_PLAYER_GUARDIAN)}
    >
      <div className="space-y-lg">
        <div className="flex flex-col gap-xs sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-on-surface">Ligação a um Clube</h2>
            <p className="mt-xs text-sm text-on-surface-variant">
              Vincule o seu perfil a um clube registado no Bolayetu ou avance como atleta livre.
            </p>
          </div>
          <Badge variant="secondary" className="self-start text-xs sm:self-auto">
            Opcional
          </Badge>
        </div>

        {/* Existing request banner */}
        {existingRequest && (
          <div className="flex flex-col gap-sm sm:flex-row sm:items-center sm:justify-between rounded-xl border border-primary/30 bg-primary/10 p-md text-sm">
            <div className="flex items-center gap-sm">
              <Handshake className="h-5 w-5 text-primary shrink-0" />
              <div>
                <p className="font-semibold text-on-surface">
                  Pedido em análise: {existingRequest.club_name}
                </p>
                <p className="text-xs text-on-surface-variant">
                  Estado: {existingRequest.status_label || existingRequest.status} (aguarda confirmação do clube, pode concluir o onboarding)
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleSkipClub}
              className="text-xs self-start sm:self-auto whitespace-nowrap"
            >
              Avançar com este pedido →
            </Button>
          </div>
        )}

        {/* Selection form */}
        <Card variant="flat" className="border-outline-variant/30 bg-surface-container/50">
          <CardContent className="space-y-md p-md md:p-lg">
            <h3 className="font-semibold text-sm text-on-surface flex items-center gap-xs">
              <Building2 className="h-4 w-4 text-primary" />
              Selecionar Clube Desportivo
            </h3>

            {requestError && (
              <div className="flex items-center gap-sm rounded-lg border border-danger/30 bg-danger/10 p-sm text-sm text-danger">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{requestError}</span>
              </div>
            )}

            <div className="space-y-sm">
              <FormField label="Pesquisar Clube">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant" />
                  <Input
                    className="pl-9"
                    placeholder="Filtrar por nome do clube ou sigla..."
                    value={clubSearch}
                    onChange={(e) => setClubSearch(e.target.value)}
                  />
                </div>
              </FormField>

              <FormField label="Clube Desportivo">
                <NativeSelect
                  value={selectedClubId}
                  onChange={(e) => {
                    setSelectedClubId(e.target.value)
                    setRequestError(null)
                  }}
                  disabled={clubsLoading}
                >
                  <option value="">-- Selecione o clube para vincular (opcional) --</option>
                  {clubs.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.short_name ? `(${c.short_name})` : ""}
                    </option>
                  ))}
                </NativeSelect>
              </FormField>

              {selectedClubId && (
                <div className="pt-xs">
                  <FormField label="Número da Camisola Preferido (Opcional)">
                    <Input
                      type="number"
                      min={1}
                      max={99}
                      placeholder="Ex: 10"
                      value={shirtNumber}
                      onChange={(e) => setShirtNumber(e.target.value)}
                    />
                  </FormField>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Informational Callout */}
        <div className="flex items-start gap-md rounded-xl border border-primary/20 bg-primary/5 p-md text-sm">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <div className="space-y-1">
            <p className="font-semibold text-on-surface">Não joga em nenhum clube atualmente?</p>
            <p className="text-xs text-on-surface-variant">
              Poderá pesquisar e solicitar vinculação a qualquer clube registado no Bolayetu a qualquer altura através do seu painel após o registo.
            </p>
          </div>
        </div>

        {/* Skip button */}
        <div className="flex justify-end pt-xs">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleSkipClub}
            className="text-xs text-on-surface-variant hover:text-on-surface"
          >
            Sou jogador livre / Vincular mais tarde →
          </Button>
        </div>
      </div>
    </PlayerOnboardingLayout>
  )
}

export function PlayerOnboardingSupplementalPage({ kind = "guardian" }: { kind?: "guardian" | "club" }) {
  return kind === "guardian" ? <PlayerOnboardingGuardianPage /> : <PlayerOnboardingClubPage />
}
