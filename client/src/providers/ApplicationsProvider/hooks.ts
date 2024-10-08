import { useContext } from 'react'
import { ApplicationsContext } from './context'
import { IApplication } from '../../requests/responses/application'

export function useApplicationsContext() {
  const data = useContext(ApplicationsContext)

  if (!data) {
    throw new Error('ApplicationsContext not initialized')
  }

  return data
}

export function useApplicationsContextUpdater(): (application: IApplication) => unknown {
  const data = useContext(ApplicationsContext)

  if (!data) {
    return () => undefined
  }

  return data.updateApplication
}
