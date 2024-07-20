import { useCallback, useState } from 'react'
import { useAuthenticationContext, useAuthenticationTokens } from '../hooks/authentication'
import { GLOBAL_CONFIG } from '../config/global'

export type ApiResponse<T> = {status: number, ok: boolean, data: T}
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
export type ResponseType = 'json' | 'blob';

export interface IRequestOptions {
  method: HttpMethod;
  requiresAuth: boolean;
  responseType?: ResponseType,
  data?: any;
  formData?: FormData;
  params?: Record<string, string | number | boolean>;
  controller?: AbortController;
}

export interface IRequestFunctions {
  doRequest<T>(url: string, options: IRequestOptions): Promise<ApiResponse<T>>;
  doRequest<T>(url: string, options: IRequestOptions, cb: (error?: Error, res?: ApiResponse<T>) => unknown): () => void;
  doRequest<T>(
    url: string,
    options: IRequestOptions,
    cb?: (error?: Error, res?: ApiResponse<T>) => unknown
  ): Promise<ApiResponse<T>> | (() => void);

  authenticated: string | undefined;
}

export function useRequest(): IRequestFunctions {
  const auth = useAuthenticationContext();
  const [authenticationTokens] = useAuthenticationTokens();

  const doRequest = useCallback<IRequestFunctions['doRequest']>(
    (<T>(url: string, options: IRequestOptions, cb?: (error?: Error, res?: ApiResponse<T>) => unknown) => {
      const controller = options.controller || new AbortController();

      const executeRequest = async (): Promise<ApiResponse<T>> => {
        const authToken = authenticationTokens?.jwt_token

        if (options.requiresAuth && !authToken) {
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
            ...(options.requiresAuth ? { Authorization: `Bearer ${authToken}` } : {}),
            ...(options.data ? { 'Content-Type': 'application/json' } : {}),
            ...(options.formData ? { 'Content-Type': 'multipart/form-data' } : {})
          },
          body: options.formData ?? (options.data ? JSON.stringify(options.data) : undefined),
          signal: controller.signal
        })

        return {
          ok: result.status >= 200 && result.status < 300,
          status: result.status,
          data: options.responseType === 'blob' ? await result.blob() : await result.json()
        }
      };

      const promise = executeRequest();

      if (cb) {
        promise.then(res => cb(undefined, res));
        promise.catch(error => cb(error, undefined));

        return () => {
          controller.abort();
        };
      }

      return promise;
    }) as IRequestFunctions['doRequest'],
    [authenticationTokens?.jwt_token]
  );

  return { authenticated: auth.user?.user_id, doRequest };
}

export function usePromiseLoader(fn: () => Promise<unknown>): {
  execute: () => unknown,
  isLoading: boolean
} {
  const [loading, setLoading] = useState(false)

  return {
    isLoading: loading,
    execute: () => {
      setLoading(true)

      void fn().finally(() => setLoading(false))
    }
  }
}
