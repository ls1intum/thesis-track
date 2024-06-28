import Keycloak from 'keycloak-js'
import { axiosInstance, keycloakRealmName, keycloakUrl } from '../../network/configService'
import { useEffect, useState } from 'react'
import { jwtDecode } from 'jwt-decode'
import ThesisApplicationsDatatable from './components/ThesisApplicationsDatatable/ThesisApplicationsDatatable'
import { Affix, Button, Center, Transition, rem, Container } from '@mantine/core'
import { IconArrowUp } from '@tabler/icons-react'
import { useWindowScroll } from '@mantine/hooks'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { putThesisAdvisor } from '../../network/thesisApplication'
import { ThesisAdvisor } from '../../interfaces/thesisApplication'
import { Query } from '../../hooks/query'
import { useAuthenticationStore } from '../../hooks/authentication'

const ThesisManagementConsole = () => {
  const queryClient = useQueryClient()
  const [scroll, scrollTo] = useWindowScroll()
  const [authenticated, setAuthenticated] = useState(false)
  const { user, setUser } = useAuthenticationStore()

  const addThesisAdvisor = useMutation({
    mutationFn: (thesisAdvisor: ThesisAdvisor) => putThesisAdvisor(thesisAdvisor),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [Query.THESIS_APPLICATION] })
    },
  })

  const keycloak = new Keycloak({
    realm: keycloakRealmName,
    url: keycloakUrl,
    clientId: 'thesis-track-client',
  })
  const [keycloakValue, setKeycloakValue] = useState<Keycloak>(keycloak)

  useEffect(() => {
    if (keycloakValue) {
      axiosInstance.interceptors.request.use(
        async (config) => {
          if (keycloakValue.isTokenExpired(43200)) {
            await keycloakValue?.updateToken(60)
          }
          return config
        },
        (error) => {
          Promise.reject(error)
        },
      )
    }
  }, [keycloakValue])

  useEffect(() => {
    void keycloak
      .init({ onLoad: 'login-required' })
      .then((isAuthenticated) => {
        if (isAuthenticated) {
          setAuthenticated(true)
        } else {
          setAuthenticated(false)
          void keycloak.login()
        }
        localStorage.setItem('jwt_token', keycloak.token ?? '')
        localStorage.setItem('refreshToken', keycloak.refreshToken ?? '')
        try {
          if (keycloak.token) {
            const decodedJwt = jwtDecode<{
              given_name: string
              family_name: string
              email: string
              preferred_username: string
            }>(keycloak.token)
            setUser({
              firstName: decodedJwt.given_name,
              lastName: decodedJwt.family_name,
              email: decodedJwt.email,
              username: decodedJwt.preferred_username,
              mgmtAccess:
                keycloak.hasResourceRole('chair-member', 'thesis-track-server') ||
                keycloak.hasResourceRole('thesis-track-admin', 'thesis-track-server'),
            })

            if (keycloak.hasResourceRole('chair-member', 'thesis-track-server')) {
              addThesisAdvisor.mutate({
                firstName: decodedJwt.given_name,
                lastName: decodedJwt.family_name,
                email: decodedJwt.email,
                tumId: decodedJwt.preferred_username,
              })
            }
          }
        } catch (error) {
          setUser({
            firstName: '',
            lastName: '',
            email: '',
            username: '',
            mgmtAccess: false,
          })
        }
        setKeycloakValue(keycloak)
      })
      .catch((err) => {
        alert(err)
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Container>
      {authenticated && user && user.mgmtAccess && (
        <Center>
          <ThesisApplicationsDatatable />
          <Affix position={{ bottom: 20, right: 20 }}>
            <Transition transition='slide-up' mounted={scroll.y > 0}>
              {(transitionStyles) => (
                <Button
                  leftSection={<IconArrowUp style={{ width: rem(16), height: rem(16) }} />}
                  style={transitionStyles}
                  onClick={() => scrollTo({ y: 0 })}
                >
                  Scroll to top
                </Button>
              )}
            </Transition>
          </Affix>
        </Center>
      )}
    </Container>
  )
}

export default ThesisManagementConsole
