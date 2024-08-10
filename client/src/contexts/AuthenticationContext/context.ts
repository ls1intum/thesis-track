import { createContext } from 'react'
import { JwtPayload } from 'jwt-decode'
import { IUser } from '../../requests/responses/user'

export interface IAuthenticationContext {
  isAuthenticated: boolean
  user: IUser | undefined
  groups: string[]
  login: () => unknown
  logout: (redirectUrl: string) => unknown
}

export const AuthenticationContext = createContext<IAuthenticationContext | undefined>(undefined)

export interface IDecodedAccessToken extends JwtPayload {
  given_name: string
  family_name: string
  email: string
  preferred_username: string
  resource_access: Partial<Record<string, { roles: string[] }>>
  [key: string]: any
}

export interface IDecodedRefreshToken extends JwtPayload {
  [key: string]: any
}
