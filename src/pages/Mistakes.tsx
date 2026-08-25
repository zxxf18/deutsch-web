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
    <div className="mx-auto max-w-4xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-slate-950 text-white shadow-lg">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <div className="eyebrow">Review mistakes</div><h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
              错题本
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              复习薄弱环节，巩固知识盲区
            </p>
          </div>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="surface p-10 text-center sm:p-12">
          <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 font-medium">暂无错题</p>
          <p className="text-sm text-gray-400 mt-1">练习和模拟考试中的错题会出现在这里</p>
          <Link
            to="/practice"
            className="btn-primary mt-6"
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
              className="group surface p-5 transition hover:-translate-y-0.5 hover:border-amber-200 sm:p-6"
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
