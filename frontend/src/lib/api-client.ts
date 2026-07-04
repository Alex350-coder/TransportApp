/** Typed fetch wrapper for the RUTEX API envelope, with JWT auto-refresh. */
import type { ApiError, Envelope, TokenPair } from '@/types/api'

export const API_BASE_URL: string =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api/v1'

const ACCESS_TOKEN_KEY = 'rutex.access'
const REFRESH_TOKEN_KEY = 'rutex.refresh'

export class ApiRequestError extends Error {
  readonly code: string
  readonly status: number
  readonly fields: Record<string, string[]> | null

  constructor(error: ApiError, status: number) {
    super(error.detail)
    this.name = 'ApiRequestError'
    this.code = error.code
    this.status = status
    this.fields = error.fields ?? null
  }
}

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

export function setTokens(tokens: { access: string; refresh?: string }): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, tokens.access)
  if (tokens.refresh) {
    localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh)
  }
}

export function clearTokens(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
}

interface ApiFetchOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  body?: unknown
  /** Skip the Authorization header even when a token exists. */
  anonymous?: boolean
  /** Internal: true when retrying after a token refresh. */
  isRetry?: boolean
}

const NETWORK_ERROR: ApiError = {
  detail: 'No pudimos conectar con el servidor. Revisa tu conexión.',
  code: 'network_error',
}

const UNEXPECTED_ERROR: ApiError = {
  detail: 'Ocurrió un error inesperado. Inténtalo de nuevo.',
  code: 'unexpected_error',
}

async function refreshTokens(): Promise<boolean> {
  const refresh = getRefreshToken()
  if (!refresh) return false

  try {
    const response = await fetch(`${API_BASE_URL}/auth/token/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh }),
    })
    if (!response.ok) return false
    const envelope = (await response.json()) as Envelope<TokenPair>
    if (!envelope.data) return false
    setTokens(envelope.data)
    return true
  } catch {
    return false
  }
}

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { method = 'GET', body, anonymous = false, isRetry = false } = options

  const headers: Record<string, string> = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  const access = getAccessToken()
  if (!anonymous && access) headers.Authorization = `Bearer ${access}`

  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new ApiRequestError(NETWORK_ERROR, 0)
  }

  let envelope: Envelope<T>
  try {
    envelope = (await response.json()) as Envelope<T>
  } catch {
    throw new ApiRequestError(UNEXPECTED_ERROR, response.status)
  }

  if (response.ok) {
    return envelope.data as T
  }

  if (response.status === 401 && !isRetry && !anonymous && getRefreshToken()) {
    const refreshed = await refreshTokens()
    if (refreshed) {
      return apiFetch<T>(path, { ...options, isRetry: true })
    }
    clearTokens()
  }

  throw new ApiRequestError(envelope.error ?? UNEXPECTED_ERROR, response.status)
}
