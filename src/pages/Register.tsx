import { useEffect } from 'react'

export function Register() {
  const target = 'https://sso.yebuluo.com.cn/signup/deutsch'
  useEffect(() => { window.location.href = target }, [])
  return <div className="surface mx-auto max-w-lg p-10 text-center"><h1 className="text-2xl font-bold text-slate-950">注册账号</h1><a className="btn-primary mt-6" href={target}>前往注册</a></div>
}
