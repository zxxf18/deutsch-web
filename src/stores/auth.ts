import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/types'

interface AuthState {
  user: User | null
  token: string | null
  expires: number | null
  setAuth: (user: User, token: string, expires: number) => void
  setUser: (user: User) => void
  setToken: (token: string, expires: number) => void
  logout: () => void
  isAuthenticated: () => boolean
  isAdmin: () => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      expires: null,
      setAuth: (user, token, expires) => set({ user, token, expires }),
      setUser: (user) => set({ user }),
      setToken: (token, expires) => set({ token, expires }),
      logout: () => set({ user: null, token: null, expires: null }),
      isAuthenticated: () => !!get().token,
      isAdmin: () => get().user?.role === 'admin',
    }),
    {
      name: 'deutsch-auth',
      partialize: (s) => ({ user: s.user, token: s.token, expires: s.expires }),
    }
  )
)
