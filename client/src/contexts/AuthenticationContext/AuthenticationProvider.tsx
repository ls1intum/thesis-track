import React, { ReactNode, useEffect, useMemo, useState } from 'react'
import { AuthenticationContext, IAuthenticationContext } from './context'
import Keycloak from 'keycloak-js'
import { GLOBAL_CONFIG } from '../../config/global'
import { jwtDecode } from 'jwt-decode'
import { IUserInfo } from '../../requests/types/user'
import { useAuthenticationTokens } from '../../hooks/authentication'
import { useSignal } from '../../hooks/utility'

interface IAuthenticationProviderProps {
  children: ReactNode
}

const keycloak = new Keycloak({
  realm: GLOBAL_CONFIG.keycloak.realm,
  url: GLOBAL_CONFIG.keycloak.url,
  clientId: GLOBAL_CONFIG.keycloak.client_id,
})

keycloak.onTokenExpired = () => {
  void keycloak.updateToken(60)
}

const AuthenticationProvider = (props: IAuthenticationProviderProps) => {
  const { children } = props

  const [user, setUser] = useState<IUserInfo>()
  const [authenticationTokens, setAuthenticationTokens] = useAuthenticationTokens();
  const [readySignal, triggerReadySignal] = useSignal()

  useEffect(() => {
    setUser(undefined)

    const updateToken = () => {
      if (keycloak.authenticated && keycloak.token && keycloak.refreshToken) {
        setAuthenticationTokens({
          jwt_token: keycloak.token,
          refresh_token: keycloak.refreshToken
        })

        const decodedJwt = jwtDecode<{
          given_name: string
          family_name: string
          email: string
          preferred_username: string
        }>(keycloak.token)

        console.log('decoded jwt token', decodedJwt)

        setUser({
          first_name: decodedJwt.given_name,
          last_name: decodedJwt.family_name,
          email: decodedJwt.email,
          university_id: GLOBAL_CONFIG.keycloak.get_unique_id(decodedJwt),
          user_id: GLOBAL_CONFIG.keycloak.get_unique_id(decodedJwt),
        })
      } else {
        setAuthenticationTokens(undefined)
      }
    }

    void keycloak
      .init({
        refreshToken: authenticationTokens?.refresh_token,
        token: authenticationTokens?.jwt_token,
      })
      .then(() => {
        updateToken()
        triggerReadySignal()
      })
      .catch((error) => {
        console.log('Keycloak init error', error)
      })

    keycloak.onAuthRefreshSuccess = () => updateToken()

    return () => {
      keycloak.onAuthRefreshSuccess = undefined
    }
  }, [])

  const contextValue = useMemo<IAuthenticationContext>(() => {
    return {
      isAuthenticated: !!authenticationTokens?.jwt_token,
      user: authenticationTokens?.jwt_token ? user : undefined,
      groups: [],
      login: () => readySignal.then(() => {
        !keycloak.authenticated && keycloak.login()
      }),
      logout: (redirectUri: string) => readySignal.then(() => {
        setAuthenticationTokens(undefined)

        keycloak.authenticated && keycloak.logout({
          redirectUri: `${location.origin}${redirectUri}`
        })
      }),
    }
  }, [user, !!authenticationTokens?.jwt_token, location.origin])

  return (
    <AuthenticationContext.Provider value={contextValue}>{children}</AuthenticationContext.Provider>
  )
}

export default AuthenticationProvider
