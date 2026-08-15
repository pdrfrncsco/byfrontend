import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronDown, X, RotateCcw } from 'lucide-react'
import { Button, Input, Label, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'
import {
  usePlayerFilters,
  usePositionFilter,
  useAgeRangeFilter,
  useHeightRangeFilter,
  useWeightRangeFilter,
} from '../../hooks/usePlayerFilters'
import type { PlayerPosition } from '../../types'

interface PlayerFilterPanelProps {
  onFiltersChanged?: () => void
  showAdvanced?: boolean
}

const POSITIONS: { value: PlayerPosition; label: string }[] = [
  { value: 'gk', label: 'Guarda-redes' },
  { value: 'cb', label: 'Defesa Central' },
  { value: 'lb', label: 'Lateral Esquerdo' },
  { value: 'rb', label: 'Lateral Direito' },
  { value: 'lwb', label: 'Lateral Esquerdo (Def.)' },
  { value: 'rwb', label: 'Lateral Direito (Def.)' },
  { value: 'cm', label: 'Médio' },
  { value: 'cdm', label: 'Médio Defensivo' },
  { value: 'cam', label: 'Médio Ofensivo' },
  { value: 'lm', label: 'Extremo Esquerdo' },
  { value: 'rm', label: 'Extremo Direito' },
  { value: 'lw', label: 'Ala Esquerda' },
  { value: 'rw', label: 'Ala Direita' },
  { value: 'st', label: 'Avançado' },
  { value: 'cf', label: 'Extremo Central' },
]

const FEET = [
  { value: 'left', label: 'Esquerda' },
  { value: 'right', label: 'Direita' },
  { value: 'both', label: 'Ambidestro' },
]

export function PlayerFilterPanel({ onFiltersChanged, showAdvanced = true }: PlayerFilterPanelProps) {
  const { t } = useTranslation()
  const { filters, setFilters, resetFilters, clearFilter } = usePlayerFilters()
  const { positions, togglePosition, clearPositions } = usePositionFilter()
  const { ageMin, ageMax, setAgeRange, clearAgeRange } = useAgeRangeFilter()
  const { heightMin, heightMax, setHeightRange, clearHeightRange } = useHeightRangeFilter()
  const { weightMin, weightMax, setWeightRange, clearWeightRange } = useWeightRangeFilter()

  const [expandedSections, setExpandedSections] = useState({
    search: true,
    position: true,
    physical: false,
    other: false,
  })

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  // Count active filters
  const activeFiltersCount = [
    filters.search ? 1 : 0,
    positions.length > 0 ? 1 : 0,
    ageMin !== undefined || ageMax !== undefined ? 1 : 0,
    heightMin !== undefined || heightMax !== undefined ? 1 : 0,
    weightMin !== undefined || weightMax !== undefined ? 1 : 0,
    filters.foot ? 1 : 0,
    filters.nationality ? 1 : 0,
    filters.status ? 1 : 0,
    filters.withoutClub ? 1 : 0,
  ].reduce((a, b) => a + b, 0)

  return (
    <div className="space-y-lg">
      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="rounded-lg bg-primary-container/20 p-md">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-on-surface">
              {activeFiltersCount} filtro{activeFiltersCount !== 1 ? 's' : ''} ativo{activeFiltersCount !== 1 ? 's' : ''}
            </p>
            <Button variant="ghost" size="sm" onClick={() => resetFilters()}>
              <RotateCcw className="h-4 w-4" />
              Limpar Tudo
            </Button>
          </div>
        </div>
      )}

      {/* Search Section */}
      <Card>
        <CardHeader className="cursor-pointer" onClick={() => toggleSection('search')}>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-md">
              Pesquisa
              {filters.search && (
                <span className="rounded-full bg-primary px-xs py-xs text-xs text-on-primary">
                  1
                </span>
              )}
            </CardTitle>
            <ChevronDown
              className={`h-5 w-5 transition-transform ${expandedSections.search ? 'rotate-180' : ''}`}
            />
          </div>
        </CardHeader>
        {expandedSections.search && (
          <CardContent className="space-y-md">
            <div className="space-y-sm">
              <Label htmlFor="search">Pesquisar Jogador</Label>
              <div className="flex gap-sm">
                <Input
                  id="search"
                  placeholder="Nome, posição, nacionalidade..."
                  value={filters.search || ''}
                  onChange={(e) => setFilters({ search: e.target.value, page: 1 })}
                />
                {filters.search && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => clearFilter('search')}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Position Section */}
      <Card>
        <CardHeader className="cursor-pointer" onClick={() => toggleSection('position')}>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-md">
              Posição
              {positions.length > 0 && (
                <span className="rounded-full bg-primary px-xs py-xs text-xs text-on-primary">
                  {positions.length}
                </span>
              )}
            </CardTitle>
            <ChevronDown
              className={`h-5 w-5 transition-transform ${expandedSections.position ? 'rotate-180' : ''}`}
            />
          </div>
        </CardHeader>
        {expandedSections.position && (
          <CardContent className="space-y-md">
            <div className="grid gap-md sm:grid-cols-2">
              {POSITIONS.map((pos) => (
                <label key={pos.value} className="flex items-center gap-md cursor-pointer">
                  <input
                    type="checkbox"
                    checked={positions.includes(pos.value)}
                    onChange={() => togglePosition(pos.value)}
                    className="h-4 w-4 rounded border-outline text-primary"
                  />
                  <span className="text-sm text-on-surface">{pos.label}</span>
                </label>
              ))}
            </div>
            {positions.length > 0 && (
              <Button variant="outline" size="sm" onClick={clearPositions} className="w-full">
                Limpar Posições
              </Button>
            )}
          </CardContent>
        )}
      </Card>

      {/* Physical Attributes Section */}
      {showAdvanced && (
        <Card>
          <CardHeader className="cursor-pointer" onClick={() => toggleSection('physical')}>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-md">
                Atributos Físicos
                {(ageMin || ageMax || heightMin || heightMax || weightMin || weightMax) && (
                  <span className="rounded-full bg-primary px-xs py-xs text-xs text-on-primary">
                    {[ageMin, ageMax, heightMin, heightMax, weightMin, weightMax].filter(Boolean).length}
                  </span>
                )}
              </CardTitle>
              <ChevronDown
                className={`h-5 w-5 transition-transform ${expandedSections.physical ? 'rotate-180' : ''}`}
              />
            </div>
          </CardHeader>
          {expandedSections.physical && (
            <CardContent className="space-y-lg">
              {/* Age Range */}
              <div className="space-y-md">
                <Label>Idade</Label>
                <div className="flex gap-md items-end">
                  <div className="flex-1">
                    <Label className="text-xs text-on-surface-variant">De</Label>
                    <Input
                      type="number"
                      min="16"
                      max="50"
                      placeholder="Min"
                      value={ageMin || ''}
                      onChange={(e) =>
                        setAgeRange(e.target.value ? parseInt(e.target.value) : undefined, ageMax)
                      }
                    />
                  </div>
                  <div className="flex-1">
                    <Label className="text-xs text-on-surface-variant">Até</Label>
                    <Input
                      type="number"
                      min="16"
                      max="50"
                      placeholder="Máx"
                      value={ageMax || ''}
                      onChange={(e) =>
                        setAgeRange(ageMin, e.target.value ? parseInt(e.target.value) : undefined)
                      }
                    />
                  </div>
                  {(ageMin || ageMax) && (
                    <Button variant="ghost" size="sm" onClick={clearAgeRange}>
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Height Range */}
              <div className="space-y-md">
                <Label>Altura (cm)</Label>
                <div className="flex gap-md items-end">
                  <div className="flex-1">
                    <Label className="text-xs text-on-surface-variant">De</Label>
                    <Input
                      type="number"
                      min="150"
                      max="220"
                      placeholder="Min"
                      value={heightMin || ''}
                      onChange={(e) =>
                        setHeightRange(e.target.value ? parseInt(e.target.value) : undefined, heightMax)
                      }
                    />
                  </div>
                  <div className="flex-1">
                    <Label className="text-xs text-on-surface-variant">Até</Label>
                    <Input
                      type="number"
                      min="150"
                      max="220"
                      placeholder="Máx"
                      value={heightMax || ''}
                      onChange={(e) =>
                        setHeightRange(heightMin, e.target.value ? parseInt(e.target.value) : undefined)
                      }
                    />
                  </div>
                  {(heightMin || heightMax) && (
                    <Button variant="ghost" size="sm" onClick={clearHeightRange}>
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Weight Range */}
              <div className="space-y-md">
                <Label>Peso (kg)</Label>
                <div className="flex gap-md items-end">
                  <div className="flex-1">
                    <Label className="text-xs text-on-surface-variant">De</Label>
                    <Input
                      type="number"
                      min="40"
                      max="150"
                      placeholder="Min"
                      value={weightMin || ''}
                      onChange={(e) =>
                        setWeightRange(e.target.value ? parseInt(e.target.value) : undefined, weightMax)
                      }
                    />
                  </div>
                  <div className="flex-1">
                    <Label className="text-xs text-on-surface-variant">Até</Label>
                    <Input
                      type="number"
                      min="40"
                      max="150"
                      placeholder="Máx"
                      value={weightMax || ''}
                      onChange={(e) =>
                        setWeightRange(weightMin, e.target.value ? parseInt(e.target.value) : undefined)
                      }
                    />
                  </div>
                  {(weightMin || weightMax) && (
                    <Button variant="ghost" size="sm" onClick={clearWeightRange}>
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* Other Filters Section */}
      {showAdvanced && (
        <Card>
          <CardHeader className="cursor-pointer" onClick={() => toggleSection('other')}>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-md">
                Outros Filtros
                {(filters.foot || filters.nationality || filters.status || filters.withoutClub) && (
                  <span className="rounded-full bg-primary px-xs py-xs text-xs text-on-primary">
                    {[filters.foot, filters.nationality, filters.status, filters.withoutClub].filter(Boolean).length}
                  </span>
                )}
              </CardTitle>
              <ChevronDown
                className={`h-5 w-5 transition-transform ${expandedSections.other ? 'rotate-180' : ''}`}
              />
            </div>
          </CardHeader>
          {expandedSections.other && (
            <CardContent className="space-y-md">
              {/* Foot */}
              <div className="space-y-sm">
                <Label>Pé Preferido</Label>
                <select
                  value={filters.foot || ''}
                  onChange={(e) => setFilters({ foot: e.target.value as any || undefined, page: 1 })}
                  className="flex h-10 w-full rounded-lg border border-outline bg-surface px-md py-sm text-sm text-on-surface placeholder:text-on-surface-variant focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <option value="">Todos</option>
                  {FEET.map((foot) => (
                    <option key={foot.value} value={foot.value}>
                      {foot.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Nationality */}
              <div className="space-y-sm">
                <Label>Nacionalidade</Label>
                <Input
                  placeholder="Ex: Angolana, Portuguesa..."
                  value={filters.nationality || ''}
                  onChange={(e) => setFilters({ nationality: e.target.value || undefined, page: 1 })}
                />
              </div>

              {/* Status */}
              <div className="space-y-sm">
                <Label>Estado</Label>
                <select
                  value={filters.status || ''}
                  onChange={(e) => setFilters({ status: e.target.value as any || undefined, page: 1 })}
                  className="flex h-10 w-full rounded-lg border border-outline bg-surface px-md py-sm text-sm text-on-surface placeholder:text-on-surface-variant focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <option value="">Todos</option>
                  <option value="active">Ativo</option>
                  <option value="retired">Aposentado</option>
                  <option value="banned">Banido</option>
                  <option value="inactive">Inativo</option>
                </select>
              </div>

              {/* Without Club */}
              <label className="flex items-center gap-md cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.withoutClub || false}
                  onChange={(e) => setFilters({ withoutClub: e.target.checked || undefined, page: 1 })}
                  className="h-4 w-4 rounded border-outline text-primary"
                />
                <span className="text-sm text-on-surface">Apenas sem clube</span>
              </label>
            </CardContent>
          )}
        </Card>
      )}
    </div>
  )
}
