import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { progressApi } from '@/api/progress'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'

export function Exams() {
  const { data, isLoading } = useQuery({
    queryKey: ['exams', 1],
    queryFn: () => progressApi.getExams(1, 20),
  })
  const items = data?.items ?? []

  if (isLoading) return <div className="py-8">加载中...</div>

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">考试记录</h1>
      {items.length === 0 ? (
        <p className="text-gray-500">暂无记录</p>
      ) : (
        <div className="space-y-2">
          {items.map((e) => (
            <Link
              key={e.id}
              to={`/exams/${e.id}`}
              className="block p-4 rounded border bg-white hover:shadow"
            >
              <div className="flex justify-between">
                <span>
                  {e.score}/{e.total}
                  <span className={`ml-2 text-sm ${e.passed ? 'text-green-600' : 'text-red-600'}`}>
                    {e.passed ? '通过' : '未通过'}
                  </span>
                </span>
                <span className="text-sm text-gray-500">
                  {e.createdAt && format(new Date(e.createdAt), 'yyyy-MM-dd HH:mm', { locale: zhCN })}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
