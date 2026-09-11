import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth'

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user)
  const loading = useAuthStore((s) => s.loading)
  const location = useLocation()
  if (loading) return <div className="py-20 text-center text-slate-500">正在确认登录状态…</div>
  if (!user) { window.location.href = `/auth/login?return_to=${encodeURIComponent(location.pathname + location.search)}`; return null }
  return <>{children}</>
}
