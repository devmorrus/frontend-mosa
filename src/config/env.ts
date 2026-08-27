/**
 * Centralized environment configuration.
 *
 * Nothing outside this file should read `import.meta.env` directly.
 * That keeps every environment-dependent value (API URL, env name, ...)
 * declared in one place and makes it obvious, at a glance, that no
 * secret or URL is hardcoded in application code.
 */

function readEnv(key: string, fallback?: string): string {
  const value = import.meta.env[key] as string | undefined

  if (!value) {
    if (fallback !== undefined) return fallback

    // Fail loudly during development instead of silently calling a
    // wrong/undefined URL.
    throw new Error(
      `Missing required environment variable: ${key}. Did you copy .env.example to .env?`,
    )
  }

  return value
}

export const env = {
  apiBaseUrl: readEnv('VITE_API_BASE_URL'),
  appEnv: readEnv('VITE_APP_ENV', 'local'),
  isProduction: import.meta.env.PROD,
} as const
