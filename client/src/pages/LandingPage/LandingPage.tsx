import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'

const LandingPage = () => {
  // TODO: implement component
  const navigate = useNavigate()

  useEffect(() => {
    navigate('/applications/thesis', { replace: true })
  }, [])

  return <></>
}

export default LandingPage
