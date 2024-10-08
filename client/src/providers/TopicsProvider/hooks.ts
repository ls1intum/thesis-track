import { useContext } from 'react'
import { TopicsContext } from './context'

export function useTopicsContext() {
  const data = useContext(TopicsContext)

  if (!data) {
    throw new Error('TopicsContext not initialized')
  }

  return data
}
