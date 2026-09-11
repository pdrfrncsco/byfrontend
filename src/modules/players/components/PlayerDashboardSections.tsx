import { Activity, FileText, GraduationCap, HeartPulse, Lock, UserRound } from "lucide-react"
import { Card, CardHeader, CardTitle } from "@/components/ui"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { usePlayerCareer } from "../hooks"
import { PlayerContractSection } from "./sections/PlayerContractSection"
import { PlayerAgentSection } from "./sections/PlayerAgentSection"
import { PlayerTrainingHistorySection } from "./sections/PlayerTrainingHistorySection"
import { PlayerMedicalSection } from "./sections/PlayerMedicalSection"
import { PlayerPrivacySettingsPanel } from "./PlayerPrivacySettingsPanel"

interface Props {
  slug: string
  playerId: string
}

export function PlayerDashboardSections({ slug, playerId }: Props) {
  const career = usePlayerCareer(slug)

  return (
    <Card variant="flat" padding="none">
      <Tabs defaultValue="career">
        <TabsList className="flex flex-wrap gap-xs rounded-none border-b border-outline-variant/30 p-md">
          <TabsTrigger value="career" className="gap-xs">
            <Activity className="h-4 w-4" />
            Carreira
          </TabsTrigger>
          <TabsTrigger value="contracts" className="gap-xs">
            <FileText className="h-4 w-4" />
            Contratos
          </TabsTrigger>
          <TabsTrigger value="agents" className="gap-xs">
            <UserRound className="h-4 w-4" />
            Agentes
          </TabsTrigger>
          <TabsTrigger value="training" className="gap-xs">
            <GraduationCap className="h-4 w-4" />
            Formação & EPP
          </TabsTrigger>
          <TabsTrigger value="medical" className="gap-xs">
            <HeartPulse className="h-4 w-4" />
            Médico
          </TabsTrigger>
          <TabsTrigger value="privacy" className="gap-xs">
            <Lock className="h-4 w-4" />
            Privacidade
          </TabsTrigger>
        </TabsList>

        <TabsContent value="career" className="p-lg">
          <CardHeader className="p-0 pb-md">
            <CardTitle>Histórico de Carreira</CardTitle>
          </CardHeader>
          {career.isLoading ? (
            <p className="text-sm text-on-surface-variant">A carregar carreira...</p>
          ) : (career.data ?? []).length === 0 ? (
            <p className="text-sm text-on-surface-variant">Sem registos de carreira encontrados.</p>
          ) : (
            <div className="space-y-sm">
              {career.data?.map((entry) => (
                <div
                  key={entry.id}
                  className="grid gap-sm rounded-xl border border-outline-variant/30 bg-surface p-md md:grid-cols-4"
                >
                  <div>
                    <p className="text-xs text-on-surface-variant">Clube</p>
                    <p className="font-semibold text-sm text-on-surface">{entry.club_name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-on-surface-variant">Época</p>
                    <p className="font-medium text-sm text-on-surface">{entry.season}</p>
                  </div>
                  <div>
                    <p className="text-xs text-on-surface-variant">Jogos</p>
                    <p className="font-medium text-sm text-on-surface">{entry.appearances}</p>
                  </div>
                  <div>
                    <p className="text-xs text-on-surface-variant">Golos / Assistências</p>
                    <p className="font-medium text-sm text-on-surface">
                      {entry.goals} golos • {entry.assists} ass.
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="contracts" className="p-lg">
          <PlayerContractSection playerId={playerId} />
        </TabsContent>

        <TabsContent value="agents" className="p-lg">
          <PlayerAgentSection playerId={playerId} />
        </TabsContent>

        <TabsContent value="training" className="p-lg">
          <PlayerTrainingHistorySection playerId={playerId} />
        </TabsContent>

        <TabsContent value="medical" className="p-lg">
          <PlayerMedicalSection playerId={playerId} isStaffOnly={false} />
        </TabsContent>

        <TabsContent value="privacy" className="p-lg">
          <CardHeader className="p-0 pb-md">
            <CardTitle>Definições de Privacidade & Visibilidade</CardTitle>
          </CardHeader>
          <PlayerPrivacySettingsPanel slug={slug} />
        </TabsContent>
      </Tabs>
    </Card>
  )
}
