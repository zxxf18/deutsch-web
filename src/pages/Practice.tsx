import { useState, useEffect, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { questionApi } from '@/api/question'
import { progressApi } from '@/api/progress'
import { configApi } from '@/api/config'
import type { QuestionItem } from '@/types'
import { ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react'
import { QuestionOption } from '@/components/QuestionOption'
import { QuestionOverviewPanel } from '@/components/QuestionOverviewPanel'
import { toast } from 'sonner'

type QStatus = 'unanswered' | 'answered' | 'correct' | 'wrong'

export function Practice() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const qId = searchParams.get('q')
  const { data: prefs } = useQuery({ queryKey: ['preferences'], queryFn: progressApi.getPreferences })
  const { data: states } = useQuery({ queryKey: ['states'], queryFn: configApi.getStates })
  const stateId = prefs?.preferredExamStateId
  const stateSlug = states?.items?.find((s) => s.id === stateId)?.slug
  const useGeneral = !stateId || stateSlug === 'general'

  const { data: generalData } = useQuery({
    queryKey: ['questions', 'general'],
    queryFn: () => questionApi.getGeneral().then((r) => r.data),
  })
  const { data: stateData } = useQuery({
    queryKey: ['questions', 'state', stateId!],
    queryFn: () => questionApi.getByState(stateId!).then((r) => r.data),
    enabled: !!stateId && !useGeneral,
  })

  const items = useMemo(() => {
    const generalItems = (generalData as { items?: QuestionItem[] })?.items ?? []
    const stateItems = (stateData as { items?: QuestionItem[] })?.items ?? []
    return useGeneral ? generalItems : [...generalItems, ...stateItems]
  }, [generalData, stateData, useGeneral])
  const isLoading = !generalData || (!useGeneral && !!stateId && !stateData)
  const recordPractice = useMutation({
    mutationFn: ({ questionId, correct }: { questionId: string; correct: boolean }) =>
      progressApi.recordPractice(questionId, correct),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['learning'] }),
    onError: (error) => toast.error((error as Error).message),
  })

  const [idx, setIdx] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [answerStatus, setAnswerStatus] = useState<Record<number, QStatus>>({})

  useEffect(() => {
    if (qId && items.length > 0) {
      const found = items.findIndex((it) => it.id === qId)
      // URL 中的题目参数是外部导航状态，需要在题库加载完成后同步一次。
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (found >= 0) setIdx(found)
    }
  }, [qId, items])

  const q = items[idx]
  const langMode = 'de-cn'

  const handleSelect = (i: number) => {
    if (showResult) return
    setSelected(i)
  }
  const handleConfirm = () => {
    if (selected == null || !q) return
    const correct = selected === q.correctAnswer
    recordPractice.mutate(
      { questionId: q.id, correct },
      {
        onSuccess: () => {
          if (!correct) queryClient.invalidateQueries({ queryKey: ['wrong-questions'] })
          setAnswerStatus((s) => ({ ...s, [idx]: correct ? 'correct' : 'wrong' }))
          setShowResult(true)
        },
      }
    )
  }
  const handleNext = () => {
    setIdx((i) => Math.min(i + 1, items.length - 1))
    setSelected(null)
    setShowResult(false)
  }
  const handlePrev = () => {
    setIdx((i) => Math.max(i - 1, 0))
    setSelected(null)
    setShowResult(false)
  }
  const handleJump = (index: number) => {
    if (index < 0 || index >= items.length) return
    setIdx(index)
    setSelected(null)
    setShowResult(false)
    navigate(`/practice?q=${items[index].id}`, { replace: true })
  }

  const statusMap: Record<number, QStatus> = {}
  items.forEach((_, i) => {
    statusMap[i] = answerStatus[i] ?? (i === idx && selected !== null ? 'answered' : 'unanswered')
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-200 to-indigo-200" />
          <span className="text-gray-500">加载中...</span>
        </div>
      </div>
    )
  }
  if (items.length === 0) {
    return (
      <div className="text-center py-16 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100">
        <p className="text-gray-500">暂无题目</p>
      </div>
    )
  }

  return (
    <div className="grid items-start gap-6 pb-28 lg:grid-cols-[minmax(0,1fr)_18rem] lg:pb-0">
    <div className="min-w-0">
      <div className="mb-6 surface p-5 sm:p-6">
        <div className="eyebrow">Focused practice</div>
        <div className="mt-2 flex items-end justify-between gap-4"><div><h1 className="text-2xl font-bold tracking-tight text-slate-950">系统练习</h1><p className="mt-1 text-sm text-slate-500">逐题确认答案，即时获得结果与解析</p></div><span className="shrink-0 text-sm font-bold tabular-nums text-slate-600">{idx + 1} / {items.length}</span></div>
        <div className="flex items-center gap-4">
          <div className="mt-5 h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-blue-700 transition-all duration-500"
              style={{ width: `${((idx + 1) / items.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="surface mb-5 p-5 sm:p-8">
        <div className="mb-4 inline-flex rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-blue-800">Question {String(idx + 1).padStart(2, '0')}</div>
        <div className="mb-7 text-lg font-semibold leading-8 text-slate-950 sm:text-xl">
          {langMode === 'de-cn' ? q.questionCn : q.questionDe}
        </div>
        <div className="space-y-3">
          {(langMode === 'de-cn' ? q.optionsCn : q.optionsDe).map((opt, i) => (
            <QuestionOption
              key={i}
              index={i}
              label={opt}
              imagePath={q.optionsImagePath?.[i]}
              selected={selected === i}
              showResult={showResult}
              isCorrect={i === q.correctAnswer}
              isChosenCorrect={selected === i && i === q.correctAnswer}
              onClick={() => handleSelect(i)}
              disabled={showResult}
            />
          ))}
        </div>
      </div>

      {showResult && q.explanation && (
        <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:p-6">
          <div className="flex items-center gap-2 text-sm font-semibold text-amber-800 mb-2">
            <CheckCircle2 className="w-4 h-4" />
            解析
          </div>
          <div className="text-gray-700 leading-relaxed">{q.explanation}</div>
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={handlePrev}
          disabled={idx === 0}
          className="btn-secondary px-4 sm:px-5"
        >
          <ChevronLeft className="w-4 h-4" />
          上一题
        </button>
        {!showResult ? (
          <button
            onClick={handleConfirm}
            disabled={selected == null || recordPractice.isPending}
            className="btn-primary flex-1"
          >
            确认
          </button>
        ) : (
          <button
            onClick={handleNext}
            disabled={idx === items.length - 1}
            className="btn-primary flex-1"
          >
            下一题
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
    <QuestionOverviewPanel
      total={items.length}
      currentIndex={idx}
      statusMap={statusMap}
      onJump={handleJump}
      mode="practice"
    />
    </div>
  )
}
