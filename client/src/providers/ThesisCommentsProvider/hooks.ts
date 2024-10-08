import { useContext } from 'react'
import { ThesisCommentsContext } from './context'

export function useThesisCommentsContext() {
  const data = useContext(ThesisCommentsContext)

  if (!data) {
    throw new Error('ThesisCommentsContext not initialized')
  }

  return data
}
