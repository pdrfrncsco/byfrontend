import type { ReactNode } from 'react'

interface SearchToolbarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  filters?: ReactNode
  actions?: ReactNode
}

export function SearchToolbar({ value, onChange, placeholder = 'Pesquisar...', filters, actions }: SearchToolbarProps) {
  return (
    <div className="flex flex-col gap-sm rounded-xl border border-outline-variant bg-surface-container-low p-sm md:flex-row md:items-center">
      <label className="relative min-w-0 flex-1">
        <span className="material-symbols-outlined pointer-events-none absolute left-md top-1/2 -translate-y-1/2 text-lg text-on-surface-variant" aria-hidden="true">search</span>
        <span className="sr-only">{placeholder}</span>
        <input
          type="search"
          value={value}
          onChange={event => onChange(event.target.value)}
          placeholder={placeholder}
          className="h-10 w-full rounded-lg border border-transparent bg-surface-container-high pl-2xl pr-md text-sm text-on-surface outline-none placeholder:text-on-surface-variant focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </label>
      {filters && <div className="flex flex-wrap items-center gap-sm">{filters}</div>}
      {actions && <div className="flex items-center gap-sm">{actions}</div>}
    </div>
  )
}
