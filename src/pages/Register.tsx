import { useEffect } from 'react'

export function Register() {
  const target = 'https://sso.yebuluo.com.cn/signup/deutsch'
  useEffect(() => { window.location.href = target }, [])
  return <div className="surface mx-auto max-w-lg p-10 text-center"><h1 className="text-2xl font-bold text-slate-950">创建夜不洛账号</h1><p className="mt-3 text-sm text-slate-500">统一使用邮箱注册并验证，无需邀请码。</p><a className="btn-primary mt-6" href={target}>前往注册</a></div>
}
