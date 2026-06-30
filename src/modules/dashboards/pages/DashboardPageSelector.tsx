import { useState, useEffect } from 'react'
import { useTenant } from '@/app/providers/TenantProvider'
import { useAuth } from '@/app/providers/AuthProvider'
import { PendingOnboardingRedirect } from '@/app/routes'
import { ExecutiveDashboardPage } from './ExecutiveDashboardPage'
import { FederationDashboardPage } from './FederationDashboardPage'
import { LeagueDashboardPage } from './LeagueDashboardPage'
import { ClubDashboardPage } from './ClubDashboardPage'
import { CompetitionDashboardPage } from './CompetitionDashboardPage'
import { Sliders, CheckCircle } from 'lucide-react'

type DashboardType = 'federation' | 'executive' | 'league' | 'club' | 'competition'

export function DashboardPageSelector() {
  const { tenant } = useTenant()
  const { user } = useAuth()
  const [resolvedType, setResolvedType] = useState<DashboardType>('executive')
  const [overrideType, setOverrideType] = useState<DashboardType | null>(null)
  const [isSelectorOpen, setIsSelectorOpen] = useState(false)

  // Dynamic resolution logic
  useEffect(() => {
    if (tenant) {
      if (tenant.slug === 'faf' || tenant.type === 'federation') {
        setResolvedType('federation')
      } else if (tenant.slug === 'girabola' || tenant.type === 'league') {
        setResolvedType('league')
      } else {
        setResolvedType('competition')
      }
    } else if (user) {
      const roles = user.roles || []
      if (roles.includes('admin') || roles.includes('executive') || user.role === 'executive') {
        setResolvedType('executive')
      } else if (roles.includes('club_admin') || user.role === 'club_admin') {
        setResolvedType('club')
      } else if (roles.includes('competition_organizer') || user.role === 'competition_organizer') {
        setResolvedType('competition')
      } else {
        setResolvedType('executive')
      }
    } else {
      // Default fallback for guest/dev view
      setResolvedType('executive')
    }
  }, [tenant, user])

  // Determine active dashboard type
  const activeType = overrideType || resolvedType

  const renderDashboard = () => {
    switch (activeType) {
      case 'federation':
        return <FederationDashboardPage />
      case 'executive':
        return <ExecutiveDashboardPage />
      case 'league':
        return <LeagueDashboardPage />
      case 'club':
        return <ClubDashboardPage />
      case 'competition':
        return <CompetitionDashboardPage />
      default:
        return <ExecutiveDashboardPage />
    }
  }

  return (
    <div className="relative min-h-screen">
      <PendingOnboardingRedirect />
      {renderDashboard()}

      {/* Premium Developer Dashboard Preview Selector Tool */}
      <div className="fixed bottom-4 left-4 z-50">
        <button
          onClick={() => setIsSelectorOpen(!isSelectorOpen)}
          className="bg-[#102034]/90 border border-[#26364a] text-[#94d3c1] hover:bg-[#1b2b3f] transition-all p-3 rounded-full shadow-2xl flex items-center justify-center cursor-pointer group"
          title="Pré-visualizar Dashboards (Ferramenta Dev)"
        >
          <Sliders className="w-5 h-5 group-hover:rotate-45 transition-transform duration-300" />
        </button>

        {isSelectorOpen && (
          <div className="absolute bottom-16 left-0 w-72 glass-panel p-md rounded-xl border border-[#26364a] shadow-2xl animate-fade-in space-y-md z-50">
            <div className="border-b border-[#26364a]/50 pb-sm flex justify-between items-center">
              <h4 className="font-display text-xs font-bold text-on-surface uppercase tracking-wider">
                Visualização de Dashboard
              </h4>
              <span className="text-[9px] text-[#94d3c1] bg-[#94d3c1]/10 px-2 py-0.5 rounded font-bold">DEV MODE</span>
            </div>
            
            <p className="text-[10px] text-on-surface-variant leading-relaxed">
              Mude a visualização do painel instantaneamente para validar cada variação de design.
            </p>

            <div className="space-y-sm">
              <button
                onClick={() => setOverrideType('executive')}
                className={`w-full flex items-center justify-between text-left p-2.5 rounded-lg border text-xs transition-colors ${
                  activeType === 'executive'
                    ? 'bg-primary-container/20 border-[#94d3c1] text-[#94d3c1]'
                    : 'bg-[#0b1c30] border-[#26364a] hover:border-[#3f4945]'
                }`}
              >
                <span>Administrador Executivo</span>
                {activeType === 'executive' && <CheckCircle className="w-4 h-4" />}
              </button>

              <button
                onClick={() => setOverrideType('federation')}
                className={`w-full flex items-center justify-between text-left p-2.5 rounded-lg border text-xs transition-colors ${
                  activeType === 'federation'
                    ? 'bg-primary-container/20 border-[#94d3c1] text-[#94d3c1]'
                    : 'bg-[#0b1c30] border-[#26364a] hover:border-[#3f4945]'
                }`}
              >
                <span>Federação (FAF)</span>
                {activeType === 'federation' && <CheckCircle className="w-4 h-4" />}
              </button>

              <button
                onClick={() => setOverrideType('league')}
                className={`w-full flex items-center justify-between text-left p-2.5 rounded-lg border text-xs transition-colors ${
                  activeType === 'league'
                    ? 'bg-primary-container/20 border-[#94d3c1] text-[#94d3c1]'
                    : 'bg-[#0b1c30] border-[#26364a] hover:border-[#3f4945]'
                }`}
              >
                <span>Liga (Girabola)</span>
                {activeType === 'league' && <CheckCircle className="w-4 h-4" />}
              </button>

              <button
                onClick={() => setOverrideType('club')}
                className={`w-full flex items-center justify-between text-left p-2.5 rounded-lg border text-xs transition-colors ${
                  activeType === 'club'
                    ? 'bg-primary-container/20 border-[#94d3c1] text-[#94d3c1]'
                    : 'bg-[#0b1c30] border-[#26364a] hover:border-[#3f4945]'
                }`}
              >
                <span>Clube (Petro de Luanda)</span>
                {activeType === 'club' && <CheckCircle className="w-4 h-4" />}
              </button>

              <button
                onClick={() => setOverrideType('competition')}
                className={`w-full flex items-center justify-between text-left p-2.5 rounded-lg border text-xs transition-colors ${
                  activeType === 'competition'
                    ? 'bg-primary-container/20 border-[#94d3c1] text-[#94d3c1]'
                    : 'bg-[#0b1c30] border-[#26364a] hover:border-[#3f4945]'
                }`}
              >
                <span>Organizador de Provas</span>
                {activeType === 'competition' && <CheckCircle className="w-4 h-4" />}
              </button>
            </div>

            {overrideType && (
              <button
                onClick={() => setOverrideType(null)}
                className="w-full text-center text-on-surface-variant hover:text-on-surface text-[10px] underline pt-sm block"
              >
                Repor Resolução Automática
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
