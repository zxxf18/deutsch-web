import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { authApi } from '@/api/auth'

export function Login() {
  const [params] = useSearchParams()
  const redirect = params.get('redirect') || '/'
  useEffect(() => { authApi.login(redirect) }, [redirect])
  return <div className="surface mx-auto max-w-lg p-10 text-center"><h1 className="text-2xl font-bold text-slate-950">正在前往夜不洛登录</h1><p className="mt-3 text-sm text-slate-500">登录后会自动回到刚才的页面。</p><button className="btn-primary mt-6" onClick={() => authApi.login(redirect)}>继续登录</button></div>
}
