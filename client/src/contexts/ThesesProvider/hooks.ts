import { useContext } from 'react'
import { ThesesContext } from './context'

export function useThesesContext() {
  const data = useContext(ThesesContext)

  if (!data) {
    throw new Error('ThesesContext not properly initialized')
  }

  return data
}
