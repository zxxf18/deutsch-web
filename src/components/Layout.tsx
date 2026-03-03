import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { ErrorBoundary } from './ErrorBoundary'

export function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6 max-w-4xl">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>
    </div>
  )
}
