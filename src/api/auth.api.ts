import { apiClient } from '@/api/client'
import type {
  BackendCurrentUser,
  BackendLoginResponse,
  BackendSidebarItem,
  LoginPayload,
  LoginResponse,
  SidebarItem,
  User,
} from '@/types/auth'
import { tokenStorage } from '@/utils/tokenStorage'

function mapCurrentUser(user: BackendCurrentUser): User {
  return {
    id: user.id,
    name: user.fullName,
    email: undefined,
    username: user.username,
    roles: user.roles,
    permissions: user.permissions,
  }
}

function mapSidebarItem(item: BackendSidebarItem): SidebarItem {
  return {
    id: item.id,
    code: item.code,
    name: item.name,
    path: item.path,
    icon: item.icon,
    sortOrder: item.sortOrder,
    children: item.children.map(mapSidebarItem),
  }
}

function authHeader(accessToken: string) {
  return {
    Authorization: `Bearer ${accessToken}`,
  }
}

async function getCurrentUser(accessToken: string): Promise<User> {
  return apiClient
    .get<BackendCurrentUser>('/auth/me', {
      headers: authHeader(accessToken),
      skipAuthRedirect: true,
      skipForbiddenRedirect: true,
    })
    .then((res) => mapCurrentUser(res.data))
}

async function getSidebar(accessToken: string): Promise<SidebarItem[]> {
  return apiClient
    .get<BackendSidebarItem[]>('/sidebar/me', {
      headers: authHeader(accessToken),
      skipAuthRedirect: true,
      skipForbiddenRedirect: true,
    })
    .then((res) => res.data.map(mapSidebarItem))
}

async function hydrateSession(accessToken: string) {
  const [user, sidebar] = await Promise.all([getCurrentUser(accessToken), getSidebar(accessToken)])
  return { user, sidebar }
}

export const authApi = {
  async login(payload: LoginPayload): Promise<LoginResponse> {
    const identity = payload.email.trim()

    const loginResult = await apiClient
      .post<BackendLoginResponse>(
        '/auth/login',
        identity.includes('@')
          ? { email: identity, password: payload.password, rememberMe: true }
          : { username: identity, password: payload.password, rememberMe: true },
        {
          skipAuthRedirect: true,
          skipForbiddenRedirect: true,
        },
      )
      .then((res) => res.data)

    const { user, sidebar } = await hydrateSession(loginResult.accessToken)

    return {
      user,
      tokens: {
        accessToken: loginResult.accessToken,
        refreshToken: loginResult.refreshToken,
      },
      sidebar,
    }
  },

  refresh: async (refreshToken?: string) => {
    const currentRefreshToken = refreshToken ?? tokenStorage.getRefreshToken()
    if (!currentRefreshToken) {
      throw new Error('Refresh token is unavailable.')
    }

    const refreshResult = await apiClient
      .post<BackendLoginResponse>(
        '/auth/refresh',
        { refreshToken: currentRefreshToken },
        {
          skipAuthRedirect: true,
          skipForbiddenRedirect: true,
        },
      )
      .then((res) => res.data)

    tokenStorage.setTokens(refreshResult.accessToken, refreshResult.refreshToken)

    return refreshResult
  },

  logout: () =>
    apiClient.post('/auth/logout', {
      refreshToken: tokenStorage.getRefreshToken() ?? '',
    }),

  me: () => getCurrentUser(tokenStorage.getAccessToken() ?? ''),

  sidebar: () => getSidebar(tokenStorage.getAccessToken() ?? ''),

  /** Used on app boot to restore the session from stored tokens. */
  async restoreSession(): Promise<LoginResponse> {
    const accessToken = tokenStorage.getAccessToken()
    if (!accessToken) {
      throw new Error('Access token is unavailable.')
    }

    try {
      const { user, sidebar } = await hydrateSession(accessToken)
      return {
        user,
        sidebar,
        tokens: {
          accessToken,
          refreshToken: tokenStorage.getRefreshToken() ?? undefined,
        },
      }
    } catch (error) {
      const apiError = error as { status?: number }
      if (apiError.status !== 401) {
        throw error
      }

      const refreshResult = await authApi.refresh()
      const { user, sidebar } = await hydrateSession(refreshResult.accessToken)

      return {
        user,
        sidebar,
        tokens: {
          accessToken: refreshResult.accessToken,
          refreshToken: refreshResult.refreshToken,
        },
      }
    }
  },
}
