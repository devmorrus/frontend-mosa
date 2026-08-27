/** Generic success envelope expected from the MOSA backend. */
export interface ApiResponse<T> {
  data: T
  message?: string
}

/** Generic paginated envelope expected from list endpoints. */
export interface ApiPaginatedResponse<T> {
  data: T[]
  meta: {
    currentPage: number
    perPage: number
    total: number
    lastPage: number
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
