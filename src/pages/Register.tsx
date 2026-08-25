import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { authApi } from '@/api/auth'
import { toast } from 'sonner'

const schema = z.object({
  username: z.string().trim().min(6, '用户名至少6位').max(50, '用户名最多50位').refine((value) => !value.includes('@'), '用户名不能包含 @'),
  email: z.string().email('邮箱格式无效'),
  password: z.string().min(8, '密码至少8位'),
  invite_code: z.string().min(1, '请输入邀请码'),
  nickname: z.string().max(50, '昵称最多50位').optional(),
})
type Form = z.infer<typeof schema>

export function Register() {
  const navigate = useNavigate()
  const { register, handleSubmit, formState } = useForm<Form>({ resolver: zodResolver(schema) })
  const registerFn = useMutation({
    mutationFn: authApi.register,
    onSuccess: () => { toast.success('注册成功'); navigate('/') },
    onError: (error) => toast.error((error as Error).message),
  })

  return (
    <div className="surface mx-auto max-w-2xl p-7 sm:p-10">
      <div className="eyebrow">Create account</div>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">创建学习账号</h1>
      <p className="mt-2 text-sm text-slate-500">使用有效邀请码注册，学习记录会在登录后自动同步。</p>
      <form onSubmit={handleSubmit((data) => registerFn.mutate(data))} className="mt-7 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="用户名" error={formState.errors.username?.message}><input {...register('username')} autoComplete="username" className="field" placeholder="至少 6 位，不可包含 @" /></Field>
          <Field label="邮箱" error={formState.errors.email?.message}><input {...register('email')} type="email" autoComplete="email" className="field" placeholder="name@example.com" /></Field>
        </div>
        <Field label="密码" error={formState.errors.password?.message}><input {...register('password')} type="password" autoComplete="new-password" className="field" placeholder="至少 8 位" /></Field>
        <Field label="邀请码" error={formState.errors.invite_code?.message}><input {...register('invite_code')} className="field font-mono tracking-wider" placeholder="请输入有效邀请码" /></Field>
        <Field label="昵称（可选）" error={formState.errors.nickname?.message}><input {...register('nickname')} className="field" placeholder="展示给自己的称呼" /></Field>
        <button type="submit" disabled={registerFn.isPending} className="btn-primary w-full">{registerFn.isPending ? '注册中...' : '创建账号'}</button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-500">已有账号？ <Link to="/login" className="font-semibold text-blue-700 hover:text-blue-900">直接登录</Link></p>
    </div>
  )
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return <div><label className="mb-1.5 block text-sm font-semibold text-slate-700">{label}</label>{children}{error && <p className="mt-1 text-sm text-rose-600">{error}</p>}</div>
}
