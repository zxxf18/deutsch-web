import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { configApi } from '@/api/config'
import { progressApi } from '@/api/progress'
import { useAuthStore } from '@/stores/auth'
import { ArrowRight, BookOpen, Clock3, FileCheck2, MapPin, RotateCcw, ShieldCheck, Sparkles } from 'lucide-react'

export function Home() {
  const user = useAuthStore((s) => s.user)
  const isAuth = !!user
  const { data: config } = useQuery({ queryKey: ['config'], queryFn: configApi.getConfig })
  const { data: states } = useQuery({ queryKey: ['states'], queryFn: configApi.getStates })
  const { data: prefs } = useQuery({ queryKey: ['preferences'], queryFn: progressApi.getPreferences, enabled: isAuth })
  const { data: learning } = useQuery({ queryKey: ['learning'], queryFn: progressApi.getLearning, enabled: isAuth })
  const { data: exams } = useQuery({ queryKey: ['exams'], queryFn: () => progressApi.getExams(1, 5), enabled: isAuth })
  const { data: wrong } = useQuery({ queryKey: ['wrong-questions'], queryFn: () => progressApi.getWrongQuestions(1, 1), enabled: isAuth })

  const stateId = prefs?.preferredExamStateId || localStorage.getItem('preferredStateId') || ''
  const stateInfo = states?.items?.find((state) => state.id === stateId)
  const total = learning?.items?.reduce((sum, item) => sum + item.total, 0) ?? 0
  const practiced = learning?.items?.reduce((sum, item) => sum + item.practicedCount, 0) ?? 0
  const progress = total ? Math.round((practiced / total) * 100) : 0
  const lastExam = exams?.items?.[0]
  const wrongCount = wrong?.total ?? 0

  return (
    <div className="space-y-8 md:space-y-12">
      <section className="relative overflow-hidden rounded-[2rem] bg-slate-950 px-6 py-10 text-white shadow-[0_30px_100px_-35px_rgba(15,23,42,.65)] sm:px-10 md:px-14 md:py-14">
        <div className="absolute -right-20 -top-24 h-80 w-80 rounded-full border border-white/10" />
        <div className="absolute -right-4 top-8 h-56 w-56 rounded-full border border-amber-300/20" />
        <div className="absolute bottom-0 right-0 h-48 w-1/2 bg-gradient-to-tl from-blue-700/35 to-transparent" />
        <div className="relative grid items-center gap-12 lg:grid-cols-[1.2fr_.8fr]">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold tracking-wide text-slate-200"><Sparkles size={14} className="text-amber-300" />为华语学习者设计的备考系统</div>
            <h1 className="max-w-3xl text-4xl font-semibold leading-[1.12] tracking-[-0.035em] sm:text-5xl md:text-6xl">更从容地准备<span className="block text-amber-300">德国入籍考试</span></h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-slate-300 md:text-lg">中德双语题库、按州练习、模拟考试与错题复盘。把零散刷题变成清晰、可持续的学习路径。</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to={stateId ? (isAuth ? '/practice' : '/trial') : '/state-selection'} className="inline-flex items-center gap-2 rounded-xl bg-amber-300 px-5 py-3 font-bold text-slate-950 transition hover:-translate-y-0.5 hover:bg-amber-200">{stateId ? '继续学习' : '选择联邦州'} <ArrowRight size={18} /></Link>
              <Link to="/strategy" className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-5 py-3 font-semibold text-white hover:bg-white/10">查看考试攻略</Link>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-sm">
            <div className="surface rotate-2 p-5 text-slate-900">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4"><div><div className="text-xs font-bold uppercase tracking-[.16em] text-blue-700">今日学习</div><div className="mt-1 font-semibold">Einbürgerungstest</div></div><div className="grid h-11 w-11 place-items-center rounded-full bg-blue-50 font-bold text-blue-800">{progress}%</div></div>
              <div className="space-y-3 py-5">{['Grundgesetz 与基本权利', '德国历史与责任', '社会、文化与联邦州'].map((item, index) => <div key={item} className="flex items-center gap-3 rounded-xl bg-slate-50 p-3"><span className={`h-2.5 w-2.5 rounded-full ${index === 0 ? 'bg-emerald-500' : index === 1 ? 'bg-amber-400' : 'bg-slate-300'}`} /><span className="text-sm font-medium text-slate-700">{item}</span></div>)}</div>
              <div className="flex items-center justify-between text-xs text-slate-500"><span>{stateInfo?.nameCn || '选择所在联邦州'}</span><span>{practiced} / {total || config?.totalQuestions || 460}</span></div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <Metric icon={<BookOpen size={19} />} label="官方题库" value={`${config?.totalQuestions ?? 460} 道`} detail="通用题与州题完整覆盖" />
        <Metric icon={<Clock3 size={19} />} label="模拟考试" value={`${config?.examQuestions ?? 33} 题`} detail={`${config?.examMinutes ?? 30} 分钟真实节奏`} />
        <Metric icon={<ShieldCheck size={19} />} label="及格目标" value={`${config?.passScore ?? 17} 题`} detail="围绕正式考试标准训练" />
      </section>

      {isAuth && <section><div className="mb-5 flex min-w-0 items-end justify-between gap-3"><div className="min-w-0 flex-1"><div className="eyebrow">Your progress</div><h2 className="mt-2 flex min-w-0 text-2xl font-bold tracking-tight text-slate-950"><span className="shrink-0">欢迎回来，</span><span className="truncate" title={user?.nickname || user?.username}>{user?.nickname || user?.username}</span></h2></div><Link to="/state-selection" className="shrink-0 inline-flex items-center gap-1 text-sm font-semibold text-blue-700"><MapPin size={15} />{stateInfo?.nameCn || '选择联邦州'}</Link></div><div className="grid gap-4 md:grid-cols-3"><ProgressCard label="学习进度" value={`${progress}%`} detail={`${practiced} / ${total || config?.totalQuestions || 0} 已练习`} /><ProgressCard label="最近考试" value={lastExam ? `${lastExam.score}/${lastExam.total}` : '尚未参加'} detail={lastExam ? (lastExam.passed ? '已达到通过标准' : '继续巩固薄弱项') : '完成一次模拟考试建立基线'} /><ProgressCard label="待复习错题" value={`${wrongCount}`} detail="集中回看，更快形成长期记忆" /></div></section>}

      <section><div className="mb-5"><div className="eyebrow">Learning path</div><h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">选择你的下一步</h2></div><div className={`grid gap-4 md:grid-cols-2 ${isAuth ? 'lg:grid-cols-4' : ''}`}>{(!isAuth || user?.role === 'admin') && <ActionCard to="/trial" icon={<BookOpen />} index="01" title="体验练习" detail={`${config?.trialQuestionCount ?? 10} 道题快速了解题型`} />}{isAuth && <ActionCard to="/practice" icon={<FileCheck2 />} index="01" title="系统练习" detail="按题库顺序稳步学习" />}{isAuth && <ActionCard to="/mock-exam" icon={<Clock3 />} index="02" title="模拟考试" detail="在限定时间内完成实战" />}{isAuth && <ActionCard to="/mistakes" icon={<RotateCcw />} index="03" title="错题复盘" detail={`${wrongCount} 道错题等待巩固`} />}<ActionCard to="/strategy" icon={<Sparkles />} index={isAuth ? '04' : '02'} title="备考策略" detail="掌握规则、重点与节奏" /></div></section>
    </div>
  )
}

function Metric({ icon, label, value, detail }: { icon: React.ReactNode; label: string; value: string; detail: string }) { return <div className="surface flex items-center gap-4 p-5"><div className="grid h-11 w-11 place-items-center rounded-xl bg-blue-50 text-blue-800">{icon}</div><div><div className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</div><div className="text-lg font-bold text-slate-950">{value}</div><div className="text-xs text-slate-500">{detail}</div></div></div> }
function ProgressCard({ label, value, detail }: { label: string; value: string; detail: string }) { return <div className="surface p-6"><div className="text-sm font-medium text-slate-500">{label}</div><div className="mt-2 text-3xl font-bold tracking-tight text-slate-950">{value}</div><div className="mt-2 text-sm text-slate-500">{detail}</div></div> }
function ActionCard({ to, icon, index, title, detail }: { to: string; icon: React.ReactNode; index: string; title: string; detail: string }) { return <Link to={to} className="group surface relative min-h-52 overflow-hidden p-6 transition hover:-translate-y-1 hover:border-blue-200"><span className="absolute right-5 top-4 text-5xl font-black text-slate-100">{index}</span><div className="relative grid h-11 w-11 place-items-center rounded-xl bg-slate-950 text-white transition group-hover:bg-blue-800">{icon}</div><h3 className="relative mt-8 text-lg font-bold text-slate-950">{title}</h3><p className="relative mt-2 text-sm leading-6 text-slate-500">{detail}</p><ArrowRight className="absolute bottom-5 right-5 text-slate-300 transition group-hover:translate-x-1 group-hover:text-blue-700" size={19} /></Link> }
