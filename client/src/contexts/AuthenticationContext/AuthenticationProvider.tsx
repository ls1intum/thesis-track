import React, { ReactNode, useMemo } from 'react'
import { AuthenticationContext, IAuthenticationContext } from './context'

interface IAuthenticationProviderProps {
  children: ReactNode
}

const AuthenticationProvider = (props: IAuthenticationProviderProps) => {
  const { children } = props

  const contextValue = useMemo<IAuthenticationContext>(() => {
    return {
      user: undefined,
      groups: [],
      permissions: [],
    }
  }, [])

  return (
    <AuthenticationContext.Provider value={contextValue}>{children}</AuthenticationContext.Provider>
  )
}

export default AuthenticationProvider
