// API 通用
export interface ApiResponse<T> {
  code: number
  msg: string
  data: T
}

// Config
export interface StateItem {
  id: string
  slug: string
  name: string
  nameCn: string
}

export interface LanguageModeItem {
  value: string
  label: string
}

export interface AppConfig {
  totalQuestions: number
  examQuestions: number
  examMinutes: number
  passScore: number
  trialQuestionCount: number
  languageModes: LanguageModeItem[]
}

// Auth / User
export interface User {
  id: string
  username: string
  email: string
  role: string
  nickname?: string
  description?: string
  is_enabled?: boolean
  createdAt?: number
  updatedAt?: number
}

export interface JwtInfo {
  jwt_token: string
  expires: number
  max_refresh: number
}

// Question
export interface QuestionItem {
  id: string
  questionDe: string
  questionCn: string
  optionsDe: string[]
  optionsCn: string[]
  optionsImagePath?: string[]  // 与 optionsDe 一一对应，仅 hasImage 题目，通过 /api/v1/assets/:path 获取
  correctAnswer?: number
  explanation?: string
  hasImage: boolean
  state: string
}

export interface TrialQuestionItem {
  id: string
  questionDe: string
  questionCn: string
  optionsDe: string[]
  optionsCn: string[]
  optionsImagePath?: string[]
  hasImage: boolean
  state: string
}

export interface TrialCheckResultItem {
  questionId: string
  correct: boolean
  correctOptionIndex: number
}

// Progress
export interface UserPreference {
  preferredExamStateId: string
}

export interface LearningProgressItem {
  stateId: string
  total: number
  practicedCount: number
  correctCount: number
}

export interface ExamRecordItem {
  id: string
  stateId: string
  total: number
  score: number
  passed: boolean
  createdAt: number
}

export interface ExamDetailItem {
  questionId: string
  questionCn: string
  questionDe: string
  chosenAnswer: number
  chosenOptionCn: string
  chosenOptionDe: string
  correct: boolean
  correctOptionIndex: number
  correctOptionDe: string
  correctOptionCn: string
  explanation: string
}
