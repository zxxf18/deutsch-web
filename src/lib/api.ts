import { useAuthStore } from '@/stores/auth'

const BASE = '/api/v1'

async function request<T>(
  path: string,
  opts: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = useAuthStore.getState().token
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...opts.headers,
  }
  if (token) {
    ;(headers as Record<string, string>)['Authorization'] = `Bearer ${token}`
  }

  let res = await fetch(BASE + path, { ...opts, headers })

  // 401: 尝试刷新 token 后重试
  if (res.status === 401 && token && !path.includes('/jwt/refresh')) {
    const refreshRes = await fetch(BASE + '/auth/jwt/refresh', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    })
    if (refreshRes.ok) {
      const json = await refreshRes.json()
      if (json.code === 0 && json.data?.jwt_token) {
        useAuthStore.getState().setToken(json.data.jwt_token, json.data.expires)
        ;(headers as Record<string, string>)['Authorization'] = `Bearer ${json.data.jwt_token}`
        res = await fetch(BASE + path, { ...opts, headers })
      } else {
        useAuthStore.getState().logout()
        window.location.href = '/login'
        throw new Error('登录已过期')
      }
    } else {
      useAuthStore.getState().logout()
      window.location.href = '/login'
      throw new Error('登录已过期')
    }
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
