import * as React from 'react'
import { Search } from 'lucide-react'

export function GlobalSearch() {
  return (
    <div className="relative hidden lg:block w-64">
      <Search className="dashboard-muted absolute left-md top-1/2 w-4 h-4 -translate-y-1/2" />
      <input
        type="text"
        placeholder="Pesquisar..."
        className="dashboard-search w-full rounded-full border pl-xl pr-md py-1.5 text-xs transition-all focus:border-primary focus:ring-1 focus:ring-primary"
      />
    </div>
  )
}
