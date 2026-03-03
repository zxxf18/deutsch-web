import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { configApi } from '@/api/config'
import { progressApi } from '@/api/progress'
import { useAuthStore } from '@/stores/auth'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

export function StateSelection() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const isAuth = !!useAuthStore((s) => s.token)
  const { data: states } = useQuery({ queryKey: ['states'], queryFn: configApi.getStates })
  const { data: prefs } = useQuery({
    queryKey: ['preferences'],
    queryFn: progressApi.getPreferences,
    enabled: isAuth,
  })
  const updatePrefs = useMutation({
    mutationFn: progressApi.updatePreferences,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['preferences'] })
      toast.success('已保存')
      navigate('/')
    },
    onError: (e) => toast.error((e as Error).message),
  })

  const currentId = prefs?.preferredExamStateId || (typeof localStorage !== 'undefined' ? localStorage.getItem('preferredStateId') : null) || ''
  const items = states?.items ?? []

  const handleSelect = (id: string) => {
    if (isAuth) {
      updatePrefs.mutate({ preferredExamStateId: id })
    } else {
      localStorage.setItem('preferredStateId', id)
      toast.success('已选择，登录后可同步')
      navigate('/')
    }
  }

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">选择联邦州</h1>
      <p className="text-gray-600 mb-6">
        选择您居住的联邦州，以获得个性化的学习内容（含州特定题目）
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {items.map((s) => (
          <button
            key={s.id}
            onClick={() => handleSelect(s.id)}
            disabled={updatePrefs.isPending}
            className={`p-4 rounded-lg border text-left transition ${
              currentId === s.id
                ? 'border-blue-600 bg-blue-50 text-blue-700'
                : 'hover:border-gray-400'
            }`}
          >
            <div className="font-medium">{s.nameCn || s.name}</div>
            <div className="text-sm text-gray-500">{s.name}</div>
          </button>
        ))}
      </div>
    </div>
  )
}
