import { GLOBAL_CONFIG } from '../config/global'
import { getAuthenticationTokens } from '../hooks/authentication'

export type ApiResponse<T> = { ok: true, status: number; data: T } | { ok: false, status: number; data: undefined }
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
  cb: (error?: Error, res?: ApiResponse<T>) => unknown,
): () => void
export function doRequest<T>(
  url: string,
  options: IRequestOptions,
  cb?: (error?: Error, res?: ApiResponse<T>) => unknown,
): Promise<ApiResponse<T>> | (() => void) {
  const controller = options.controller || new AbortController()

  const executeRequest = async (): Promise<ApiResponse<T>> => {
    const authenticationTokens = getAuthenticationTokens()
    const jwtToken = authenticationTokens?.jwt_token

    if (options.requiresAuth && !jwtToken) {
      throw new Error('User not authenticated')
    }

    const params = new URLSearchParams()

    if (options.params) {
      for (const [key, value] of Object.entries(options.params)) {
        params.append(key, value.toString())
      }
    }

    const result = await fetch(`${GLOBAL_CONFIG.api_server}${url}${params.toString()}`, {
      method: options.method,
      headers: {
        ...(options.requiresAuth ? { Authorization: `Bearer ${jwtToken}` } : {}),
        ...(options.data ? { 'Content-Type': 'application/json' } : {}),
        ...(options.formData ? { 'Content-Type': 'multipart/form-data' } : {}),
      },
      body: options.formData ?? (options.data ? JSON.stringify(options.data) : undefined),
      signal: controller.signal,
    })

    const formattedResponse = {
      ok: result.status >= 200 && result.status < 300,
      status: result.status,
      data: undefined,
    }

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

  const promise = executeRequest()

  if (cb) {
    promise.then((res) => cb(undefined, res))
    promise.catch((error) => cb(error, undefined))

    return () => {
      controller.abort()
    }
  }

  return promise
}
