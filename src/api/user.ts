import { api } from '@/lib/api'
import type { User } from '@/types'

export const userApi = {
  getUser: async (id: string) => (await api.get<User>(`/user/${id}`)).data,
  updateProfile: (data: { nickname?: string; description?: string }) =>
    api.patch<User>('/user/profile', data),
  list: (pageNo = 1, pageSize = 10) =>
    api.get<{ total: number; items: User[] }>(`/user/list?pageNo=${pageNo}&pageSize=${pageSize}`),
  delete: (id: string) => api.delete(`/user/${id}`),
  enable: (id: string, enabled: boolean) =>
    api.patch(`/user/${id}/enable`, { is_enabled: enabled }),
}
