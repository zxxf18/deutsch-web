import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { userApi } from '@/api/user'
import { authApi } from '@/api/auth'
import { useAuthStore } from '@/stores/auth'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Mail, Save, ShieldCheck, UserRound } from 'lucide-react'

const schema = z.object({
  nickname: z.string().max(50).optional(),
  description: z.string().max(500).optional(),
})
type Form = z.infer<typeof schema>

export function Profile() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const user = useAuthStore((s) => s.user)
  const setUser = useAuthStore((s) => s.setUser)
  const { data } = useQuery({
    queryKey: ['user', user?.id],
    queryFn: () => userApi.getUser(user!.id),
    enabled: !!user?.id,
  })
  const update = useMutation({
    mutationFn: userApi.updateProfile,
    onSuccess: (updatedUser) => {
      setUser(updatedUser)
      queryClient.setQueryData(['user', updatedUser.id], updatedUser)
      toast.success('已保存')
    },
    onError: (e) => toast.error((e as Error).message),
  })
  const { register, handleSubmit } = useForm<Form>({
    resolver: zodResolver(schema),
    values: data ? { nickname: data.nickname ?? '', description: (data as { description?: string }).description ?? '' } : undefined,
  })

  const u = data || user
  if (!u) return null

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-7"><div className="eyebrow">Your account</div><h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">个人中心</h1></div>
      <div className="grid gap-5 md:grid-cols-[.65fr_1.35fr]">
      <aside className="surface h-fit p-6"><div className="grid h-14 w-14 place-items-center rounded-2xl bg-slate-950 text-white"><UserRound /></div><h2 className="mt-4 text-lg font-bold text-slate-950">{u.nickname || u.username}</h2><p className="mt-1 text-sm text-slate-500">@{u.username}</p><div className="mt-5 space-y-3 border-t border-slate-100 pt-5 text-sm text-slate-600"><div className="flex items-center gap-2"><Mail size={16} />{u.email}</div>{u.role === 'admin' && <div className="flex items-center gap-2 font-semibold text-amber-700"><ShieldCheck size={16} />管理员账号</div>}</div></aside>
      <form onSubmit={handleSubmit((d) => update.mutate(d))} className="surface space-y-5 p-6 sm:p-8">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700">邮箱</label>
          <input value={u.email} className="field bg-slate-50 text-slate-500" readOnly />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700">昵称</label>
          <input {...register('nickname')} className="field" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700">简介</label>
          <textarea {...register('description')} className="field resize-none" rows={4} />
        </div>
        <button
          type="submit"
          disabled={update.isPending}
          className="btn-primary"
        >
          <Save size={17} />保存资料
        </button>
      </form></div>
      <button
        onClick={async () => {
          await authApi.logout()
          navigate('/')
        }}
        className="mt-5 text-sm font-semibold text-rose-600 hover:text-rose-800"
      >
        登出
      </button>
    </div>
  )
}
