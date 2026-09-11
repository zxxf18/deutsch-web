import { useAuthStore } from '@/stores/auth'
import type { User } from '@/types'

const BASE = `${import.meta.env.BASE_URL.replace(/\/$/, '')}/api/v1`
export const authApi = {
  me: async () => { const res = await fetch(BASE + '/auth/me', { credentials: 'same-origin' }).catch(() => null); if (!res?.ok) { useAuthStore.getState().setUser(null); return null }; const raw = await res.json() as { sub: string; username: string; email: string; role: string; display_name: string }; const user: User = { id: raw.sub, username: raw.username, email: raw.email, role: raw.role, nickname: raw.display_name }; useAuthStore.getState().setUser(user); return user },
  login: (redirect = window.location.pathname) => { window.location.href = `/auth/login?return_to=${encodeURIComponent(redirect)}` },
  logout: async () => { await fetch(BASE + '/auth/logout', { method: 'POST', credentials: 'same-origin' }).catch(() => {}); useAuthStore.getState().logout() },
}
