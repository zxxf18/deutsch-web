import { api } from '@/lib/api'
import type { AppConfig, StateItem } from '@/types'

export const configApi = {
  getConfig: async () => (await api.get<AppConfig>('/config')).data,
  getStates: async () => (await api.get<{ total: number; items: StateItem[] }>('/states')).data,
}
