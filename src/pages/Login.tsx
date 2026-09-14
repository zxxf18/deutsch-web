import { useCallback, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { authApi } from '@/api/auth'

export function Login() {
  const [params] = useSearchParams()
  const redirect = params.get('redirect') || '/'
  const [redirecting, setRedirecting] = useState(false)
  const redirectStarted = useRef(false)

  // The callback state is stored in one short-lived, HttpOnly cookie. Starting
  // several authorization requests in parallel overwrites that cookie, so a
  // delayed callback from an earlier click can never pass state validation.
  const startLogin = useCallback(() => {
    if (redirectStarted.current) return
    redirectStarted.current = true
    setRedirecting(true)
    authApi.login(redirect)
  }, [redirect])

  useEffect(() => {
    if (redirectStarted.current) return
    redirectStarted.current = true
    authApi.login(redirect)
  }, [redirect])

  return <div className="surface mx-auto max-w-lg p-10 text-center"><h1 className="text-2xl font-bold text-slate-950">正在前往夜不洛登录</h1><p className="mt-3 text-sm text-slate-500">登录后会自动回到刚才的页面。</p><button className="btn-primary mt-6 disabled:cursor-wait disabled:opacity-60" disabled={redirecting} onClick={startLogin}>{redirecting ? '正在跳转…' : '继续登录'}</button></div>
}
