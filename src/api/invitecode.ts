import { api } from '@/lib/api'

export interface InviteCodeItem {
  id: string
  code: string
  usedBy?: string
  expiresAt: number
  is_enabled: boolean
  createdAt: number
}

export const inviteCodeApi = {
  validate: (code: string) => api.get(`/invitecode/validate/${code}`),
  generate: (count: number) =>
    api.post<{ items: InviteCodeItem[] }>('/invitecode/generate', { count }),
  list: (pageNo = 1, pageSize = 10, availableOnly?: boolean) => {
    let q = `pageNo=${pageNo}&pageSize=${pageSize}`
    if (availableOnly) q += '&availableOnly=true'
    return api.get<{ total: number; items: InviteCodeItem[] }>(`/invitecode/list?${q}`)
  },
  enable: (id: string, enabled: boolean) =>
    api.patch(`/invitecode/${id}/enable`, { is_enabled: enabled }),
  delete: (id: string) => api.delete(`/invitecode/${id}`),
}
