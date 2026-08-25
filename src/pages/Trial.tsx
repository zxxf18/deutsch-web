import { useState, useRef, useEffect } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { questionApi } from '@/api/question'
import { configApi } from '@/api/config'
import { Link } from 'react-router-dom'
import type { TrialQuestionItem, TrialCheckResultItem } from '@/types'
import { toast } from 'sonner'
import { QuestionOverviewPanel } from '@/components/QuestionOverviewPanel'
import { QuestionOption } from '@/components/QuestionOption'

type QStatus = 'unanswered' | 'answered' | 'correct' | 'wrong'

export function Trial() {
  // 使用题目索引作为 key，提交时转为 questionId，避免 id 格式差异
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [results, setResults] = useState<TrialCheckResultItem[] | null>(null)
  const [scrollIndex, setScrollIndex] = useState(0)
  const refsMap = useRef<Record<number, HTMLDivElement | null>>({})
  const { data: config } = useQuery({ queryKey: ['config'], queryFn: configApi.getConfig })
  const { data, isLoading } = useQuery({
    queryKey: ['trial'],
    queryFn: questionApi.getTrial,
  })
  const check = useMutation({
    mutationFn: questionApi.trialCheck,
    onSuccess: (res) => {
      setResults(res.data.results)
    },
    onError: (e) => toast.error((e as Error).message),
  })

  const items = data?.items ?? []
  const langMode = 'de-cn' // 可来自 config.languageModes

  const handleSelect = (idx: number, optIdx: number) => {
    setAnswers((a) => ({ ...a, [idx]: optIdx }))
  }
  const handleSubmit = () => {
    const count = Object.keys(answers).length
    if (count === 0) {
      toast.error('请至少选择一题')
      return
    }
    if (count < items.length) {
      toast.error(`还有 ${items.length - count} 题未作答`)
      return
    }
    const payload: Record<string, number> = {}
    items.forEach((q, i) => {
      if (answers[i] !== undefined) payload[String(q.id)] = answers[i]
    })
    check.mutate(payload)
  }
  const answerCount = Object.keys(answers).length
  const canSubmit = answerCount >= items.length && items.length > 0
  const hasResults = !!results

  const statusMap: Record<number, QStatus> = {}
  if (results) {
    items.forEach((q, i) => {
      const r = results.find((x) => x.questionId === q.id)
      statusMap[i] = r?.correct ? 'correct' : 'wrong'
    })
  } else {
    items.forEach((_, i) => {
      statusMap[i] = answers[i] !== undefined ? 'answered' : 'unanswered'
    })
  }

  const handleJump = (index: number) => {
    setScrollIndex(index)
    refsMap.current[index]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  useEffect(() => {
    if (items.length === 0) return
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
  }, [items.length, hasResults])

  if (isLoading) return <div className="py-8 text-center">加载中...</div>
  if (items.length === 0) return <div className="py-8 text-center">暂无题目</div>

  if (results) {
    return (
      <div className="grid items-start gap-6 pb-28 lg:grid-cols-[minmax(0,1fr)_18rem] lg:pb-0"><div className="min-w-0">
        <div className="mb-6"><div className="eyebrow">Trial result</div><h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">体验练习结果</h1></div>
        <div className="space-y-6 mb-8">
          {items.map((q, idx) => {
            const r = results.find((x) => x.questionId === q.id)
            const chosen = answers[idx] ?? -1
            return (
              <div
                key={q.id}
                ref={(el) => { refsMap.current[idx] = el }}
                className="surface scroll-mt-24 p-5 sm:p-6"
              >
                <div className="mb-2 text-xs font-bold uppercase tracking-wider text-blue-700">Question {String(idx + 1).padStart(2, '0')}</div>
                <div className="mb-4 font-semibold leading-7 text-slate-950">
                  {langMode === 'de-cn' ? q.questionCn : q.questionDe}
                </div>
                <div className="flex flex-wrap gap-2">
                  {q.optionsCn.map((opt, i) => (
                    <span
                      key={i}
                      className={`px-3 py-1.5 rounded-lg text-sm ${
                        i === r?.correctOptionIndex
                          ? 'bg-green-100 text-green-800 font-medium'
                          : i === chosen && !r?.correct
                          ? 'bg-red-100 text-red-800 font-medium'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {opt}
                      {i === r?.correctOptionIndex && ' ✓'}
                      {i === chosen && !r?.correct && i !== r?.correctOptionIndex && ' ✗'}
                    </span>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => { setResults(null); setAnswers({}) }}
            className="btn-secondary"
          >
            再练一次
          </button>
          <Link
            to="/"
            className="btn-primary"
          >
            返回首页
          </Link>
        </div>
        <div className="mt-8 rounded-2xl border border-blue-200 bg-blue-50 p-6">
          <p className="text-sm text-blue-800">
            登录后解锁全部 {config?.totalQuestions ?? 460} 道题目与模拟考试
          </p>
          <Link to="/login" className="text-blue-600 font-medium mt-2 inline-block">
            去登录 →
          </Link>
        </div>

        </div><QuestionOverviewPanel
          total={items.length}
          currentIndex={scrollIndex}
          statusMap={statusMap}
          onJump={handleJump}
          mode="result"
        />
      </div>
    )
  }

  return (
    <div className="grid items-start gap-6 pb-28 lg:grid-cols-[minmax(0,1fr)_18rem] lg:pb-0"><div className="min-w-0">
      <div className="surface mb-6 p-5 sm:p-6"><div className="eyebrow">Quick trial</div><h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">体验练习</h1>
      <p className="mt-2 text-sm text-slate-500">
        完成答题后点击提交查看结果
        {items.length > 0 && (
          <span className="ml-2 font-semibold text-blue-700">
            已选 {Object.keys(answers).length}/{items.length} 题
          </span>
        )}
      </p></div>
      <div className="space-y-6">
        {items.map((q, idx) => (
          <div
            key={q.id}
            ref={(el) => { refsMap.current[idx] = el }}
            className="scroll-mt-24"
          >
            <QuestionCard
              q={q}
              index={idx + 1}
              selected={answers[idx]}
              onSelect={(optIdx) => handleSelect(idx, optIdx)}
              langMode={langMode}
            />
          </div>
        ))}
      </div>
      <button
        onClick={handleSubmit}
        disabled={check.isPending || !canSubmit}
        className="btn-primary mt-6 w-full"
      >
        {check.isPending ? '提交中...' : '提交答案'}
      </button>

      </div><QuestionOverviewPanel
        total={items.length}
        currentIndex={scrollIndex}
        statusMap={statusMap}
        onJump={handleJump}
        mode="practice"
      />
    </div>
  )
}

function QuestionCard({
  q,
  index,
  selected,
  onSelect,
  langMode,
}: {
  q: TrialQuestionItem
  index: number
  selected: number | undefined
  onSelect: (i: number) => void
  langMode: string
}) {
  return (
    <div className="surface p-5 sm:p-7">
      <div className="mb-3 text-xs font-bold uppercase tracking-wider text-blue-700">Question {String(index).padStart(2, '0')}</div>
      <div className="mb-6 text-lg font-semibold leading-8 text-slate-950">{langMode === 'de-cn' ? q.questionCn : q.questionDe}</div>
      <div className="space-y-3">
        {(langMode === 'de-cn' ? q.optionsCn : q.optionsDe).map((opt, i) => (
          <QuestionOption
            key={i}
            index={i}
            label={opt}
            imagePath={q.optionsImagePath?.[i]}
            selected={selected === i}
            onClick={() => onSelect(i)}
          />
        ))}
      </div>
    </div>
  )
}
