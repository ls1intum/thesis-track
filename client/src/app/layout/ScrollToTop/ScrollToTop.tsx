import React, { useEffect } from 'react'
import { useNavigationType, useLocation } from 'react-router'

const ScrollToTop = () => {
  const navigationType = useNavigationType()
  const location = useLocation()

  useEffect(() => {
    if (navigationType === 'POP') {
      return
    }

    window.scrollTo(0, 0)
  }, [location.pathname, navigationType])

  return <></>
}

export default ScrollToTop
