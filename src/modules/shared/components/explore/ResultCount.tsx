interface ResultCountProps {
  count: number
  label?: string
}

export function ResultCount({ count, label = 'resultados encontrados' }: ResultCountProps) {
  return <p aria-live="polite" className="text-sm text-on-surface-variant"><span className="font-semibold text-on-surface">{count}</span> {label}</p>
}
