import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth'
import { Menu, LogOut, User, ChevronDown } from 'lucide-react'
import { useState } from 'react'

export function Header() {
  const token = useAuthStore((s) => s.token)
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const isAuthenticated = !!token
  const isAdmin = user?.role === 'admin'
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const handleLogout = async () => {
    logout?.()
    navigate('/')
    setUserMenuOpen(false)
  }

  const navLinks = [
    { to: '/trial', label: '体验练习', guestOrAdmin: true }, // 仅未登录或管理员可见
    { to: '/practice', label: '练习', auth: true },
    { to: '/mock-exam', label: '模拟考试', auth: true },
    { to: '/mistakes', label: '错题本', auth: true },
    { to: '/strategy', label: '考试攻略', auth: false },
  ]

  return (
    <header className="bg-white/95 backdrop-blur border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <Link to="/" className="font-bold text-xl text-gray-800">
            德国入籍考试
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-4">
            {navLinks.map(({ to, label, auth, guestOrAdmin }) => {
              if (guestOrAdmin && isAuthenticated && !isAdmin) return null
              if (auth && !isAuthenticated) return null
              return (
                <Link
                  key={to}
                  to={to}
                  className="text-gray-600 hover:text-gray-900 px-2"
                >
                  {label}
                </Link>
              )
            })}
            {isAdmin && (
              <>
                <Link to="/admin/users" className="text-gray-600 hover:text-gray-900 px-2">
                  用户管理
                </Link>
                <Link to="/admin/invite-codes" className="text-gray-600 hover:text-gray-900 px-2">
                  邀请码
                </Link>
              </>
            )}
          </nav>

          {/* User / Auth */}
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-100"
                >
                  <User size={18} />
                  <span className="hidden sm:inline">{user?.nickname || user?.username}</span>
                  <ChevronDown size={16} />
                </button>
                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 mt-1 w-40 bg-white rounded shadow-lg border py-1">
                      <Link
                        to="/profile"
                        className="block px-4 py-2 hover:bg-gray-50"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        个人中心
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <LogOut size={16} />
                        登出
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex gap-2">
                <Link
                  to="/login"
                  className="px-3 py-1.5 rounded border text-sm hover:bg-gray-50"
                >
                  登录
                </Link>
                <Link
                  to="/register"
                  className="px-3 py-1.5 rounded bg-blue-600 text-white text-sm hover:bg-blue-700"
                >
                  注册
                </Link>
              </div>
            )}

            {/* Mobile menu */}
            <button
              className="md:hidden p-2"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <Menu size={24} />
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {menuOpen && (
          <nav className="md:hidden py-2 border-t flex flex-col gap-1">
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
