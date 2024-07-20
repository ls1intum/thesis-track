import { useMemo } from 'react'

export function useSignal(): [Promise<unknown>, () => void] {
  return useMemo(() => {
    let externalResolve: (x: boolean) => unknown

    const signal = new Promise(resolve => {
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