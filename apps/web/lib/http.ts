import axios, { type AxiosError } from 'axios'

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'
const TOKEN_KEY = 'access_token'

export const getToken = (): string | null =>
  typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null

export const setToken = (token: string): void => localStorage.setItem(TOKEN_KEY, token)
export const clearToken = (): void => localStorage.removeItem(TOKEN_KEY)

// Returns the UTC timestamp (ms) when the current access token expires, or null if absent/invalid.
export function getTokenExpiry(): number | null {
  const token = getToken()
  if (!token) return null
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
    return typeof payload.exp === 'number' ? payload.exp * 1000 : null
  } catch {
    return null
  }
}

export const http = axios.create({
  baseURL: `${BASE}/api/v1`,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

http.interceptors.request.use((config) => {
  const token = getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Shared promise prevents concurrent 401s from each triggering a separate refresh
let refreshing: Promise<string> | null = null

http.interceptors.response.use(
  (res) => res,
  async (error: AxiosError<{ error?: string }>) => {
    const original = error.config as typeof error.config & { _retried?: boolean }

    if (error.response?.status === 401 && original && !original._retried) {
      original._retried = true

      if (!refreshing) {
        refreshing = axios
          .post<{ accessToken: string }>(
            `${BASE}/api/v1/auth/refresh`,
            {},
            { withCredentials: true },
          )
          .then(({ data }) => {
            setToken(data.accessToken)
            return data.accessToken
          })
          .catch((err) => {
            clearToken()
            if (typeof window !== 'undefined') window.location.href = '/login'
            throw err
          })
          .finally(() => {
            refreshing = null
          })
      }

      try {
        const token = await refreshing
        original.headers!.Authorization = `Bearer ${token}`
        return http(original)
      } catch {
        throw error
      }
    }

    const message = error.response?.data?.error ?? error.message
    throw Object.assign(new Error(message), { status: error.response?.status })
  },
)
