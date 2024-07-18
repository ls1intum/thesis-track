import { create } from 'zustand'
import { User } from '../interfaces/authentication'
import { useContext } from 'react'
import { AuthenticationContext } from '../contexts/AuthenticationContext/context'

interface AuthenticationStoreState {
  user?: User
  permissions: string[]
}

interface AuthenticationStoreAction {
  setUser: (user: User) => void
  setPermissions: (permissions: string[]) => void
}

export const useAuthenticationStore = create<AuthenticationStoreState & AuthenticationStoreAction>(
  (set) => ({
    permissions: [],
    setUser: (user) => set({ user: user }),
    setPermissions: (permissions) => set({ permissions: permissions }),
  }),
)

export function useAuthenticationContext() {
  const context = useContext(AuthenticationContext)

  if (!context) {
    throw new Error('Authentication context not initialized')
  }

  return context
}

export function useAuthenticatedUser() {
  const context = useAuthenticationContext()

  return context.user
}
