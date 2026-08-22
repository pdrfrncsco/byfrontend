import * as React from 'react'
import { Search } from 'lucide-react'

interface GlobalSearchProps {
  value: string
  onChange: (value: string) => void
  onSubmit?: (value: string) => void
}

export function GlobalSearch({ value, onChange, onSubmit }: GlobalSearchProps) {
  return (
    <form
      className="relative hidden w-64 lg:block"
      role="search"
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit?.(value.trim())
      }}
    >
      <Search className="dashboard-muted pointer-events-none absolute left-md top-1/2 h-4 w-4 -translate-y-1/2" aria-hidden="true" />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        type="text"
        placeholder="Pesquisar..."
        aria-label="Pesquisar no painel"
        className="dashboard-search w-full rounded-full border pl-xl pr-md py-1.5 text-xs transition-all focus:border-primary focus:ring-1 focus:ring-primary"
      />
    </form>
  )
}
