import { Link } from 'react-router-dom'

interface EntityCardProps {
  href: string
  title: string
  description: string
  icon?: string
  eyebrow?: string
  meta?: string
}

export function EntityCard({ href, title, description, icon = 'arrow_forward', eyebrow, meta }: EntityCardProps) {
  return (
    <Link to={href} className="group flex min-h-48 flex-col rounded-2xl border border-outline-variant bg-surface-container-low p-xl transition-all hover:-translate-y-1 hover:border-primary/50 hover:bg-surface-container-high focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
      <div className="flex items-start justify-between gap-md">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <span className="material-symbols-outlined text-2xl" aria-hidden="true">{icon}</span>
        </span>
        <span className="material-symbols-outlined text-on-surface-variant transition-transform group-hover:translate-x-1 group-hover:text-primary" aria-hidden="true">arrow_forward</span>
      </div>
      <div className="mt-auto pt-xl">
        {eyebrow && <p className="mb-xs text-xs font-bold uppercase tracking-wider text-primary">{eyebrow}</p>}
        <h3 className="text-xl font-bold text-on-surface group-hover:text-primary">{title}</h3>
        <p className="mt-sm text-sm leading-relaxed text-on-surface-variant">{description}</p>
        {meta && <p className="mt-md text-xs font-semibold text-on-surface-variant">{meta}</p>}
      </div>
    </Link>
  )
}
