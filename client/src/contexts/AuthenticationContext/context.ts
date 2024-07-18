import { createContext } from 'react'
import { IUserInfo } from '../../requests/types/user'

export interface IAuthenticationContext {
  user: IUserInfo | undefined
  permissions: string[]
  groups: string[]
}

export const AuthenticationContext = createContext<IAuthenticationContext | undefined>(undefined)
