import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { progressApi } from '@/api/progress'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { ArrowRight, CalendarDays, FileCheck2 } from 'lucide-react'

export function Exams() {
  const { data, isLoading } = useQuery({
    queryKey: ['exams', 1],
    queryFn: () => progressApi.getExams(1, 20),
  })
  const items = data?.items ?? []

  if (isLoading) return <div className="py-8">加载中...</div>

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-7"><div className="eyebrow">Exam history</div><h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">考试记录</h1><p className="mt-2 text-sm text-slate-500">回顾每次模拟考试表现和具体答题情况</p></div>
      {items.length === 0 ? (
        <div className="surface p-10 text-center text-slate-500">暂无考试记录</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {items.map((e) => (
            <Link
              key={e.id}
              to={`/exams/${e.id}`}
              className="group surface p-5 transition hover:-translate-y-0.5 hover:border-blue-200"
            >
              <div className="flex items-start justify-between"><div><div className="mb-4 grid h-10 w-10 place-items-center rounded-xl bg-slate-950 text-white"><FileCheck2 size={18} /></div><span className="text-2xl font-bold text-slate-950">
                  {e.score}/{e.total}
                  <span className={`ml-2 text-sm ${e.passed ? 'text-green-600' : 'text-red-600'}`}>
                    {e.passed ? '通过' : '未通过'}
                  </span>
                </span></div><ArrowRight size={18} className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-blue-700" /></div>
                <span className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-4 text-sm text-slate-500"><CalendarDays size={15} />
                  {e.createdAt && format(new Date(e.createdAt), 'yyyy-MM-dd HH:mm', { locale: zhCN })}
                </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
