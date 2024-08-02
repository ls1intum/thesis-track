import { Affix, Button, rem, Transition } from '@mantine/core'
import { ArrowUp } from 'phosphor-react'
import React, { useEffect } from 'react'
import { useWindowScroll } from '@mantine/hooks'
import { useLocation } from 'react-router-dom'
import { useNavigationType } from 'react-router'

const ScrollToTop = () => {
  const [scroll, scrollTo] = useWindowScroll()
  const navigationType = useNavigationType()
  const location = useLocation()

  useEffect(() => {
    if (navigationType === 'POP') {
      return
    }

    scrollTo({y: 0})
  }, [location.pathname, navigationType])

  return (
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
  )
}

export default ScrollToTop