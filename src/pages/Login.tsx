import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { ArrowRight, CheckCircle2, LockKeyhole, UserRound } from 'lucide-react'
import { authApi } from '@/api/auth'
import { toast } from 'sonner'

const schema = z.object({ account: z.string().trim().min(1, '请输入用户名或邮箱'), password: z.string().min(1, '请输入密码') })
type Form = z.infer<typeof schema>

export function Login() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const redirect = params.get('redirect') || '/'
  const { register, handleSubmit, formState } = useForm<Form>({ resolver: zodResolver(schema) })
  const login = useMutation({
    mutationFn: (data: Form) => authApi.login(data.account, data.password),
    onSuccess: () => { toast.success('登录成功'); navigate(redirect) },
    onError: (error) => toast.error((error as Error).message),
  })

  return (
    <div className="mx-auto grid max-w-5xl overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_30px_100px_-45px_rgba(15,23,42,.55)] lg:grid-cols-[.9fr_1.1fr]">
      <aside className="relative overflow-hidden bg-slate-950 p-8 text-white sm:p-10">
        <div className="absolute -bottom-24 -right-24 h-64 w-64 rounded-full border border-amber-300/20" />
        <div className="eyebrow !text-amber-300">Welcome back</div>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight">继续你的备考进度</h1>
        <p className="mt-4 leading-7 text-slate-300">每一次练习都会沉淀为进度、错题与模拟考试记录。</p>
        <div className="mt-10 space-y-4 text-sm text-slate-200">
          {['用户名或邮箱均可登录', '自动同步学习进度', '集中复盘错题与考试记录'].map((item) => <div key={item} className="flex items-center gap-3"><CheckCircle2 size={17} className="text-amber-300" />{item}</div>)}
        </div>
      </aside>
      <div className="p-8 sm:p-10 lg:p-12">
        <div className="eyebrow">Account access</div>
        <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">登录账号</h2>
        <p className="mt-2 text-sm text-slate-500">使用注册用户名或邮箱地址登录</p>
        <form onSubmit={handleSubmit((data) => login.mutate(data))} className="space-y-4">
          <div className="pt-5">
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">用户名或邮箱</label>
            <div className="relative"><UserRound className="absolute left-4 top-3.5 text-slate-400" size={18} /><input {...register('account')} autoComplete="username" className="field pl-11" placeholder="请输入用户名或邮箱" /></div>
            {formState.errors.account && <p className="mt-1 text-sm text-rose-600">{formState.errors.account.message}</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">密码</label>
            <div className="relative"><LockKeyhole className="absolute left-4 top-3.5 text-slate-400" size={18} /><input {...register('password')} type="password" autoComplete="current-password" className="field pl-11" placeholder="请输入密码" /></div>
            {formState.errors.password && <p className="mt-1 text-sm text-rose-600">{formState.errors.password.message}</p>}
          </div>
          <button type="submit" disabled={login.isPending} className="btn-primary mt-2 w-full">{login.isPending ? '登录中...' : <>登录 <ArrowRight size={18} /></>}</button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-500">还没有账号？ <Link to="/register" className="font-semibold text-blue-700 hover:text-blue-900">创建账号</Link></p>
      </div>
    </div>
  )
}
