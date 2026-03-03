import { api } from '@/lib/api'
import type {
  QuestionItem,
  TrialQuestionItem,
  TrialCheckResultItem,
} from '@/types'

export const questionApi = {
  getTrial: async () =>
    (await api.get<{ total: number; items: TrialQuestionItem[] }>('/questions/trial')).data,
  trialCheck: (answers: Record<string, number>) =>
    api.post<{ results: TrialCheckResultItem[] }>('/questions/trial/check', { answers }),
  getGeneral: () =>
    api.get<{ total: number; items: QuestionItem[] }>('/questions/general'),
  getByState: (stateId: string) =>
    api.get<{ total: number; items: QuestionItem[] }>(`/questions/state/${stateId}`),
  getExam: (stateId?: string) => {
    const q = stateId ? `?state_id=${stateId}` : ''
    return api.get<{ total: number; items: QuestionItem[] }>(`/questions/exam${q}`)
  },
  getOne: (id: string) => api.get<QuestionItem>(`/questions/${id}`),
}
