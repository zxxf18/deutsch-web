import { create } from 'zustand'
import type { User } from '@/types'

interface AuthState { user: User | null; loading: boolean; setUser: (user: User | null) => void; setLoading: (loading: boolean) => void; logout: () => void; isAuthenticated: () => boolean; isAdmin: () => boolean }
export const useAuthStore = create<AuthState>((set, get) => ({
  user: null, loading: true,
  setUser: (user) => set({ user, loading: false }), setLoading: (loading) => set({ loading }),
  logout: () => set({ user: null, loading: false }), isAuthenticated: () => !!get().user, isAdmin: () => get().user?.role === 'admin',
}))
