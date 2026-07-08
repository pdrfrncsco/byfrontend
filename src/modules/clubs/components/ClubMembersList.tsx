import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import type { ClubMember } from '@/modules/clubs/types'

export function ClubMembersList({ members }: { members: ClubMember[] }) {
  return (
    <div className="space-y-sm">
      {members.map((member) => (
        <Card key={member.id} variant="flat" padding="none">
          <CardContent className="flex items-center justify-between gap-md p-md">
            <div className="min-w-0">
              <p className="truncate font-semibold text-on-surface">{member.display_name || member.full_name || '—'}</p>
              <p className="text-sm text-on-surface-variant">
                {member.role_label || member.role || 'Membro'} {member.jersey_number ? `• #${member.jersey_number}` : ''}
              </p>
            </div>
            <Badge variant={member.is_active ? 'primary' : 'outline'}>
              {member.is_active ? 'Ativo' : 'Inativo'}
            </Badge>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
