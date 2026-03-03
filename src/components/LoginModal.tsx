import { Link } from 'react-router-dom'

interface LoginModalProps {
  open: boolean
  onClose: () => void
  redirect?: string
}

export function LoginModal({ open, onClose, redirect }: LoginModalProps) {
  if (!open) return null
  const to = redirect ? `/login?redirect=${encodeURIComponent(redirect)}` : '/login'
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl p-6 max-w-sm w-full mx-4">
        <h3 className="text-lg font-semibold mb-2">需要登录</h3>
        <p className="text-gray-600 text-sm mb-4">
          登录后解锁全部题目、保存学习进度并参加模拟考试
        </p>
        <div className="flex gap-3">
          <Link
            to={to}
            className="flex-1 py-2 rounded bg-blue-600 text-white text-center hover:bg-blue-700"
          >
            去登录
          </Link>
          <Link
            to="/register"
            className="flex-1 py-2 rounded border text-center hover:bg-gray-50"
          >
            去注册
          </Link>
        </div>
        <button onClick={onClose} className="mt-3 w-full py-1 text-gray-500 text-sm">
          取消
        </button>
      </div>
    </div>
  )
}
