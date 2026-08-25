import { useState, useEffect, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { questionApi } from '@/api/question'
import { progressApi } from '@/api/progress'
import { configApi } from '@/api/config'
import { useNavigate } from 'react-router-dom'
import type { QuestionItem } from '@/types'
import { toast } from 'sonner'
import { QuestionOverviewPanel } from '@/components/QuestionOverviewPanel'
import { QuestionOption } from '@/components/QuestionOption'
import { Clock, Play, Send, Trophy, MapPin } from 'lucide-react'

type QStatus = 'unanswered' | 'answered'

export function MockExam() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data: config } = useQuery({ queryKey: ['config'], queryFn: configApi.getConfig })
  const { data: prefs, isLoading: prefsLoading } = useQuery({
    queryKey: ['preferences'],
    queryFn: progressApi.getPreferences,
  })
  const { data: states } = useQuery({ queryKey: ['states'], queryFn: configApi.getStates })
  const GENERAL_STATE_ID = '00000000-0000-0000-0000-000000000001'
  const rawStateId =
    prefs?.preferredExamStateId ||
    (typeof localStorage !== 'undefined' ? localStorage.getItem('preferredStateId') : null) ||
    ''
  const selectedState = states?.items?.find((s) => s.id === rawStateId)
  const isGeneralState = rawStateId === GENERAL_STATE_ID || selectedState?.slug === 'general'
  const stateId = rawStateId && !isGeneralState ? rawStateId : undefined
  const { data, isLoading: examLoading } = useQuery({
    queryKey: ['exam', stateId],
    queryFn: () => questionApi.getExam(stateId!).then((r) => r.data),
    enabled: !!stateId,
  })
  const submit = useMutation({
    mutationFn: (answers: Record<string, number>) =>
      progressApi.submitExam(stateId, answers),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['exams'] })
      queryClient.invalidateQueries({ queryKey: ['wrong-questions'] })
      const examId = res?.data?.id
      if (examId) {
        navigate(`/exams/${examId}`)
      } else {
        toast.success('提交成功')
        navigate('/exams')
      }
    },
    onError: (e) => toast.error((e as Error).message),
  })

  const items = (data as { items?: QuestionItem[] })?.items ?? []
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [started, setStarted] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState((config?.examMinutes ?? 30) * 60)
  const [scrollIndex, setScrollIndex] = useState(0)
  const refsMap = useRef<Record<number, HTMLDivElement | null>>({})

  useEffect(() => {
    if (!started || secondsLeft <= 0) return
    const t = setInterval(() => setSecondsLeft((s) => s - 1), 1000)
    return () => clearInterval(t)
  }, [started, secondsLeft])

  useEffect(() => {
    if (!started || items.length === 0) return
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
  }, [started, items.length])

  const handleSelect = (qId: string, i: number) => {
    setAnswers((a) => ({ ...a, [qId]: i }))
  }
  const handleStart = () => setStarted(true)
  const handleSubmit = () => {
    if (Object.keys(answers).length !== items.length) {
      toast.error('请完成所有题目')
      return
    }
    submit.mutate(answers)
  }

  const handleJump = (index: number) => {
    setScrollIndex(index)
    refsMap.current[index]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const statusMap: Record<number, QStatus> = {}
  items.forEach((q, i) => {
    statusMap[i] = answers[q.id] !== undefined ? 'answered' : 'unanswered'
  })

  if (prefsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-200 to-indigo-200" />
          <span className="text-gray-500">加载中...</span>
        </div>
      </div>
    )
  }
  if (!stateId) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <div className="p-8 rounded-2xl bg-amber-50 border-2 border-amber-200 mb-6">
          <MapPin className="w-12 h-12 text-amber-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-amber-800 mb-2">请先选择联邦州</h2>
          <p className="text-amber-700 mb-6">
            模拟考试包含 30 道通用题 + 3 道您所在州的特定题目，需先选择您的目标联邦州
          </p>
          <Link
            to="/state-selection"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-600 text-white font-medium hover:bg-amber-700 transition-colors"
          >
            <MapPin className="w-5 h-5" />
            去选择州
          </Link>
        </div>
      </div>
    )
  }
  if (examLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-200 to-indigo-200" />
          <span className="text-gray-500">加载题目中...</span>
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

  if (!started) {
    return (
      <div className="mx-auto max-w-3xl">
        <div className="relative mb-6 overflow-hidden rounded-[2rem] bg-slate-950 p-7 text-white shadow-[0_30px_90px_-40px_rgba(15,23,42,.7)] sm:p-10">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.08\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50" />
          <div className="relative">
            <div className="eyebrow !text-amber-300">Mock examination</div><h1 className="mt-3 flex items-center gap-3 text-3xl font-bold tracking-tight text-white">
              <Trophy className="w-8 h-8" />
              模拟考试
            </h1>
            {selectedState && (
              <p className="mt-5 flex items-center gap-1 text-sm text-slate-300">
                <MapPin className="w-4 h-4" />
                目标州：{selectedState.nameCn || selectedState.name}
              </p>
            )}
            <p className="mt-3 text-lg text-slate-200">
              共 {config?.examQuestions ?? 33} 题，限时 {config?.examMinutes ?? 30} 分钟
            </p>
            <p className="mt-2 text-slate-400">答对 {config?.passScore ?? 17} 题即通过</p>
          </div>
        </div>
        <div className="surface mb-6 p-6">
          <div className="flex items-center gap-4 text-gray-600">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-500" />
              <span>{config?.examMinutes ?? 30} 分钟</span>
            </div>
            <div className="flex items-center gap-2">
              <span>{config?.examQuestions ?? 33} 道题</span>
            </div>
          </div>
        </div>
        <button
          onClick={handleStart}
          className="btn-primary px-8 py-4"
        >
          <Play className="w-5 h-5" />
          开始考试
        </button>
      </div>
    )
  }

  return (
    <div className="grid items-start gap-6 pb-28 lg:grid-cols-[minmax(0,1fr)_18rem] lg:pb-0"><div className="min-w-0">
      <div className="surface mb-6 flex items-center justify-between gap-4 p-5"><div><div className="eyebrow">Mock examination</div><h1 className="mt-1 text-2xl font-bold text-slate-950">模拟考试</h1></div>

      {/* 浮动倒计时 */}
      <div
        className={`flex shrink-0 items-center gap-2 rounded-xl border px-3 py-2 font-mono text-base font-bold sm:px-4 sm:text-lg ${
          secondsLeft < 300
            ? 'bg-rose-100 text-rose-700 border-rose-200 animate-pulse'
            : 'bg-white text-indigo-700 border-indigo-100'
        }`}
      >
        <Clock className="w-6 h-6 shrink-0" />
        <span>
          {Math.floor(secondsLeft / 60)}:{(secondsLeft % 60).toString().padStart(2, '0')}
        </span>
      </div></div>

      <div className="space-y-6 mb-8">
        {items.map((q, idx) => (
          <div
            key={q.id}
            ref={(el) => {
              refsMap.current[idx] = el
            }}
            className="surface scroll-mt-28 p-5 sm:p-7"
          >
            <div className="mb-2 text-xs font-bold uppercase tracking-wider text-blue-700">Question {String(idx + 1).padStart(2, '0')}</div>
            <div className="mb-5 font-semibold leading-7 text-slate-950">
              {q.questionCn}
            </div>
            <div className="space-y-2">
              {q.optionsCn.map((opt, i) => (
                <QuestionOption
                  key={i}
                  index={i}
                  label={opt}
                  imagePath={q.optionsImagePath?.[i]}
                  selected={answers[q.id] === i}
                  onClick={() => handleSelect(q.id, i)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={handleSubmit}
        disabled={submit.isPending || Object.keys(answers).length !== items.length}
        className="btn-primary w-full py-4"
      >
        <Send className="w-5 h-5" />
        {submit.isPending ? '提交中...' : '提交试卷'}
      </button>

      </div><QuestionOverviewPanel
        total={items.length}
        currentIndex={scrollIndex}
        statusMap={statusMap}
        onJump={handleJump}
        mode="mock"
      />
    </div>
  )
}
