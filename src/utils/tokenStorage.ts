/**
 * Single choke point for reading/writing the auth token.
 *
 * The token itself is never hardcoded anywhere in the app — it always comes
 * from the login response and is only ever touched through these functions,
 * so swapping the storage strategy (e.g. to an httpOnly cookie handled by
 * the backend) later means editing one file, not every API call site.
 */

const ACCESS_TOKEN_KEY = 'mosa.accessToken'
const REFRESH_TOKEN_KEY = 'mosa.refreshToken'

export const tokenStorage = {
  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY)
  },
  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY)
  },
  setTokens(accessToken: string, refreshToken?: string): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
    if (refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
    }
  },
  clear(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
  },
}
