import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRef, useState, useEffect } from 'react'
import { progressApi } from '@/api/progress'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { toast } from 'sonner'
import { QuestionOverviewPanel } from '@/components/QuestionOverviewPanel'
import { ArrowLeft, Plus } from 'lucide-react'

type QStatus = 'unanswered' | 'answered' | 'correct' | 'wrong'

export function ExamDetail() {
  const { id } = useParams<{ id: string }>()
  const queryClient = useQueryClient()
  const [scrollIndex, setScrollIndex] = useState(0)
  const refsMap = useRef<Record<number, HTMLDivElement | null>>({})
  const { data, isLoading } = useQuery({
    queryKey: ['exam', id],
    queryFn: () => progressApi.getExam(id!),
    enabled: !!id,
  })
  const addWrong = useMutation({
    mutationFn: progressApi.addWrongQuestion,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['wrong-questions'] }),
  })

  const details = data?.details ?? []
  const detailsLen = details.length

  useEffect(() => {
    if (detailsLen === 0) return
    let observer: IntersectionObserver | null = null
    const timer = setTimeout(() => {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (!e.isIntersecting) return
            const idx = Number((e.target as HTMLElement).dataset.idx)
            if (!Number.isNaN(idx)) setScrollIndex(idx)
          })
        },
        { rootMargin: '-80px 0px -50% 0px', threshold: 0 }
      )
      Object.entries(refsMap.current).forEach(([k, el]) => {
        if (el) {
          ;(el as HTMLElement).dataset.idx = k
          observer!.observe(el)
        }
      })
    }, 100)
    return () => {
      clearTimeout(timer)
      observer?.disconnect()
    }
  }, [detailsLen])

  const handleJump = (index: number) => {
    setScrollIndex(index)
    refsMap.current[index]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  if (!id || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-200 to-indigo-200" />
          <span className="text-gray-500">加载中...</span>
        </div>
      </div>
    )
  }
  if (!data) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">记录不存在</p>
      </div>
    )
  }

  const statusMap: Record<number, QStatus> = {}
  details.forEach((d, i) => {
    statusMap[i] = d.correct ? 'correct' : 'wrong'
  })

  return (
    <div className="max-w-4xl mr-[300px] max-md:mr-[240px]">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          考试结果
        </h1>
        <Link
          to="/exams"
          className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-gray-200 hover:border-blue-300 text-sm font-medium transition"
        >
          <ArrowLeft className="w-4 h-4" />
          返回列表
        </Link>
      </div>

      <div className="p-6 rounded-2xl border-2 border-gray-100 bg-white shadow-card mb-8">
        <div className="flex flex-wrap items-center gap-4 mb-2">
          <span className="text-xl font-bold text-gray-900">
            得分：{data.score} / {data.total}
          </span>
          <span
            className={`px-4 py-2 rounded-xl text-sm font-semibold ${
              data.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
            }`}
          >
            {data.passed ? '✓ 通过' : '✗ 未通过'}
          </span>
        </div>
        <div className="text-sm text-gray-500">
          {data.createdAt &&
            format(new Date(data.createdAt), 'yyyy-MM-dd HH:mm', { locale: zhCN })}
        </div>
      </div>

      <div className="space-y-6">
        {details.map((d, idx) => (
          <div
            key={d.questionId}
            ref={(el) => {
              refsMap.current[idx] = el
            }}
            className="p-6 rounded-2xl border-2 border-gray-100 bg-white shadow-sm hover:shadow-card transition-shadow scroll-mt-24"
          >
            <div className="text-sm font-medium text-indigo-600 mb-2">第 {idx + 1} 题</div>
            <div className="text-base font-medium text-gray-900 mb-4">
              {d.questionCn || d.questionDe}
            </div>
            <div className="flex flex-wrap gap-2 mb-3">
              <span
                className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                  d.correct
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                {d.correct ? '✓ 正确' : '✗ 错误'}
              </span>
              {!d.correct && d.chosenOptionCn && (
                <span className="px-3 py-1.5 rounded-lg text-sm bg-rose-50 text-rose-700">
                  你的选择: {d.chosenOptionCn}
                </span>
              )}
              {!d.correct && d.correctOptionCn && (
                <span className="px-3 py-1.5 rounded-lg text-sm bg-emerald-50 text-emerald-800">
                  正确答案: {d.correctOptionCn}
                </span>
              )}
            </div>
            {d.explanation && (
              <div className="text-sm text-gray-600 leading-relaxed p-4 rounded-xl bg-gray-50 border border-gray-100">
                {d.explanation}
              </div>
            )}
            {!d.correct && (
              <button
                onClick={() => {
                  addWrong.mutate(d.questionId)
                  toast.success('已加入错题本')
                }}
                className="mt-4 flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                <Plus className="w-4 h-4" />
                加入错题本
              </button>
            )}
          </div>
        ))}
      </div>

      {details.length > 0 && (
        <QuestionOverviewPanel
          total={details.length}
          currentIndex={scrollIndex}
          statusMap={statusMap}
          onJump={handleJump}
          mode="result"
        />
      )}
    </div>
  )
}
