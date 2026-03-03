import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { inviteCodeApi } from '@/api/invitecode'
import { toast } from 'sonner'

export function AdminInviteCodes() {
  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: ['invitecodes', 1],
    queryFn: () => inviteCodeApi.list(1, 20).then((r) => r.data),
  })
  const generate = useMutation({
    mutationFn: (count: number) => inviteCodeApi.generate(count),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['invitecodes'] }),
    onError: (e) => toast.error((e as Error).message),
  })
  const toggleEnable = useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) =>
      inviteCodeApi.enable(id, enabled),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['invitecodes'] }),
  })

  const items = data?.items ?? []

  if (isLoading) return <div className="py-8">加载中...</div>

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">邀请码管理</h1>
      <button
        onClick={() => generate.mutate(5)}
        disabled={generate.isPending}
        className="mb-4 px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {generate.isPending ? '生成中...' : '生成 5 个邀请码'}
      </button>
      <div className="overflow-x-auto">
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-50">
              <th className="p-2 text-left">邀请码</th>
              <th className="p-2 text-left">状态</th>
              <th className="p-2 text-left">过期时间</th>
              <th className="p-2">操作</th>
            </tr>
          </thead>
          <tbody>
            {items.map((ic) => (
              <tr key={ic.id} className="border-t">
                <td className="p-2 font-mono">{ic.code}</td>
                <td className="p-2">
                  {ic.usedBy ? '已使用' : ic.is_enabled ? '可用' : '禁用'}
                </td>
                <td className="p-2 text-sm text-gray-500">
                  {ic.expiresAt && new Date(ic.expiresAt).toLocaleDateString()}
                </td>
                <td className="p-2">
                  {!ic.usedBy && (
                    <button
                      onClick={() => toggleEnable.mutate({ id: ic.id, enabled: !ic.is_enabled })}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {ic.is_enabled ? '禁用' : '启用'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
