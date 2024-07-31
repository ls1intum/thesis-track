import { GLOBAL_CONFIG } from '../config/global'
import { getAuthenticationTokens } from '../hooks/authentication'

export type ApiResponse<T> =
  | { ok: true; status: number; data: T }
  | { ok: false; status: number; data: undefined, error?: Error }
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
export type ResponseType = 'json' | 'blob'

export interface IRequestOptions {
  method: HttpMethod
  requiresAuth: boolean
  responseType?: ResponseType
  data?: any
  formData?: FormData
  params?: Record<string, string | number | boolean>
  controller?: AbortController
}

export function doRequest<T>(url: string, options: IRequestOptions): Promise<ApiResponse<T>>
export function doRequest<T>(
  url: string,
  options: IRequestOptions,
  cb: (res: ApiResponse<T>) => unknown,
): () => void
export function doRequest<T>(
  url: string,
  options: IRequestOptions,
  cb?: (res: ApiResponse<T>) => unknown,
): Promise<ApiResponse<T>> | (() => void) {
  const controller = options.controller || new AbortController()

  const executeRequest = async (): Promise<ApiResponse<T>> => {
    const authenticationTokens = getAuthenticationTokens()
    const jwtToken = authenticationTokens?.access_token

    if (options.requiresAuth && !jwtToken) {
      throw new Error('User not authenticated')
    }

    const params = new URLSearchParams()

    if (options.params) {
      for (const [key, value] of Object.entries(options.params)) {
        params.append(key, value.toString())
      }
    }

    if (options.data && options.formData) {
      throw new Error('Cannot send both data and formData')
    }

    const result = await fetch(`${GLOBAL_CONFIG.server_host}/api${url}?${params.toString()}`, {
      method: options.method,
      headers: {
        ...(options.requiresAuth ? { Authorization: `Bearer ${jwtToken}` } : {}),
        ...(options.data ? { 'Content-Type': 'application/json' } : {}),
      },
      body: options.formData ?? (options.data ? JSON.stringify(options.data) : undefined),
      signal: controller.signal,
    })

    if (result.status >= 200 && result.status < 300) {
      return {
        ok: true,
        status: result.status,
        data: options.responseType === 'blob' ? await result.blob() : await result.json(),
      }
    } else {
      return {
        ok: false,
        status: result.status,
        data: undefined,
      }
    }
  }

  const promise = executeRequest().catch<ApiResponse<T>>(error => ({
    ok: false,
    status: 1000,
    data: undefined,
    error
  }))

  if (cb) {
    promise.then((res) => cb(res))

    return () => {
      controller.abort()
    }
  }

  return promise
}
