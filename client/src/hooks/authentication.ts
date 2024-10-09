import { useContext } from 'react'
import { AuthenticationContext } from '../providers/AuthenticationContext/context'
import { useLocalStorage } from './local-storage'

export function useAuthenticationContext() {
  const context = useContext(AuthenticationContext)

  if (!context) {
    throw new Error('Authentication context not initialized')
  }

  return context
}

export function useUser() {
  const context = useAuthenticationContext()

  return context.user
}

export function useLoggedInUser() {
  const user = useUser()
  const auth = useAuthenticationContext()

  if (!user) {
    auth.login()

    throw new Error('Authentication required')
  }

  return user
}

export interface IAuthenticationTokens {
  access_token: string
  refresh_token: string
}

export function useAuthenticationTokens() {
  return useLocalStorage<IAuthenticationTokens>('authentication_tokens', { usingJson: true })
}

export function getAuthenticationTokens(): IAuthenticationTokens | undefined {
  try {
    const data = localStorage.getItem('authentication_tokens')

    if (data) {
      return JSON.parse(data)
    }

    return undefined
  } catch {
    return undefined
  }
}

export function useHasGroupAccess(...groups: string[]) {
  const user = useUser()

  return user?.groups.some((group) => groups.includes(group)) ?? false
}

export function useManagementAccess() {
  return useHasGroupAccess('admin', 'supervisor', 'advisor')
}
