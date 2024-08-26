import React, { PropsWithChildren, useEffect, useMemo, useState } from 'react'
import {
  AuthenticationContext,
  IAuthenticationContext,
  IDecodedAccessToken,
  IDecodedRefreshToken,
} from './context'
import Keycloak from 'keycloak-js'
import { GLOBAL_CONFIG } from '../../config/global'
import { jwtDecode } from 'jwt-decode'
import { getAuthenticationTokens, useAuthenticationTokens } from '../../hooks/authentication'
import { useSignal } from '../../hooks/utility'
import { IUser } from '../../requests/responses/user'
import { doRequest } from '../../requests/request'
import { showSimpleError } from '../../utils/notification'
import { ApiError, getApiResponseErrorMessage } from '../../requests/handler'

export const keycloak = new Keycloak({
  realm: GLOBAL_CONFIG.keycloak.realm,
  url: GLOBAL_CONFIG.keycloak.host,
  clientId: GLOBAL_CONFIG.keycloak.client_id,
})

const AuthenticationProvider = (props: PropsWithChildren) => {
  const { children } = props

  const [universityId, setUniversityId] = useState<string>()
  const [user, setUser] = useState<IUser>()
  const [authenticationTokens, setAuthenticationTokens] = useAuthenticationTokens()
  const {
    signal: readySignal,
    triggerSignal: triggerReadySignal,
    ref: { isTriggerred: isReady },
  } = useSignal()

  useEffect(() => {
    setUser(undefined)

    const refreshAccessToken = () => {
      keycloak.updateToken(60 * 5).then((isSuccess) => {
        if (!isSuccess) {
          setAuthenticationTokens(undefined)
        }
      })
    }

    const storeTokens = () => {
      const refreshToken = keycloak.refreshToken
      const accessToken = keycloak.token

      const decodedAccessToken = accessToken
        ? jwtDecode<IDecodedAccessToken>(accessToken)
        : undefined
      const decodedRefreshToken = refreshToken
        ? jwtDecode<IDecodedRefreshToken>(refreshToken)
        : undefined

      console.log('decoded keycloak refresh token', decodedRefreshToken)
      console.log('decoded keycloak access token', decodedAccessToken)

      if (decodedRefreshToken?.exp) {
        console.log(
          `refresh token expires in ${Math.floor(decodedRefreshToken.exp - Date.now() / 1000)} seconds`,
        )
      }

      // refresh if already expired
      if (decodedRefreshToken?.exp && decodedRefreshToken.exp <= Date.now() / 1000) {
        return setAuthenticationTokens(undefined)
      } else if (decodedAccessToken?.exp && decodedAccessToken.exp <= Date.now() / 1000) {
        return refreshAccessToken()
      }

      if (accessToken && refreshToken) {
        setAuthenticationTokens({
          access_token: accessToken,
          refresh_token: refreshToken,
        })
      } else {
        setAuthenticationTokens(undefined)
      }
    }

    const storedTokens = getAuthenticationTokens()

    keycloak.onTokenExpired = () => refreshAccessToken()
    keycloak.onAuthRefreshSuccess = () => storeTokens()
    keycloak.onAuthRefreshError = () => setAuthenticationTokens(undefined)
    keycloak.onAuthLogout = () => setAuthenticationTokens(undefined)

    console.log('Initializing keycloak...')

    void keycloak
      .init({
        refreshToken: storedTokens?.refresh_token,
        token: storedTokens?.access_token,
      })
      .then(() => {
        console.log('Keycloak initialized')

        storeTokens()
        triggerReadySignal()
      })
      .catch((error) => {
        console.log('Keycloak init error', error)
      })

    const refreshTokenFrequency = 60 * 1000
    const refreshTokenInterval = setInterval(() => {
      const refreshToken = keycloak.refreshToken

      const decodedRefreshToken = refreshToken
        ? jwtDecode<IDecodedRefreshToken>(refreshToken)
        : undefined

      if (decodedRefreshToken?.exp && decodedRefreshToken.exp <= Date.now() / 1000) {
        keycloak.clearToken()

        return setAuthenticationTokens(undefined)
      }
    }, refreshTokenFrequency)

    return () => {
      clearInterval(refreshTokenInterval)

      keycloak.onAuthRefreshSuccess = undefined
      keycloak.onTokenExpired = undefined
      keycloak.onAuthRefreshError = undefined
      keycloak.onAuthLogout = undefined
    }
  }, [])

  useEffect(() => {
    if (!isReady) {
      return
    }

    if (authenticationTokens?.access_token) {
      const decodedAccessToken = jwtDecode<IDecodedAccessToken>(authenticationTokens.access_token)

      setUniversityId(
        decodedAccessToken[GLOBAL_CONFIG.keycloak.university_id_jwt_attribute] || undefined,
      )
    } else {
      setUniversityId(undefined)
    }
  }, [authenticationTokens?.access_token, isReady])

  useEffect(() => {
    setUser(undefined)

    if (isReady && universityId) {
      return doRequest<IUser>(
        '/v2/user-info',
        {
          method: 'POST',
          requiresAuth: true,
        },
        (res) => {
          if (res.ok) {
            setUser(res.data)
          } else {
            showSimpleError(getApiResponseErrorMessage(res))
          }
        },
      )
    }
  }, [universityId, isReady])

  const contextValue = useMemo<IAuthenticationContext>(() => {
    return {
      isAuthenticated: !!authenticationTokens?.access_token,
      user: authenticationTokens?.access_token ? user : undefined,
      groups: [],
      updateInformation: async (data, examinationReport, cv, degreeReport) => {
        const formData = new FormData()

        formData.append('data', new Blob([JSON.stringify(data)], { type: 'application/json' }))

        if (examinationReport) {
          formData.append('examinationReport', examinationReport!)
        }

        if (cv) {
          formData.append('cv', cv)
        }

        if (degreeReport) {
          formData.append('degreeReport', degreeReport)
        }

        const response = await doRequest<IUser>('/v2/user-info', {
          method: 'PUT',
          requiresAuth: true,
          formData,
        })

        if (response.ok) {
          setUser(response.data)
        } else {
          throw new ApiError(response)
        }
      },
      login: () =>
        readySignal.then(() => {
          if (!keycloak.authenticated) {
            return keycloak.login()
          }
        }),
      logout: (redirectUri: string) => {
        setAuthenticationTokens(undefined)

        const timeout = setTimeout(() => {
          window.location.href = `${window.location.origin}${redirectUri}`
        }, 2000)

        readySignal.then(() => {
          if (keycloak.authenticated) {
            clearTimeout(timeout)

            void keycloak.logout({
              redirectUri: `${window.location.origin}${redirectUri}`,
            })
          }
        })
      },
    }
  }, [user, !!authenticationTokens?.access_token, location.origin])

  return (
    <AuthenticationContext.Provider value={contextValue}>{children}</AuthenticationContext.Provider>
  )
}

export default AuthenticationProvider
