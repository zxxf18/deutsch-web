import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { authApi } from '@/api/auth'
import { toast } from 'sonner'

const schema = z.object({
  email: z.string().email('邮箱格式无效'),
  password: z.string().min(1, '请输入密码'),
})

type Form = z.infer<typeof schema>

export function Login() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const redirect = params.get('redirect') || '/'
  const { register, handleSubmit, formState } = useForm<Form>({
    resolver: zodResolver(schema),
  })
  const login = useMutation({
    mutationFn: (data: Form) => authApi.login(data.email, data.password),
    onSuccess: () => {
      toast.success('登录成功')
      navigate(redirect)
    },
    onError: (e) => toast.error((e as Error).message),
  })

  return (
    <div className="max-w-md mx-auto py-12">
      <div className="p-8 rounded-2xl border-2 border-gray-100 bg-white shadow-card">
        <h1 className="text-2xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">登录</h1>
        <p className="text-gray-500 text-sm mb-6">登录后解锁完整练习、模拟考试与错题本</p>
        <form onSubmit={handleSubmit((d) => login.mutate(d))} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
            <input
              {...register('email')}
              type="email"
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
            />
            {formState.errors.email && (
              <p className="text-red-500 text-sm mt-1">{formState.errors.email.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">密码</label>
            <input
              {...register('password')}
              type="password"
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
            />
            {formState.errors.password && (
              <p className="text-red-500 text-sm mt-1">{formState.errors.password.message}</p>
            )}
          </div>
          <button
            type="submit"
            disabled={login.isPending}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition shadow-lg hover:shadow-xl"
          >
            {login.isPending ? '登录中...' : '登录'}
          </button>
        </form>
        <p className="mt-6 text-sm text-gray-600 text-center">
          还没有账号？ <Link to="/register" className="text-blue-600 hover:text-blue-700 font-medium">注册</Link>
        </p>
      </div>
    </div>
  )
}
