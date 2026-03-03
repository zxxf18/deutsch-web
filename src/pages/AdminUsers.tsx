import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { userApi } from '@/api/user'
import { toast } from 'sonner'

export function AdminUsers() {
  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: ['users', 1],
    queryFn: () => userApi.list(1, 20).then((r) => r.data),
  })
  const enable = useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) =>
      userApi.enable(id, enabled),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
    onError: (e) => toast.error((e as Error).message),
  })
  const del = useMutation({
    mutationFn: userApi.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
    onError: (e) => toast.error((e as Error).message),
  })

  const items = data?.items ?? []

  if (isLoading) return <div className="py-8">加载中...</div>

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">用户管理</h1>
      <div className="overflow-x-auto">
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-50">
              <th className="p-2 text-left">邮箱</th>
              <th className="p-2 text-left">用户名</th>
              <th className="p-2 text-left">角色</th>
              <th className="p-2 text-left">状态</th>
              <th className="p-2">操作</th>
            </tr>
          </thead>
          <tbody>
            {items.map((u) => (
              <tr key={u.id} className="border-t">
                <td className="p-2">{u.email}</td>
                <td className="p-2">{u.username}</td>
                <td className="p-2">{u.role}</td>
                <td className="p-2">
                  {(u as { is_enabled?: boolean }).is_enabled !== false ? '启用' : '禁用'}
                </td>
                <td className="p-2">
                  <button
                    onClick={() => enable.mutate({ id: u.id, enabled: (u as { is_enabled?: boolean }).is_enabled === false })}
                    className="text-sm text-blue-600 mr-2 hover:underline"
                  >
                    {(u as { is_enabled?: boolean }).is_enabled === false ? '启用' : '禁用'}
                  </button>
                  <button
                    onClick={() => del.mutate(u.id)}
                    className="text-sm text-red-600 hover:underline"
                  >
                    删除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
