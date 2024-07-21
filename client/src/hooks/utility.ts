import { useMemo, useState } from 'react'

export function useSignal(): [Promise<unknown>, () => void] {
  return useMemo(() => {
    let externalResolve: (x: boolean) => unknown

    const signal = new Promise((resolve) => {
      externalResolve = resolve

      return true
    })

    return [
      signal,
      () => {
        externalResolve(true)
      },
    ]
  }, [])
}

export function usePromiseLoader(fn: () => Promise<unknown>): {
  execute: () => unknown
  isLoading: boolean
} {
  const [loading, setLoading] = useState(false)

  return {
    isLoading: loading,
    execute: () => {
      setLoading(true)

      void fn().finally(() => setLoading(false))
    },
  }
}