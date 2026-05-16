'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { api } from './api'
import { getToken, setToken, clearToken } from './http'
import type { User } from '@/types'

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

type AuthState = {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function init() {
      let token = getToken()

      if (!token) {
        try {
          const { data } = await axios.post<{ accessToken: string }>(
            `${BASE}/api/v1/auth/refresh`,
            {},
            { withCredentials: true },
          )
          setToken(data.accessToken)
          token = data.accessToken
        } catch {
          setIsLoading(false)
          return
        }
      }

      try {
        const me = await api.get<User>('/users/me')
        setUser(me)
      } catch {
        clearToken()
      }

      setIsLoading(false)
    }

    init()
  }, [])

  async function login(email: string, password: string) {
    const { data } = await axios
      .post<{ accessToken: string; user: User }>(
        `${BASE}/api/v1/auth/login`,
        { email, password },
        { withCredentials: true },
      )
      .catch((err) => {
        const message = err.response?.data?.error ?? 'Login failed'
        throw new Error(message)
      })

    setToken(data.accessToken)
    setUser(data.user)
    router.push('/dashboard')
  }

  async function logout() {
    await axios
      .post(`${BASE}/api/v1/auth/logout`, {}, { withCredentials: true })
      .catch(() => {})
    clearToken()
    setUser(null)
    router.push('/login')
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
