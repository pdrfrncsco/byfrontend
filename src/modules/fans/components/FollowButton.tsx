import React from 'react'
import { Heart, Star, Check } from 'lucide-react'
import { Button } from '@/components/ui'
import { useFanFavorites } from '../hooks/useFanFavorites'
import type { FollowedItem } from '../types'

interface FollowButtonProps {
  item: Omit<FollowedItem, 'followedAt'>
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  showIconOnly?: boolean
  className?: string
}

export function FollowButton({
  item,
  variant = 'outline',
  size = 'sm',
  showIconOnly = false,
  className = '',
}: FollowButtonProps) {
  const { isFollowing, toggleFollow } = useFanFavorites()
  const following = isFollowing(item.type, item.id)

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleFollow(item)
  }

  if (showIconOnly) {
    return (
      <button
        type="button"
        onClick={handleToggle}
        title={following ? `Deixar de seguir ${item.name}` : `Seguir ${item.name}`}
        className={`p-2 rounded-xl transition-all duration-200 border ${
          following
            ? 'bg-rose-500/15 border-rose-500/30 text-rose-400 hover:bg-rose-500/25'
            : 'bg-surface-container-high/60 border-outline/20 text-on-surface-variant hover:text-on-surface hover:border-outline/40'
        } ${className}`}
      >
        <Heart
          className={`w-4 h-4 transition-transform active:scale-125 ${
            following ? 'fill-rose-500 text-rose-500' : ''
          }`}
        />
      </button>
    )
  }

  return (
    <Button
      type="button"
      size={size}
      variant={following ? 'secondary' : variant}
      onClick={handleToggle}
      className={`transition-all duration-200 font-medium ${
        following
          ? 'bg-primary/15 text-primary border border-primary/30 hover:bg-primary/25'
          : ''
      } ${className}`}
    >
      {following ? (
        <>
          <Check className="w-3.5 h-3.5 mr-1.5 text-primary" />
          A Seguir
        </>
      ) : (
        <>
          <Star className="w-3.5 h-3.5 mr-1.5 text-on-surface-variant" />
          Seguir
        </>
      )}
    </Button>
  )
}
