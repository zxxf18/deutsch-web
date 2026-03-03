import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { questionApi } from '@/api/question'
import { progressApi } from '@/api/progress'
import { configApi } from '@/api/config'
import type { QuestionItem } from '@/types'
import { ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react'
import { QuestionOption } from '@/components/QuestionOption'
import { QuestionOverviewPanel } from '@/components/QuestionOverviewPanel'

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

  const generalItems = (generalData as { items?: QuestionItem[] })?.items ?? []
  const stateItems = (stateData as { items?: QuestionItem[] })?.items ?? []
  const items = useGeneral ? generalItems : [...generalItems, ...stateItems]
  const isLoading = !generalData || (!useGeneral && !!stateId && !stateData)
  const recordPractice = useMutation({
    mutationFn: ({ questionId, correct }: { questionId: string; correct: boolean }) =>
      progressApi.recordPractice(questionId, correct),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['learning'] }),
  })
  const addWrong = useMutation({
    mutationFn: progressApi.addWrongQuestion,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['wrong-questions'] }),
  })

  const [idx, setIdx] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [answerStatus, setAnswerStatus] = useState<Record<number, QStatus>>({})

  useEffect(() => {
    if (qId && items.length > 0) {
      const found = items.findIndex((it) => it.id === qId)
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
    recordPractice.mutate({ questionId: q.id, correct })
    if (!correct) addWrong.mutate(q.id)
    setAnswerStatus((s) => ({ ...s, [idx]: correct ? 'correct' : 'wrong' }))
    setShowResult(true)
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
    <>
    <div className="max-w-3xl mr-[300px] max-md:mr-[240px]">
      <div className="mb-8">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent mb-2">
          练习
        </h1>
        <div className="flex items-center gap-4">
          <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
              style={{ width: `${((idx + 1) / items.length) * 100}%` }}
            />
          </div>
          <span className="text-sm font-medium text-gray-600 tabular-nums">
            {idx + 1} / {items.length}
          </span>
        </div>
      </div>

      <div className="p-6 md:p-8 rounded-2xl border-2 border-gray-100 bg-white shadow-card hover:shadow-card-hover transition-shadow mb-6">
        <div className="text-sm font-medium text-indigo-600 mb-3">第 {idx + 1} 题</div>
        <div className="text-lg font-medium text-gray-900 mb-6 leading-relaxed">
          {langMode === 'de-cn' ? q.questionCn : q.questionDe}
        </div>
        <div className="space-y-3">
          {(langMode === 'de-cn' ? q.optionsCn : q.optionsDe).map((opt, i) => (
            <QuestionOption
              key={i}
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
        <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-100 mb-6">
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
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-gray-200 text-gray-700 font-medium hover:border-indigo-300 hover:bg-indigo-50 disabled:opacity-50 disabled:hover:bg-transparent transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
          上一题
        </button>
        {!showResult ? (
          <button
            onClick={handleConfirm}
            disabled={selected == null}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:shadow-none transition-all"
          >
            确认
          </button>
        ) : (
          <button
            onClick={handleNext}
            disabled={idx === items.length - 1}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:shadow-none transition-all"
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
    </>
  )
}
