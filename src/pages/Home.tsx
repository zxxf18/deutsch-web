import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { configApi } from '@/api/config'
import { progressApi } from '@/api/progress'
import { useAuthStore } from '@/stores/auth'
import { BookOpen, Clock, AlertTriangle, MapPin, FileText } from 'lucide-react'

export function Home() {
  const navigate = useNavigate()
  const token = useAuthStore((s) => s.token)
  const user = useAuthStore((s) => s.user)
  const isAuth = !!token
  const isAdmin = user?.role === 'admin'
  const { data: config } = useQuery({ queryKey: ['config'], queryFn: configApi.getConfig })
  const { data: states } = useQuery({ queryKey: ['states'], queryFn: configApi.getStates })
  const { data: prefs } = useQuery({
    queryKey: ['preferences'],
    queryFn: progressApi.getPreferences,
    enabled: isAuth,
  })
  const { data: learning } = useQuery({
    queryKey: ['learning'],
    queryFn: progressApi.getLearning,
    enabled: isAuth,
  })
  const { data: exams } = useQuery({
    queryKey: ['exams'],
    queryFn: () => progressApi.getExams(1, 5),
    enabled: isAuth,
  })
  const { data: wrong } = useQuery({
    queryKey: ['wrong-questions'],
    queryFn: () => progressApi.getWrongQuestions(1, 1),
    enabled: isAuth,
  })

  const stateId = prefs?.preferredExamStateId || (typeof localStorage !== 'undefined' ? localStorage.getItem('preferredStateId') : null) || ''
  const stateInfo = states?.items?.find((s) => s.id === stateId)
  const lastExam = exams?.items?.[0]
  const wrongCount = wrong?.total ?? 0

  const totalForState = learning?.items?.reduce((a, i) => a + i.total, 0) ?? 0
  const practicedForState = learning?.items?.reduce((a, i) => a + i.practicedCount, 0) ?? 0

  // 未选州
  if (!stateId && states?.items?.length) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex w-16 h-16 bg-blue-100 rounded-2xl items-center justify-center text-2xl font-bold text-blue-600 mb-6">
          德
        </div>
        <h1 className="text-2xl font-bold mb-2">德国入籍考试备考</h1>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          通过中德双语对照，成为华人群体信赖的德国入籍考试学习伴侣
        </p>
        <Link
          to="/state-selection"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
        >
          <MapPin size={20} />
          选择联邦州
        </Link>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
          {['练习', '模拟考试', '错题本', '攻略'].map((label) => (
            <div key={label} className="p-4 rounded-lg border text-center">
              <span className="text-sm text-gray-600">{label}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // 已选州
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">学习仪表盘</h1>
          <p className="text-gray-600 flex items-center gap-1">
            <MapPin size={16} />
            {stateInfo?.nameCn || stateInfo?.name}
          </p>
        </div>
        <Link
          to="/state-selection"
          className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
        >
          <MapPin size={14} />
          更换州
        </Link>
      </div>

      {isAuth && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="p-5 rounded-2xl border-2 border-gray-100 bg-white shadow-card">
            <div className="text-sm text-gray-500 mb-1">学习进度</div>
            <div className="text-xl font-bold">
              {totalForState > 0
                ? `${Math.round((practicedForState / totalForState) * 100)}%`
                : '0%'}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {practicedForState} / {totalForState || config?.totalQuestions || 0} 已练习
            </div>
          </div>
          <div className="p-5 rounded-2xl border-2 border-gray-100 bg-white shadow-card">
            <div className="text-sm text-gray-500 mb-1">最近考试</div>
            {lastExam ? (
              <>
                <div className="text-xl font-bold">
                  {lastExam.score}/{lastExam.total}
                  <span
                    className={`ml-2 text-sm ${lastExam.passed ? 'text-green-600' : 'text-red-600'}`}
                  >
                    {lastExam.passed ? '通过' : '未通过'}
                  </span>
                </div>
              </>
            ) : (
              <div className="text-gray-400">还未参加</div>
            )}
          </div>
          <div className="p-5 rounded-2xl border-2 border-gray-100 bg-white shadow-card">
            <div className="text-sm text-gray-500 mb-1">错题数量</div>
            <div className="text-xl font-bold">{wrongCount}</div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(!isAuth || isAdmin) && (
          <Card
            icon={<BookOpen size={24} />}
            title="体验练习"
            desc={`${config?.trialQuestionCount ?? 10} 道题目免费体验`}
            onClick={() => navigate('/trial')}
          />
        )}
        {isAuth && (
          <>
            <Card
              icon={<BookOpen size={24} />}
              title="完整练习"
              desc={`${config?.totalQuestions ?? 460} 道题目系统学习`}
              onClick={() => navigate('/practice')}
            />
            <Card
              icon={<Clock size={24} />}
              title="模拟考试"
              desc={`${config?.examQuestions ?? 33} 题 / ${config?.examMinutes ?? 30} 分钟`}
              onClick={() => navigate('/mock-exam')}
            />
            <Card
              icon={<AlertTriangle size={24} />}
              title="错题本"
              desc={`${wrongCount} 道错题待复习`}
              onClick={() => navigate('/mistakes')}
            />
          </>
        )}
        <Card
          icon={<FileText size={24} />}
          title="考试攻略"
          desc="备考指南与策略"
          onClick={() => navigate('/strategy')}
        />
      </div>
    </div>
  )
}

function Card({
  icon,
  title,
  desc,
  onClick,
}: {
  icon: React.ReactNode
  title: string
  desc: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="group p-6 rounded-2xl border-2 border-gray-100 bg-white text-left shadow-card hover:shadow-card-hover hover:border-blue-200 transition-all flex gap-4 items-start"
    >
      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{title}</div>
        <div className="text-sm text-gray-500 mt-0.5">{desc}</div>
      </div>
    </button>
  )
}
