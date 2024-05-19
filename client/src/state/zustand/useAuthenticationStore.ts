import { create } from 'zustand'
import { User } from '../../interface/authentication'

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
