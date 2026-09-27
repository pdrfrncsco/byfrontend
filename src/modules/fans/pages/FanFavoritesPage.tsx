import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, Search, Filter, Shield, User, Plus, Check, Star } from 'lucide-react'
import { DashboardLayout } from '@/app/layouts/DashboardLayout'
import { Card, CardHeader, CardTitle, CardContent, Button, Input } from '@/components/ui'
import { ROUTES } from '@/constants/routes'
import { FollowButton } from '../components/FollowButton'
import { useFanFavorites } from '../hooks/useFanFavorites'
import { getFanSidebarLinks } from '../constants/navigation'

export function FanFavoritesPage() {
  const {
    followedClubs,
    followedPlayers,
    followedCompetitions,
  } = useFanFavorites()

  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'clubs' | 'players' | 'competitions'>('all')

  const sidebarLinks = getFanSidebarLinks()

  const filteredClubs = followedClubs.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  )
  const filteredPlayers = followedPlayers.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  )
  const filteredCompetitions = followedCompetitions.filter((comp) =>
    comp.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <DashboardLayout
      title="Clubes & Atletas Favoritos"
      subtitle="Faça a gestão dos clubes, jogadores e competições que acompanha de perto"
      dashboardType="fan"
      sidebarLinks={sidebarLinks}
    >
      <div className="space-y-6 pb-12">
        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-surface-container border border-outline/20">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
            <input
              type="text"
              placeholder="Pesquisar favoritos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-surface-container-high border border-outline/20 text-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <Button
              size="sm"
              variant={filterType === 'all' ? 'primary' : 'outline'}
              onClick={() => setFilterType('all')}
            >
              Todos ({followedClubs.length + followedPlayers.length + followedCompetitions.length})
            </Button>
            <Button
              size="sm"
              variant={filterType === 'clubs' ? 'primary' : 'outline'}
              onClick={() => setFilterType('clubs')}
            >
              Clubes ({followedClubs.length})
            </Button>
            <Button
              size="sm"
              variant={filterType === 'players' ? 'primary' : 'outline'}
              onClick={() => setFilterType('players')}
            >
              Atletas ({followedPlayers.length})
            </Button>
            <Link to={ROUTES.PUBLIC_EXPLORE}>
              <Button size="sm" variant="secondary" className="gap-1.5 ml-2">
                <Plus className="w-4 h-4" />
                Descobrir Mais
              </Button>
            </Link>
          </div>
        </div>

        {/* Clubs Grid */}
        {(filterType === 'all' || filterType === 'clubs') && (
          <div className="space-y-3">
            <h3 className="text-base font-bold text-on-surface flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              Clubes Seguidos ({filteredClubs.length})
            </h3>
            {filteredClubs.length === 0 ? (
              <p className="text-xs text-on-surface-variant italic">Nenhum clube encontrado.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredClubs.map((club) => (
                  <Card key={club.id} className="p-4 bg-surface-container border border-outline/20 flex flex-col justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-surface-container-high overflow-hidden border border-outline/20 shrink-0">
                        {club.badgeUrl ? (
                          <img src={club.badgeUrl} alt={club.name} className="w-full h-full object-cover" />
                        ) : (
                          <Shield className="w-6 h-6 text-on-surface-variant m-auto mt-3" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <Link to={`/clubs/${club.slug || club.id}`} className="font-bold text-sm text-on-surface hover:text-primary transition truncate block">
                          {club.name}
                        </Link>
                        <p className="text-xs text-on-surface-variant truncate">{club.subtitle}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-outline/10">
                      <span className="text-[11px] text-slate-400">Seguido em {new Date(club.followedAt).toLocaleDateString('pt-AO')}</span>
                      <FollowButton item={club} />
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Players Grid */}
        {(filterType === 'all' || filterType === 'players') && (
          <div className="space-y-3 pt-4">
            <h3 className="text-base font-bold text-on-surface flex items-center gap-2">
              <User className="w-4 h-4 text-cyan-400" />
              Atletas Seguidos ({filteredPlayers.length})
            </h3>
            {filteredPlayers.length === 0 ? (
              <p className="text-xs text-on-surface-variant italic">Nenhum atleta encontrado.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPlayers.map((player) => (
                  <Card key={player.id} className="p-4 bg-surface-container border border-outline/20 flex flex-col justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-surface-container-high overflow-hidden border border-outline/20 shrink-0">
                        {player.avatarUrl ? (
                          <img src={player.avatarUrl} alt={player.name} className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-6 h-6 text-on-surface-variant m-auto mt-3" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <Link to={ROUTES.PLAYER_DETAIL(player.slug || player.id)} className="font-bold text-sm text-on-surface hover:text-primary transition truncate block">
                          {player.name}
                        </Link>
                        <p className="text-xs text-on-surface-variant truncate">{player.subtitle}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-outline/10">
                      <span className="text-[11px] text-slate-400">Seguido em {new Date(player.followedAt).toLocaleDateString('pt-AO')}</span>
                      <FollowButton item={player} />
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
