import { api } from '@/lib/api'
import { useAuthStore } from '@/stores/auth'
import type { User } from '@/types'

interface AuthData {
  id?: string
  username?: string
  email?: string
  role?: string
  nickname?: string
  jwt_token: string
  expires: number
  max_refresh: number
}

export const authApi = {
  login: async (account: string, password: string) => {
    const res = await api.post<AuthData>('/auth/login', { account, password })
    const d = res.data
    const user: User = {
      id: d.id!,
      username: d.username || '',
      email: d.email || '',
      role: d.role || 'user',
      nickname: d.nickname,
    }
    useAuthStore.getState().setAuth(user, d.jwt_token, d.expires)
    return res
  },
  register: async (data: {
    email: string
    password: string
    invite_code: string
    username?: string
    nickname?: string
  }) => {
    const res = await api.post<AuthData>('/auth/register', data)
    const d = res.data
    const user: User = {
      id: d.id!,
      username: d.username || '',
      email: d.email || '',
      role: d.role || 'user',
      nickname: d.nickname,
    }
    useAuthStore.getState().setAuth(user, d.jwt_token, d.expires)
    return res
  },
  logout: async () => {
    await api.post('/auth/logout').catch(() => {})
    useAuthStore.getState().logout()
  },
  refresh: () => api.post<{ jwt_token: string; expires: number }>('/auth/jwt/refresh'),
}
