import { createContext } from 'react'
import { IUserInfo } from '../../requests/types/user'
import { JwtPayload } from 'jwt-decode'

export interface IAuthenticationContext {
  isAuthenticated: boolean
  user: IUserInfo | undefined
  groups: string[]
  login: () => unknown
  logout: (redirectUrl: string) => unknown
}

export const AuthenticationContext = createContext<IAuthenticationContext | undefined>(undefined)

export interface IDecodedAccessToken extends JwtPayload {
  given_name: string
  family_name: string
  email: string
  preferred_username: string,
  resource_access: Partial<Record<string, {roles: string[]}>>
}

export interface IDecodedRefreshToken extends JwtPayload {
}