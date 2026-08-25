import type { ReactNode } from 'react'

const API_BASE = `${import.meta.env.BASE_URL.replace(/\/$/, '')}/api/v1`

/** 题目选项渲染：支持带图题目（optionsImagePath）或纯文本 */
export function QuestionOption({
  label,
  imagePath,
  selected,
  showResult,
  isCorrect,
  isChosenCorrect,
  onClick,
  disabled = false,
  children,
  className = '',
  index,
}: {
  label: string
  imagePath?: string
  selected?: boolean
  showResult?: boolean
  isCorrect?: boolean
  isChosenCorrect?: boolean
  onClick?: () => void
  disabled?: boolean
  children?: ReactNode
  className?: string
  index?: number
}) {
  const base =
    'group w-full text-left p-4 rounded-2xl border transition-all flex items-center gap-3 sm:gap-4 disabled:cursor-default'
  let variant = 'border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/40 hover:-translate-y-0.5'
  if (showResult) {
    if (isChosenCorrect) variant = 'border-emerald-500 bg-emerald-50 text-emerald-800'
    else if (isCorrect) variant = 'border-emerald-500 bg-emerald-50 text-emerald-800'
    else if (selected) variant = 'border-rose-500 bg-rose-50 text-rose-800'
  } else if (selected) {
    variant = 'border-blue-700 bg-blue-50 text-blue-950 shadow-[0_10px_30px_-20px_rgba(29,78,216,.55)]'
  }

  // imagePath 如 wappen/berlin.svg，通过 API 获取
  const imgSrc =
    imagePath && imagePath.length > 5
      ? `${API_BASE}/assets/${imagePath}`
      : undefined

  const optionMark = typeof index === 'number' ? String.fromCharCode(65 + index) : undefined
  const content = imgSrc ? (
    <>
      {optionMark && <span className="grid h-9 w-9 shrink-0 place-items-center self-start rounded-xl bg-slate-100 text-sm font-bold text-slate-600 group-hover:bg-white">{optionMark}</span>}
      <img
        src={imgSrc}
        alt={label}
        className="max-h-32 max-w-[45%] object-contain rounded-xl"
        onError={(e) => { e.currentTarget.style.display = 'none' }}
      />
      <span className="text-sm font-semibold leading-6">{label}</span>
    </>
  ) : (
    <>{optionMark && <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl text-sm font-bold ${selected ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-600 group-hover:bg-white'}`}>{optionMark}</span>}<span className="min-w-0 font-medium leading-6">{children ?? label}</span></>
  )

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variant} ${className}`}
    >
      {content}
    </button>
  )
}
