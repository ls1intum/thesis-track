import { useState, useEffect } from 'react'

const useDeviceDetection = (): string => {
  const [device, setDevice] = useState('')

  useEffect(() => {
    const handleDeviceDetection = (): void => {
      const userAgent = navigator.userAgent.toLowerCase()
      const isMobile = /iphone|ipad|ipod|android|blackberry|windows phone/g.test(userAgent)
      const isTablet = /(ipad|tablet|playbook|silk)|(android(?!.*mobile))/g.test(userAgent)

      // no differentiation between tablet and mobile
      if (isMobile || isTablet) {
        setDevice('mobile')
      } /* else if (isTablet) {
        setDevice('tablet')
      } */ else {
        setDevice('desktop')
      }
    }

    handleDeviceDetection()
    window.addEventListener('resize', handleDeviceDetection)

    return () => {
      window.removeEventListener('resize', handleDeviceDetection)
    }
  }, [])

  return device
}

export default useDeviceDetection
