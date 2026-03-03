import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth'

export function RequireAdmin({ children }: { children: React.ReactNode }) {
  const isAdmin = useAuthStore((s) => s.user?.role === 'admin')
  if (!isAdmin) {
    return <Navigate to="/" replace />
  }
  return <>{children}</>
}
