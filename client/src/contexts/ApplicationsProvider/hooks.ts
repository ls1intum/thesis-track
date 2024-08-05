import { useContext } from 'react'
import { ApplicationsContext } from './context'

export function useApplicationsContext() {
  const data = useContext(ApplicationsContext)

  if (!data) {
    throw new Error('ApplicationsContext not properly initialized')
  }

  return data
}
