import { Affix, Button, Transition, rem } from '@mantine/core'
import { useWindowScroll } from '@mantine/hooks'
import { LegacyApplicationsDatatable } from './components/LegacyApplicationsDatatable/LegacyApplicationsDatatable'
import { ArrowUp } from 'phosphor-react'
import React from 'react'
import ContentContainer from '../../app/layout/ContentContainer/ContentContainer'

const LegacyApplicationReviewPage = () => {
  const [scroll, scrollTo] = useWindowScroll()

  return (
    <ContentContainer>
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
    </ContentContainer>
  )
}

export default LegacyApplicationReviewPage
