import { Affix, Button, Transition, rem, Container } from '@mantine/core'
import { useWindowScroll } from '@mantine/hooks'
import { LegacyApplicationsDatatable } from './components/LegacyApplicationsDatatable/LegacyApplicationsDatatable'
import { ArrowUp } from 'phosphor-react'

const LegacyApplicationReviewPage = () => {
  const [scroll, scrollTo] = useWindowScroll()

  return (
    <Container>
      <LegacyApplicationsDatatable />
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
    </Container>
  )
}

export default LegacyApplicationReviewPage
