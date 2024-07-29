import { useEffect } from 'react'
import { Affix, Button, Center, Transition, rem, Container } from '@mantine/core'
import { useWindowScroll } from '@mantine/hooks'
import { LegacyThesisApplicationsDatatable } from './components/LegacyThesisApplicationsDatatable/LegacyThesisApplicationsDatatable'
import { ArrowUp } from 'phosphor-react'
import { useLoggedInUser } from '../../hooks/authentication'
import { doRequest } from '../../requests/request'

const LegacyApplicationReviewPage = () => {
  const [scroll, scrollTo] = useWindowScroll()

  const user = useLoggedInUser()

  useEffect(() => {
    return doRequest(
      '/api/thesis-applications/thesis-advisors',
      {
        method: 'PUT',
        requiresAuth: true,
        data: {
          firstName: user.first_name,
          lastName: user.last_name,
          email: user.email,
          tumId: user.university_id,
        },
      },
      () => {},
    )
  }, [user.user_id])

  return (
    <Container>
      <Center>
        <LegacyThesisApplicationsDatatable />
        <Affix position={{ bottom: 20, right: 20 }}>
          <Transition transition='slide-up' mounted={scroll.y > 0}>
            {(transitionStyles) => (
              <Button
                leftSection={<ArrowUp style={{ width: rem(16), height: rem(16) }} />}
                style={transitionStyles}
                onClick={() => scrollTo({ y: 0 })}
              >
                Scroll to top
              </Button>
            )}
          </Transition>
        </Affix>
      </Center>
    </Container>
  )
}

export default LegacyApplicationReviewPage
