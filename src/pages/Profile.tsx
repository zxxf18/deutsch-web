import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { userApi } from '@/api/user'
import { authApi } from '@/api/auth'
import { useAuthStore } from '@/stores/auth'
import { useState } from 'react'
import { toast } from 'sonner'
import { LogOut, Mail, Save, ShieldCheck, UserRound } from 'lucide-react'

const schema = z.object({
  nickname: z.string().max(50).optional(),
  description: z.string().max(500).optional(),
})
type Form = z.infer<typeof schema>

export function Profile() {
  const [loggingOut, setLoggingOut] = useState(false)
  const queryClient = useQueryClient()
  const user = useAuthStore((s) => s.user)
  const setUser = useAuthStore((s) => s.setUser)
  const { data, isError, error, isPending } = useQuery({
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
  const { register, handleSubmit, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
    values: data ? { nickname: data.nickname ?? '', description: data.description ?? '' } : undefined,
  })

  const u = data || user
  if (!u) return null

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-7"><div className="eyebrow">Your account</div><h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">个人中心</h1></div>
      <div className="grid gap-5 md:grid-cols-[minmax(0,.65fr)_minmax(0,1.35fr)]">
      <aside className="surface min-w-0 h-fit p-6">
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-slate-950 text-white"><UserRound /></div>
        <h2 className="mt-4 truncate text-lg font-bold text-slate-950" title={u.nickname || u.username}>{u.nickname || u.username}</h2>
        <p className="mt-1 truncate text-sm text-slate-500" title={u.username}>@{u.username}</p>
        <div className="mt-5 space-y-3 border-t border-slate-100 pt-5 text-sm text-slate-600">
          <div className="flex min-w-0 items-start gap-2"><Mail size={16} className="mt-0.5 shrink-0" /><span className="truncate" title={u.email}>{u.email}</span></div>
          {u.role === 'admin' && <div className="flex items-center gap-2 font-semibold text-amber-700"><ShieldCheck size={16} />管理员账号</div>}
        </div>
        <button disabled={loggingOut} onClick={async () => {
          setLoggingOut(true)
          try { await authApi.logout() } catch (cause) { toast.error((cause as Error).message) } finally { setLoggingOut(false) }
        }} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-bold text-rose-700 transition hover:border-rose-300 hover:bg-rose-100"><LogOut size={16} />{loggingOut ? '正在退出…' : '退出登录'}</button>
      </aside>
      <form onSubmit={handleSubmit((d) => update.mutate(d))} className="surface min-w-0 space-y-5 p-6 sm:p-8">
        {isError && <p role="alert" className="text-sm text-rose-700">资料加载失败：{(error as Error).message}</p>}
        <div>
          <label htmlFor="profile-email" className="mb-1.5 block text-sm font-semibold text-slate-700">邮箱</label>
          <input id="profile-email" value={u.email} className="field bg-slate-50 text-slate-500" readOnly />
        </div>
        <div>
          <label htmlFor="profile-nickname" className="mb-1.5 block text-sm font-semibold text-slate-700">昵称</label>
          <input id="profile-nickname" {...register('nickname')} disabled={isPending || isError} maxLength={50} className="field" />
          {errors.nickname && <p role="alert" className="text-sm text-rose-700">昵称最多 50 个字符</p>}
        </div>
        <div>
          <label htmlFor="profile-description" className="mb-1.5 block text-sm font-semibold text-slate-700">简介</label>
          <textarea id="profile-description" {...register('description')} disabled={isPending || isError} maxLength={500} className="field resize-none" rows={4} />
          {errors.description && <p role="alert" className="text-sm text-rose-700">简介最多 500 个字符</p>}
        </div>
        <button
          type="submit"
          disabled={update.isPending || isPending || isError}
          className="btn-primary"
        >
          <Save size={17} />保存资料
        </button>
      </form></div>
    </div>
  )
}
