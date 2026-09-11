import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { ArrowLeft, Scale } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSeo } from "@/hooks/useSeo"
import { PlayerComparison } from "../components"
import { playerRoutes } from "../routes"

export function PlayerComparisonPage() {
  const { t } = useTranslation()

  useSeo({
    title: "Comparador de Jogadores — BOLAYETU",
    description: "Compare o rendimento, estatísticas, atributos e histórico de jogadores lado a lado.",
    path: "/players/comparison",
  })

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <div className="container mx-auto px-md py-lg space-y-lg max-w-7xl">
        <div className="flex flex-col gap-sm sm:flex-row sm:items-center sm:justify-between border-b border-outline-variant/30 pb-md">
          <div className="space-y-xs">
            <div className="flex items-center gap-xs">
              <Button asChild variant="ghost" size="sm" className="gap-xs -ml-2">
                <Link to={playerRoutes.list}>
                  <ArrowLeft className="h-4 w-4" />
                  Voltar para Jogadores
                </Link>
              </Button>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-on-surface flex items-center gap-sm">
              <Scale className="h-7 w-7 text-primary" />
              Comparador de Jogadores
            </h1>
            <p className="text-sm text-on-surface-variant max-w-2xl">
              Pesquise e selecione jogadores para analisar dados de rendimento, métricas de ataque e defesa, e histórico de carreira comparado.
            </p>
          </div>
        </div>

        <main>
          <PlayerComparison />
        </main>
      </div>
    </div>
  )
}
