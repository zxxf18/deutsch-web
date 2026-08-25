import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { configApi } from '@/api/config'
import { progressApi } from '@/api/progress'
import { useAuthStore } from '@/stores/auth'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { ArrowRight, MapPin } from 'lucide-react'

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
    <div className="mx-auto max-w-5xl">
      <div className="mb-8 max-w-2xl"><div className="eyebrow">Personalize your learning</div><h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">选择所在联邦州</h1>
      <p className="mt-3 leading-7 text-slate-500">
        选择您居住的联邦州，以获得个性化的学习内容（含州特定题目）
      </p></div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((s) => (
          <button
            key={s.id}
            onClick={() => handleSelect(s.id)}
            disabled={updatePrefs.isPending}
            className={`group flex items-center gap-4 rounded-2xl border p-5 text-left transition ${
              currentId === s.id
                ? 'border-blue-700 bg-blue-50 text-blue-800 shadow-lg shadow-blue-900/5'
                : 'border-slate-200 bg-white hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-lg'
            }`}
          >
            <span className={`grid h-10 w-10 place-items-center rounded-xl ${currentId === s.id ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-500'}`}><MapPin size={18} /></span>
            <span className="min-w-0 flex-1"><span className="block font-bold">{s.nameCn || s.name}</span><span className="block truncate text-sm text-slate-500">{s.name}</span></span>
            <ArrowRight size={17} className="text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-blue-700" />
          </button>
        ))}
      </div>
    </div>
  )
}
