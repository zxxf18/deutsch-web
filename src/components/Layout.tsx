import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { ErrorBoundary } from './ErrorBoundary'
import { useEffect } from 'react'
import { authApi } from '@/api/auth'

export function Layout() {
  useEffect(() => { void authApi.me() }, [])
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>
    </div>
  )
}
