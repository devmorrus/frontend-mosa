import { apiClient } from '@/api/client'
import type {
  BackendCurrentUser,
  BackendLoginResponse,
  LoginPayload,
  LoginResponse,
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

    const user = await apiClient
      .get<BackendCurrentUser>('/auth/me', {
        headers: {
          Authorization: `Bearer ${loginResult.accessToken}`,
        },
        skipAuthRedirect: true,
        skipForbiddenRedirect: true,
      })
      .then((res) => mapCurrentUser(res.data))

    return {
      user,
      tokens: {
        accessToken: loginResult.accessToken,
        refreshToken: loginResult.refreshToken,
      },
    }
  },

  logout: () =>
    apiClient.post('/auth/logout', {
      refreshToken: tokenStorage.getRefreshToken() ?? '',
    }),

  /** Used on app boot to restore the session from a stored token. */
  me: () =>
    apiClient
      .get<BackendCurrentUser>('/auth/me', {
        skipAuthRedirect: true,
        skipForbiddenRedirect: true,
      })
      .then((res) => mapCurrentUser(res.data)),
}
