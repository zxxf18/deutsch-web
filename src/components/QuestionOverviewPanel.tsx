type QuestionStatus = 'unanswered' | 'answered' | 'correct' | 'wrong'

interface QuestionOverviewPanelProps {
  total: number
  currentIndex: number
  statusMap: Record<number, QuestionStatus>
  onJump: (index: number) => void
  mode: 'practice' | 'mock' | 'result'
}

export function QuestionOverviewPanel({
  total,
  currentIndex,
  statusMap,
  onJump,
  mode,
}: QuestionOverviewPanelProps) {
  const correctCount = Object.values(statusMap).filter((s) => s === 'correct').length
  const answeredCount = Object.values(statusMap).filter((s) => s !== 'unanswered').length

  return (
    <aside className="fixed inset-x-3 bottom-3 z-40 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-2xl shadow-slate-900/15 backdrop-blur-xl lg:sticky lg:inset-auto lg:top-28 lg:z-20 lg:w-full lg:p-5 lg:shadow-[0_20px_70px_-38px_rgba(15,23,42,.38)]">
      <div className="mb-3 flex items-center justify-between lg:mb-4"><div><div className="text-sm font-bold text-slate-900">题目导航</div><div className="text-xs text-slate-500">{mode === 'result' ? `${correctCount}/${total} 正确` : `${answeredCount}/${total} 已答`}</div></div><div className="hidden text-xs font-semibold text-slate-400 lg:block">共 {total} 题</div></div>
      <div className="flex gap-2 overflow-x-auto pb-1 lg:grid lg:max-h-[55vh] lg:grid-cols-5 lg:gap-2 lg:overflow-y-auto lg:overflow-x-hidden">
        {Array.from({ length: total }, (_, i) => {
          const status = statusMap[i] ?? 'unanswered'
          const isCurrent = i === currentIndex
          const isCorrect = status === 'correct'
          const isWrong = status === 'wrong'
          const isAnswered = status === 'answered'

          // 答对/答错优先于「当前」显示，确保提交后立即看到底色变化
          let bg = 'bg-slate-100 hover:bg-slate-200 text-slate-600'
          if (isCorrect) {
            bg = 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800'
          } else if (isWrong) {
            bg = 'bg-rose-100 hover:bg-rose-200 text-rose-800'
          } else if (isAnswered) {
            bg = 'bg-blue-100 hover:bg-blue-200 text-blue-700'
          } else if (isCurrent) {
            bg = 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-2 border-blue-400'
          }

          // 未答且在看的题目：内环标识，不放大避免溢出
          const currentRing = isCurrent && !isCorrect && !isWrong && !isAnswered ? 'ring-2 ring-blue-400 ring-inset' : ''

          return (
            <button
              key={i}
              type="button"
              onClick={() => onJump(i)}
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold transition lg:h-11 lg:w-11 ${bg} ${currentRing}`}
              title={`第 ${i + 1} 题${isCorrect ? ' ✓ 正确' : isWrong ? ' ✗ 错误' : isAnswered ? ' 已答' : ' 未答'}`}
            >
              {i + 1}
            </button>
          )
        })}
      </div>
    </aside>
  )
}
