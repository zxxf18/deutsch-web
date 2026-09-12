import { useAuthStore } from '@/stores/auth'
import type { User } from '@/types'
import { endSSOSession } from './logout'

const BASE = `${import.meta.env.BASE_URL.replace(/\/$/, '')}/api/v1`
export const authApi = {
  me: async () => {
    const res = await fetch(BASE + '/auth/me', { credentials: 'same-origin' }).catch(() => null)
    if (!res?.ok) { useAuthStore.getState().setUser(null); return null }
    const raw = await res.json() as { sub: string; username: string; email: string; role: string; display_name: string; description: string }
    const user: User = { id: raw.sub, username: raw.username, email: raw.email, role: raw.role, nickname: raw.display_name, description: raw.description }
    useAuthStore.getState().setUser(user)
    return user
  },
  login: (redirect = window.location.pathname) => { window.location.href = `/auth/login?return_to=${encodeURIComponent(redirect)}` },
  // Hard navigation resets the store. Clearing it first would let RequireAuth
  // start another login redirect while the logout navigation is still pending.
  logout: async () => { await endSSOSession(BASE + '/auth/logout'); window.location.replace(import.meta.env.BASE_URL) },
}
