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
    <div className="fixed right-4 top-1/2 -translate-y-1/2 z-40 w-[280px] min-w-[280px] rounded-2xl bg-white/95 backdrop-blur-xl border-2 border-gray-100 shadow-xl p-5 max-md:right-3 max-md:w-[220px] max-md:min-w-[220px] max-md:p-4">
      <div className="text-base font-semibold text-gray-700 text-center mb-4">题目概览</div>
      <div className="grid grid-cols-4 gap-3 max-h-[55vh] overflow-y-auto overflow-x-hidden py-1">
        {Array.from({ length: total }, (_, i) => {
          const status = statusMap[i] ?? 'unanswered'
          const isCurrent = i === currentIndex
          const isCorrect = status === 'correct'
          const isWrong = status === 'wrong'
          const isAnswered = status === 'answered'

          // 答对/答错优先于「当前」显示，确保提交后立即看到底色变化
          let bg = 'bg-gray-100 hover:bg-gray-200 text-gray-600'
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
              className={`w-12 h-12 max-md:w-10 max-md:h-10 rounded-xl flex items-center justify-center text-base font-semibold transition-colors hover:opacity-90 active:opacity-80 shrink-0 ${bg} ${currentRing}`}
              title={`第 ${i + 1} 题${isCorrect ? ' ✓ 正确' : isWrong ? ' ✗ 错误' : isAnswered ? ' 已答' : ' 未答'}`}
            >
              {i + 1}
            </button>
          )
        })}
      </div>
      <div className="mt-4 pt-4 border-t border-gray-100 text-sm text-gray-500 text-center">
        {mode === 'result' ? `${correctCount}/${total} 正确` : `${answeredCount}/${total} 已答`}
      </div>
    </div>
  )
}
