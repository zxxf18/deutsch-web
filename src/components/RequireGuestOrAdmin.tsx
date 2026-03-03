import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth'

/** 仅未登录用户或管理员可访问，已登录的普通用户跳转首页 */
export function RequireGuestOrAdmin({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token)
  const user = useAuthStore((s) => s.user)
  const isAdmin = user?.role === 'admin'
  if (token && !isAdmin) return <Navigate to="/" replace />
  return <>{children}</>
}
