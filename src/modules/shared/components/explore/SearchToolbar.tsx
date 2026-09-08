import type { ReactNode } from 'react'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface SearchToolbarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  filters?: ReactNode
  actions?: ReactNode
}

export function SearchToolbar({ value, onChange, placeholder = 'Pesquisar clubes, competições ou atletas...', filters, actions }: SearchToolbarProps) {
  return (
    <div className="flex flex-col gap-md rounded-2xl border border-border bg-card p-md shadow-sm">
      <div className="flex flex-col md:flex-row gap-sm items-center justify-between">
        <div className="relative w-full flex-1">
          <Search className="pointer-events-none absolute left-md top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            className="h-11 pl-10 pr-10 text-sm bg-background border-border"
          />
          {value && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => onChange('')}
              className="absolute right-xs top-1/2 h-8 w-8 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {actions && <div className="flex items-center gap-xs w-full md:w-auto">{actions}</div>}
      </div>

      {filters && <div className="flex flex-wrap items-center gap-xs pt-xs border-t border-border">{filters}</div>}
    </div>
  )
}
