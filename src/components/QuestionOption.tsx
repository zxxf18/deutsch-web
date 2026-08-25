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
}) {
  const base =
    'w-full text-left px-4 py-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2'
  let variant = 'border-gray-200 hover:border-indigo-200 hover:bg-indigo-50/30'
  if (showResult) {
    if (isChosenCorrect) variant = 'border-emerald-500 bg-emerald-50 text-emerald-800'
    else if (isCorrect) variant = 'border-emerald-500 bg-emerald-50 text-emerald-800'
    else if (selected) variant = 'border-rose-500 bg-rose-50 text-rose-800'
  } else if (selected) {
    variant = 'border-indigo-500 bg-indigo-50 text-indigo-800'
  }

  // imagePath 如 wappen/berlin.svg，通过 API 获取
  const imgSrc =
    imagePath && imagePath.length > 5
      ? `${API_BASE}/assets/${imagePath}`
      : undefined

  const content = imgSrc ? (
    <>
      <img
        src={imgSrc}
        alt={label}
        className="max-h-32 max-w-full object-contain rounded-lg"
        onError={(e) => { e.currentTarget.style.display = 'none' }}
      />
      <span className="text-sm font-medium">{label}</span>
    </>
  ) : (
    <span>{children ?? label}</span>
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
