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
      <div className="max-w-2xl mx-auto">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 p-8 md:p-12 mb-8 shadow-xl">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.08\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50" />
          <div className="relative">
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-4 drop-shadow-lg flex items-center gap-3">
              <Trophy className="w-8 h-8" />
              模拟考试
            </h1>
            {selectedState && (
              <p className="text-blue-200 text-sm mb-2 flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                目标州：{selectedState.nameCn || selectedState.name}
              </p>
            )}
            <p className="text-blue-100 text-lg mb-6">
              共 {config?.examQuestions ?? 33} 题，限时 {config?.examMinutes ?? 30} 分钟
            </p>
            <p className="text-blue-100/90">答对 {config?.passScore ?? 17} 题即通过</p>
          </div>
        </div>
        <div className="p-6 rounded-2xl border-2 border-gray-100 bg-white shadow-card mb-6">
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
          className="flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Play className="w-5 h-5" />
          开始考试
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mr-[300px] max-md:mr-[240px]">
      <div className="mb-6">
        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          模拟考试
        </h1>
      </div>

      {/* 浮动倒计时 */}
      <div
        className={`fixed top-24 right-6 z-50 flex items-center gap-2 font-mono text-xl font-bold px-5 py-3 rounded-xl shadow-lg border-2 max-md:top-20 max-md:right-4 max-md:px-4 max-md:text-lg ${
          secondsLeft < 300
            ? 'bg-rose-100 text-rose-700 border-rose-200 animate-pulse'
            : 'bg-white text-indigo-700 border-indigo-100'
        }`}
      >
        <Clock className="w-6 h-6 shrink-0" />
        <span>
          {Math.floor(secondsLeft / 60)}:{(secondsLeft % 60).toString().padStart(2, '0')}
        </span>
      </div>

      <div className="space-y-6 mb-8">
        {items.map((q, idx) => (
          <div
            key={q.id}
            ref={(el) => {
              refsMap.current[idx] = el
            }}
            className="p-6 rounded-2xl border-2 border-gray-100 bg-white shadow-card hover:shadow-card-hover transition-all scroll-mt-36"
          >
            <div className="text-sm font-medium text-indigo-600 mb-2">第 {idx + 1} 题</div>
            <div className="text-base font-medium text-gray-900 mb-4 leading-relaxed">
              {q.questionCn}
            </div>
            <div className="space-y-2">
              {q.optionsCn.map((opt, i) => (
                <QuestionOption
                  key={i}
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
        className="flex items-center justify-center gap-2 w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:shadow-none transition-all"
      >
        <Send className="w-5 h-5" />
        {submit.isPending ? '提交中...' : '提交试卷'}
      </button>

      <QuestionOverviewPanel
        total={items.length}
        currentIndex={scrollIndex}
        statusMap={statusMap}
        onJump={handleJump}
        mode="mock"
      />
    </div>
  )
}
