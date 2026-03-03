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
  }, [items.length, !!results])

  if (isLoading) return <div className="py-8 text-center">加载中...</div>
  if (items.length === 0) return <div className="py-8 text-center">暂无题目</div>

  if (results) {
    return (
      <div className="max-w-3xl mr-[300px] max-md:mr-[240px]">
        <h1 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">体验练习 - 结果</h1>
        <div className="space-y-6 mb-8">
          {items.map((q, idx) => {
            const r = results.find((x) => x.questionId === q.id)
            const chosen = answers[idx] ?? -1
            return (
              <div
                key={q.id}
                ref={(el) => { refsMap.current[idx] = el }}
                className="p-6 rounded-xl border-2 border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow scroll-mt-24"
              >
                <div className="text-sm font-medium text-gray-500 mb-2">第 {idx + 1} 题</div>
                <div className="text-base font-medium text-gray-900 mb-4">
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
            className="px-5 py-2.5 rounded-xl border-2 border-gray-200 hover:border-blue-300 font-medium transition"
          >
            再练一次
          </button>
          <Link
            to="/"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition"
          >
            返回首页
          </Link>
        </div>
        <div className="mt-8 p-6 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-100">
          <p className="text-sm text-blue-800">
            登录后解锁全部 {config?.totalQuestions ?? 460} 道题目与模拟考试
          </p>
          <Link to="/login" className="text-blue-600 font-medium mt-2 inline-block">
            去登录 →
          </Link>
        </div>

        <QuestionOverviewPanel
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
    <div className="max-w-3xl mr-[300px] max-md:mr-[240px]">
      <h1 className="text-xl font-bold mb-4">
        体验练习（{config?.trialQuestionCount ?? 10} 道）
      </h1>
      <p className="text-gray-600 mb-4">
        完成答题后点击提交查看结果
        {items.length > 0 && (
          <span className="ml-2 text-blue-600">
            已选 {Object.keys(answers).length}/{items.length} 题
          </span>
        )}
      </p>
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
        className="mt-6 w-full py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {check.isPending ? '提交中...' : '提交答案'}
      </button>

      <QuestionOverviewPanel
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
    <div className="p-4 border rounded bg-white">
      <div className="font-medium text-gray-500 mb-2">第 {index} 题</div>
      <div className="mb-3">{langMode === 'de-cn' ? q.questionCn : q.questionDe}</div>
      <div className="space-y-2">
        {(langMode === 'de-cn' ? q.optionsCn : q.optionsDe).map((opt, i) => (
          <QuestionOption
            key={i}
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
