import React, { useEffect } from 'react'
import { useWindowScroll } from '@mantine/hooks'
import { useLocation } from 'react-router-dom'
import { useNavigationType } from 'react-router'

const ScrollToTop = () => {
  const [, scrollTo] = useWindowScroll()
  const navigationType = useNavigationType()
  const location = useLocation()

  useEffect(() => {
    if (navigationType === 'POP') {
      return
    }

    scrollTo({ y: 0 })
  }, [location.pathname, navigationType])

  return <></>
}

export default ScrollToTop
