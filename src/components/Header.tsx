import { Link, NavLink } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth'
import { authApi } from '@/api/auth'
import { Menu, LogOut, User, ChevronDown, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

export function Header() {
  const user = useAuthStore((s) => s.user)
  const isAuthenticated = !!user
  const isAdmin = user?.role === 'admin'
  const displayName = user?.nickname?.trim() || user?.username || user?.email || '用户'
  const userTrigger = useRef<HTMLButtonElement>(null)
  const [loggingOut, setLoggingOut] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  useEffect(() => {
    if (!userMenuOpen) return
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape') { setUserMenuOpen(false); userTrigger.current?.focus() } }
    document.addEventListener('keydown', close)
    return () => document.removeEventListener('keydown', close)
  }, [userMenuOpen])

  const handleLogout = async () => {
    setLoggingOut(true)
    try { await authApi.logout() }
    catch (error) { toast.error((error as Error).message) }
    finally { setLoggingOut(false) }
  }

  const navLinks = [
    { to: '/trial', label: '体验练习', guestOrAdmin: true }, // 仅未登录或管理员可见
    { to: '/practice', label: '练习', auth: true },
    { to: '/mock-exam', label: '模拟考试', auth: true },
    { to: '/mistakes', label: '错题本', auth: true },
    { to: '/strategy', label: '考试攻略', auth: false },
  ]

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/85 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-[4.5rem] items-center justify-between">
          <Link to="/" className="flex items-center gap-3 text-slate-950">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-slate-950 text-sm font-bold text-white shadow-lg shadow-slate-950/20">德</span>
            <span className="hidden sm:block">
              <span className="block text-[15px] font-bold leading-tight tracking-tight">Einbürgerung</span>
              <span className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">德国入籍考试</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50/80 p-1">
            {navLinks.map(({ to, label, auth, guestOrAdmin }) => {
              if (guestOrAdmin && isAuthenticated && !isAdmin) return null
              if (auth && !isAuthenticated) return null
              return (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) => `rounded-full px-3 py-1.5 text-sm font-medium transition ${isActive ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500 hover:text-slate-950'}`}
                >
                  {label}
                </NavLink>
              )
            })}
            {isAdmin && (
              <>
                <NavLink to="/admin/users" className={({ isActive }) => `rounded-full px-3 py-1.5 text-sm font-medium transition ${isActive ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500 hover:text-slate-950'}`}>
                  用户管理
                </NavLink>
                <NavLink to="/admin/invite-codes" className={({ isActive }) => `rounded-full px-3 py-1.5 text-sm font-medium transition ${isActive ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500 hover:text-slate-950'}`}>
                  邀请码
                </NavLink>
              </>
            )}
          </nav>

          {/* User / Auth */}
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  ref={userTrigger}
                  aria-expanded={userMenuOpen}
                  aria-controls="deutsch-user-menu"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300"
                >
                  <User size={18} />
                  <span className="block min-w-0 max-w-[7ch] truncate sm:max-w-[10ch]" title={displayName}>
                    {displayName}
                  </span>
                  {isAdmin && (
                    <span className="hidden lg:inline rounded-md bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-800">
                      管理员
                    </span>
                  )}
                  <ChevronDown size={16} />
                </button>
                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                    <div id="deutsch-user-menu" className="absolute right-0 z-50 mt-2 w-44 max-w-[calc(100vw-2rem)] rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl shadow-slate-900/10">
                      <Link
                        to="/profile"
                        className="block rounded-xl px-3 py-2 text-sm font-medium hover:bg-slate-50"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        用户资料
                      </Link>
                      <button
                        onClick={handleLogout}
                        disabled={loggingOut}
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-medium text-rose-600 hover:bg-rose-50"
                      >
                        <LogOut size={16} />
                        {loggingOut ? '正在退出…' : '退出登录'}
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex gap-2">
                <Link
                  to="/login"
                  className="hidden rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 hover:text-slate-950 sm:inline-flex"
                >
                  登录
                </Link>
                <Link
                  to="/register"
                  className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-slate-950/10 hover:bg-blue-800"
                >
                  注册
                </Link>
              </div>
            )}

            {/* Mobile menu */}
            <button
              className="rounded-xl p-2 text-slate-700 hover:bg-slate-100 md:hidden"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {menuOpen && (
          <nav className="flex flex-col gap-1 border-t border-slate-100 py-3 md:hidden">
            {!isAuthenticated && (
              <Link to="/login" className="px-4 py-2 font-medium text-slate-700" onClick={() => setMenuOpen(false)}>
                登录
              </Link>
            )}
            {navLinks.map(({ to, label, auth, guestOrAdmin }) => {
              if (guestOrAdmin && isAuthenticated && !isAdmin) return null
              if (auth && !isAuthenticated) return null
              return (
                <Link
                  key={to}
                  to={to}
                  className="px-4 py-2 hover:bg-gray-50"
                  onClick={() => setMenuOpen(false)}
                >
                  {label}
                </Link>
              )
            })}
            {isAdmin && (
              <>
                <Link to="/admin/users" className="px-4 py-2 hover:bg-gray-50" onClick={() => setMenuOpen(false)}>
                  用户管理
                </Link>
                <Link to="/admin/invite-codes" className="px-4 py-2 hover:bg-gray-50" onClick={() => setMenuOpen(false)}>
                  邀请码
                </Link>
              </>
            )}
          </nav>
        )}
      </div>
    </header>
  )
}
