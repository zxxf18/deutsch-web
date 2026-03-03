import { api } from '@/lib/api'
import type {
  UserPreference,
  LearningProgressItem,
  ExamRecordItem,
  ExamDetailItem,
  QuestionItem,
} from '@/types'

export const progressApi = {
  getPreferences: async () => (await api.get<UserPreference>('/progress/preferences')).data,
  updatePreferences: (data: Partial<UserPreference>) =>
    api.patch('/progress/preferences', data),
  getLearning: async () =>
    (await api.get<{ items: LearningProgressItem[] }>('/progress/learning')).data,
  recordPractice: (questionId: string, correct: boolean) =>
    api.post('/progress/learning', { questionId, correct }),
  getExams: async (pageNo = 1, pageSize = 10) =>
    (await api.get<{ total: number; items: ExamRecordItem[] }>(
      `/progress/exams?pageNo=${pageNo}&pageSize=${pageSize}`
    )).data,
  submitExam: (stateId: string | undefined, answers: Record<string, number>) =>
    api.post<{
      id: string
      total: number
      score: number
      passed: boolean
      details: ExamDetailItem[]
      createdAt: number
    }>('/progress/exams', { stateId, answers }),
  getExam: async (id: string) =>
    (await api.get<{
      id: string
      stateId: string
      total: number
      score: number
      passed: boolean
      details: ExamDetailItem[]
      createdAt: number
    }>(`/progress/exams/${id}`)).data,
  getWrongQuestions: async (pageNo = 1, pageSize = 10) =>
    (await api.get<{ total: number; items: QuestionItem[] }>(
      `/progress/wrong-questions?pageNo=${pageNo}&pageSize=${pageSize}`
    )).data,
  addWrongQuestion: (questionId: string) =>
    api.post('/progress/wrong-questions', { questionId }),
  removeWrongQuestion: (questionId: string) =>
    api.delete(`/progress/wrong-questions/${questionId}`),
}
