export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
  errors?: Record<string, string[]>
}

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export interface PaginationParams {
  page?: number
  page_size?: number
  ordering?: string
  search?: string
}

export interface ApiError {
  success: boolean
  message: string
  errors: Record<string, string[]>
}
