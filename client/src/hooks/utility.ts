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
