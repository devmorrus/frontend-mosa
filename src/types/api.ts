/** Generic success envelope expected from the MOSA backend. */
export interface ApiResponse<T> {
  data: T
  message?: string
}

/** Generic paginated envelope expected from list endpoints. */
export interface ApiPaginatedResponse<T> {
  items: T[]
  pagination: {
    page: number
    pageSize: number
    totalItems: number
    totalPages: number
    hasPreviousPage: boolean
    hasNextPage: boolean
  }
}

/** Normalized shape every error from the API client resolves to. */
export interface ApiError {
  status: number | null
  message: string
  /** Field-level validation errors, e.g. { email: ["already taken"] } */
  errors?: Record<string, string[]>
  code?: string
}
