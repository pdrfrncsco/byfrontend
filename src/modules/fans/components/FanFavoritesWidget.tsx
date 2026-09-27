import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, Users, User, ArrowRight, Shield, ExternalLink, Plus } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, Button } from '@/components/ui'
import { ROUTES } from '@/constants/routes'
import { FollowButton } from './FollowButton'
import type { FollowedItem } from '../types'

interface FanFavoritesWidgetProps {
  followedClubs: FollowedItem[]
  followedPlayers: FollowedItem[]
}

export function FanFavoritesWidget({
  followedClubs,
  followedPlayers,
}: FanFavoritesWidgetProps) {
  const [activeTab, setActiveTab] = useState<'clubs' | 'players'>('clubs')

  return (
    <Card className="border border-outline/30 bg-surface-container-low overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between border-b border-outline/20 pb-4">
        <div className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-rose-400 fill-rose-400" />
          <CardTitle className="text-lg font-bold text-on-surface">
            Minha Galeria de Favoritos
          </CardTitle>
        </div>

        {/* Segmented Switcher */}
        <div className="flex items-center p-1 bg-surface-container-high rounded-xl border border-outline/20">
          <button
            type="button"
            onClick={() => setActiveTab('clubs')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
              activeTab === 'clubs'
                ? 'bg-primary text-surface shadow'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Clubes ({followedClubs.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('players')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
              activeTab === 'players'
                ? 'bg-primary text-surface shadow'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Atletas ({followedPlayers.length})
          </button>
        </div>
      </CardHeader>

      <CardContent className="p-4 md:p-6">
        {activeTab === 'clubs' ? (
          <div className="space-y-3">
            {followedClubs.length === 0 ? (
              <div className="text-center py-8 space-y-3">
                <Users className="w-10 h-10 text-on-surface-variant/40 mx-auto" />
                <p className="text-sm text-on-surface-variant">
                  Ainda não segue nenhum clube.
                </p>
                <Link to={ROUTES.PUBLIC_EXPLORE}>
                  <Button size="sm" variant="outline">
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    Explorar Clubes
                  </Button>
                </Link>
              </div>
            ) : (
              followedClubs.map((club) => (
                <div
                  key={club.id}
                  className="flex items-center justify-between gap-3 p-3 rounded-xl bg-surface-container border border-outline/20 hover:border-outline/40 transition"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center overflow-hidden border border-outline/20 shrink-0">
                      {club.badgeUrl ? (
                        <img src={club.badgeUrl} alt={club.name} className="w-full h-full object-cover" />
                      ) : (
                        <Shield className="w-5 h-5 text-on-surface-variant" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <Link
                        to={`/clubs/${club.slug || club.id}`}
                        className="font-bold text-sm text-on-surface hover:text-primary transition truncate block"
                      >
                        {club.name}
                      </Link>
                      <p className="text-xs text-on-surface-variant truncate">
                        {club.subtitle || club.category}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <FollowButton item={club} showIconOnly />
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {followedPlayers.length === 0 ? (
              <div className="text-center py-8 space-y-3">
                <User className="w-10 h-10 text-on-surface-variant/40 mx-auto" />
                <p className="text-sm text-on-surface-variant">
                  Ainda não segue nenhum atleta.
                </p>
                <Link to={ROUTES.PLAYERS}>
                  <Button size="sm" variant="outline">
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    Descobrir Atletas
                  </Button>
                </Link>
              </div>
            ) : (
              followedPlayers.map((player) => (
                <div
                  key={player.id}
                  className="flex items-center justify-between gap-3 p-3 rounded-xl bg-surface-container border border-outline/20 hover:border-outline/40 transition"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center overflow-hidden border border-outline/20 shrink-0">
                      {player.avatarUrl ? (
                        <img src={player.avatarUrl} alt={player.name} className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-5 h-5 text-on-surface-variant" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <Link
                        to={ROUTES.PLAYER_DETAIL(player.slug || player.id)}
                        className="font-bold text-sm text-on-surface hover:text-primary transition truncate block"
                      >
                        {player.name}
                      </Link>
                      <p className="text-xs text-on-surface-variant truncate">
                        {player.subtitle || player.category}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <FollowButton item={player} showIconOnly />
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        <div className="mt-4 pt-3 border-t border-outline/20 flex justify-end">
          <Link to={ROUTES.PUBLIC_EXPLORE} className="text-xs text-primary font-medium hover:underline flex items-center gap-1">
            Procurar mais no Diretório Nacional
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
