export interface PaginationMeta {
  page: number
  pageSize: number
  total: number
  totalPages: number
  hasNextPage: boolean
}

export interface SortOptions {
  sortBy: string
  sortOrder: 'asc' | 'desc'
}

export interface FilterOptions {
  [key: string]: string | number | boolean | string[] | undefined
}

export interface QueryParams extends SortOptions, FilterOptions {
  page: number
  pageSize: number
  search?: string
}
