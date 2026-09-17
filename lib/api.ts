// ============================================================
// Centralized API client — every frontend HTTP call goes
// through here. Automatically injects the JWT token from
// localStorage and provides typed helpers for common methods.
// ============================================================

const API_BASE = '/api'

export class ApiError extends Error {
  status: number
  detail?: string

  constructor(status: number, message: string, detail?: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.detail = detail
  }
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  options?: { headers?: Record<string, string> }
): Promise<T> {
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('nlams_token') : null

  const headers: Record<string, string> = {
    ...(body && !(body instanceof FormData)
      ? { 'Content-Type': 'application/json' }
      : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options?.headers ?? {}),
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body
      ? body instanceof FormData
        ? body
        : JSON.stringify(body)
      : undefined,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new ApiError(res.status, err.error || 'Request failed', err.detail)
  }

  // Handle 204 No Content
  if (res.status === 204) return undefined as T

  return res.json()
}

/** Typed API helpers */
export const api = {
  get: <T>(path: string) => request<T>('GET', path),

  post: <T>(path: string, body?: unknown) => request<T>('POST', path, body),

  patch: <T>(path: string, body?: unknown) => request<T>('PATCH', path, body),

  delete: <T>(path: string) => request<T>('DELETE', path),

  /**
   * Upload a file via multipart/form-data.
   * Pass additional fields as key-value pairs alongside the file.
   */
  upload: <T>(
    path: string,
    file: File,
    fields: Record<string, string> = {}
  ): Promise<T> => {
    const form = new FormData()
    form.append('file', file)
    Object.entries(fields).forEach(([k, v]) => form.append(k, v))
    return request<T>('POST', path, form)
  },
}
