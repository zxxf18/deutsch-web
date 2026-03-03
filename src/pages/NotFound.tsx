import { Link } from 'react-router-dom'

export function NotFound() {
  return (
    <div className="text-center py-16">
      <h1 className="text-2xl font-bold text-gray-500">404</h1>
      <p className="mt-2 text-gray-500">页面不存在</p>
      <Link to="/" className="mt-4 inline-block text-blue-600 hover:underline">
        返回首页
      </Link>
    </div>
  )
}
