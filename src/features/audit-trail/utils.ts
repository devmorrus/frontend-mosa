const SENSITIVE_KEY_PATTERN = /password|token|secret|apikey|api_key|privatekey|hash/i

export function toUtcStart(date: string): string {
  const value = new Date(`${date}T00:00:00`)
  return value.toISOString()
}

export function toUtcEnd(date: string): string {
  const value = new Date(`${date}T23:59:59.999`)
  return value.toISOString()
}

export function formatDateTime(value: string): string {
  return new Date(value).toLocaleString('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

export function isSensitiveKey(key: string): boolean {
  return SENSITIVE_KEY_PATTERN.test(key)
}

export function maskValue(value: unknown): unknown {
  if (typeof value !== 'object' || value === null) return value
  if (Array.isArray(value)) return value.map(maskValue)

  const entries = Object.entries(value as Record<string, unknown>).map(([key, item]) => [key, isSensitiveKey(key) ? '***MASKED***' : maskValue(item)])
  return Object.fromEntries(entries)
}

export function flattenObject(value: unknown, prefix = '', result: Record<string, unknown> = {}): Record<string, unknown> {
  if (Array.isArray(value)) {
    result[prefix || 'value'] = value
    return result
  }

  if (typeof value !== 'object' || value === null) {
    result[prefix || 'value'] = value
    return result
  }

  for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
    const path = prefix ? `${prefix}.${key}` : key
    if (typeof item === 'object' && item !== null && !Array.isArray(item)) {
      flattenObject(item, path, result)
    } else {
      result[path] = item
    }
  }

  return result
}

export function formatReadable(value: unknown): string {
  if (value === null || value === undefined) return '-'
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  if (Array.isArray(value)) return `[${value.map(formatReadable).join(', ')}]`
  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
    if (entries.length === 0) return '{}'
    return entries.map(([key, item]) => `${key}: ${formatReadable(item)}`).join(', ')
  }
  return String(value)
}
