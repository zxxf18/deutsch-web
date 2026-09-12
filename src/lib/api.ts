import { useAuthStore } from '@/stores/auth'

const BASE = `${import.meta.env.BASE_URL.replace(/\/$/, '')}/api/v1`

async function request<T>(
  path: string,
  opts: RequestInit = {}
): Promise<ApiResponse<T>> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...opts.headers,
  }
  const res = await fetch(BASE + path, { ...opts, headers, credentials: 'same-origin' })

  // 401: 尝试刷新 token 后重试
  if (res.status === 401) {
    useAuthStore.getState().logout()
    window.location.href = `/auth/login?return_to=${encodeURIComponent(window.location.pathname + window.location.search)}`
    throw new Error('请先登录')
  }

  const json = await res.json().catch(() => ({ code: -1, msg: '网络错误' }))
  if (json.code !== 0) {
    throw new Error(json.msg || '请求失败')
  }
  return json as ApiResponse<T>
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
}

interface ApiResponse<T> {
  code: number
  msg: string
  data: T
}
