import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { env } from '@/config/env'
import { useAuthStore } from '@/stores/authStore'
import { useUiStore } from '@/stores/uiStore'
import type { ApiError } from '@/types/api'
import { resolveBusinessErrorMessage } from '@/utils/errorMessages'
import { tokenStorage } from '@/utils/tokenStorage'

/**
 * The one and only HTTP client for talking to the MOSA API.
 *
 * Every feature/page must call the backend through this instance (or a
 * thin wrapper in `src/api/*.api.ts`) instead of using `axios`/`fetch`
 * directly, so auth headers, base URL, and error handling stay in one
 * place instead of scattered across components.
 */
export const apiClient = axios.create({
  baseURL: env.apiBaseUrl,
  headers: {
    Accept: 'application/json',
  },
  timeout: 15000,
})

const refreshClient = axios.create({
  baseURL: env.apiBaseUrl,
  headers: {
    Accept: 'application/json',
  },
  timeout: 15000,
})

/** Requests some endpoints (e.g. login) intentionally skip auth/error side effects. */
declare module 'axios' {
  export interface AxiosRequestConfig {
    skipAuthRedirect?: boolean
    skipForbiddenRedirect?: boolean
    _retry?: boolean
  }
}

interface RefreshResponse {
  accessToken: string
  refreshToken: string
}

let refreshRequest: Promise<RefreshResponse> | null = null

// Attach Authorization header from centralized token storage.
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = tokenStorage.getAccessToken()
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`)
  }
  return config
})

function normalizeError(error: AxiosError): ApiError {
  const status = error.response?.status ?? null
  const body = error.response?.data as
    | {
        message?: string
        detail?: string
        title?: string
        errors?: Record<string, string[]>
        code?: string
        errorCode?: string
      }
    | undefined

  if (!error.response) {
    return {
      status: null,
      message: 'Tidak dapat menghubungi server. Periksa koneksi internet Anda.',
    }
  }

  const code = body?.code ?? body?.errorCode
  const rawMessage = body?.message ?? body?.detail ?? body?.title ?? 'Terjadi kesalahan pada server.'
  return {
    status,
    // TASKING 5: known business error codes get Indonesian user-friendly text.
    message: resolveBusinessErrorMessage(code, rawMessage),
    errors: body?.errors,
    code,
  }
}

async function refreshAccessToken(): Promise<RefreshResponse> {
  const refreshToken = tokenStorage.getRefreshToken()
  if (!refreshToken) {
    throw new Error('Refresh token is unavailable.')
  }

  if (!refreshRequest) {
    refreshRequest = refreshClient
      .post<RefreshResponse>('/auth/refresh', { refreshToken })
      .then((response) => {
        tokenStorage.setTokens(response.data.accessToken, response.data.refreshToken)
        return response.data
      })
      .finally(() => {
        refreshRequest = null
      })
  }

  return refreshRequest
}

// Centralized error handling: normalize every error, react to 401/403,
// and surface everything else as a toast so pages don't each build their
// own error UI.
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const apiError = normalizeError(error)
    const skipAuthRedirect = error.config?.skipAuthRedirect
    const skipForbiddenRedirect = error.config?.skipForbiddenRedirect
    const originalRequest = error.config

    if (apiError.status === 401 && !skipAuthRedirect && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true

      return refreshAccessToken()
        .then(({ accessToken }) => {
          originalRequest.headers.set('Authorization', `Bearer ${accessToken}`)
          return apiClient(originalRequest)
        })
        .catch(() => {
          useAuthStore.getState().clearSession()
          useUiStore.getState().pushToast('error', 'Sesi Anda berakhir. Silakan login kembali.')
          if (window.location.pathname !== '/login') {
            window.location.assign('/login')
          }

          return Promise.reject(apiError)
        })
    }

    if (apiError.status === 401 && !skipAuthRedirect) {
      useAuthStore.getState().clearSession()
      useUiStore.getState().pushToast('error', 'Sesi Anda berakhir. Silakan login kembali.')
      if (window.location.pathname !== '/login') {
        window.location.assign('/login')
      }
    } else if (apiError.status === 403 && !skipForbiddenRedirect) {
      useUiStore
        .getState()
        .pushToast('error', 'Anda tidak memiliki izin untuk melakukan aksi ini.')
      if (window.location.pathname !== '/403') {
        window.location.assign('/403')
      }
    } else if (apiError.status === null || apiError.status >= 500) {
      useUiStore.getState().pushToast('error', apiError.message)
    }

    return Promise.reject(apiError)
  },
)
