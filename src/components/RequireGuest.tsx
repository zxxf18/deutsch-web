import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth'

/** 仅未登录用户可访问，已登录则跳转首页 */
export function RequireGuest({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user)
  if (user) return <Navigate to="/" replace />
  return <>{children}</>
}
