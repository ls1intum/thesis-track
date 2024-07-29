import { useMemo, useState } from 'react'

interface IUseSignalReturnType {
  signal: Promise<unknown>
  ref: { isTriggerred: boolean }
  triggerSignal: () => unknown
}

export function useSignal(): IUseSignalReturnType {
  const [, setVersion] = useState(0)

  return useMemo(() => {
    let externalResolve: (x: boolean) => unknown
    const ref: { isTriggerred: boolean } = { isTriggerred: false }

    const signal = new Promise((resolve) => {
      externalResolve = resolve

      return true
    })

    return {
      signal,
      ref,
      triggerSignal: () => {
        externalResolve(true)
        ref.isTriggerred = true

        setVersion((prev) => prev + 1)
      },
    }
  }, [])
}

export function usePromiseLoader<T extends any[]>(
  fn: (...args: T) => Promise<unknown>,
): {
  execute: (...args: T) => unknown
  isLoading: boolean
} {
  const [loading, setLoading] = useState(false)

  return {
    isLoading: loading,
    execute: (...args: T) => {
      setLoading(true)

      void fn(...args).finally(() => setLoading(false))
    },
  }
}
