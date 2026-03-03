import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { progressApi } from '@/api/progress'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { BookOpen, Trash2, ArrowRight } from 'lucide-react'

export function Mistakes() {
  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: ['wrong-questions', 1],
    queryFn: () => progressApi.getWrongQuestions(1, 20),
  })
  const remove = useMutation({
    mutationFn: progressApi.removeWrongQuestion,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['wrong-questions'] }),
  })

  const items = data?.items ?? []

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-amber-200 to-orange-200" />
          <span className="text-gray-500">加载中...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              错题本
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              复习薄弱环节，巩固知识盲区
            </p>
          </div>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="p-12 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-dashed border-gray-200 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 font-medium">暂无错题</p>
          <p className="text-sm text-gray-400 mt-1">练习和模拟考试中的错题会出现在这里</p>
          <Link
            to="/practice"
            className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium hover:shadow-lg transition-all"
          >
            去练习
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((q) => (
            <div
              key={q.id}
              className="group p-6 rounded-2xl border-2 border-gray-100 bg-white shadow-card hover:shadow-card-hover hover:border-amber-100 transition-all"
            >
              <div className="flex items-start gap-4">
                <Link
                  to={`/practice?q=${q.id}`}
                  className="flex-1 min-w-0"
                >
                  <p className="text-gray-900 font-medium leading-relaxed group-hover:text-indigo-600 transition-colors line-clamp-2">
                    {q.questionCn || q.questionDe}
                  </p>
                  <span className="inline-flex items-center gap-1 mt-2 text-sm text-indigo-600 font-medium">
                    去练习
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </Link>
                <button
                  onClick={() => {
                    remove.mutate(q.id)
                    toast.success('已移出')
                  }}
                  className="flex-shrink-0 p-2 rounded-xl text-rose-500 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                  title="移出错题本"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
