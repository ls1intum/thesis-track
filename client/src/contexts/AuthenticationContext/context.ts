import { createContext } from 'react'
import { IUserInfo } from '../../requests/types/user'

export interface IAuthenticationContext {
  isAuthenticated: boolean
  user: IUserInfo | undefined
  groups: string[]
  login: () => unknown
  logout: (redirectUrl: string) => unknown
}

export const AuthenticationContext = createContext<IAuthenticationContext | undefined>(undefined)
