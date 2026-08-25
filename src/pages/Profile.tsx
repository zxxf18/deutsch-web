import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { userApi } from '@/api/user'
import { authApi } from '@/api/auth'
import { useAuthStore } from '@/stores/auth'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

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
    <div>
      <h1 className="text-xl font-bold mb-4">个人中心</h1>
      <form onSubmit={handleSubmit((d) => update.mutate(d))} className="space-y-4 max-w-md">
        <div>
          <label className="block text-sm text-gray-600 mb-1">邮箱</label>
          <input value={u.email} className="w-full px-3 py-2 border rounded bg-gray-50" readOnly />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">昵称</label>
          <input {...register('nickname')} className="w-full px-3 py-2 border rounded" />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">简介</label>
          <textarea {...register('description')} className="w-full px-3 py-2 border rounded" rows={3} />
        </div>
        <button
          type="submit"
          disabled={update.isPending}
          className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          保存
        </button>
      </form>
      <button
        onClick={async () => {
          await authApi.logout()
          navigate('/')
        }}
        className="mt-6 px-4 py-2 rounded border text-red-600 hover:bg-red-50"
      >
        登出
      </button>
    </div>
  )
}
