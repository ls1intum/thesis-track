import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'

const LogoutPage = () => {
  // TODO: implement component
  const navigate = useNavigate()

  useEffect(() => {
    navigate('/', { replace: true })
  })

  return <></>
}

export default LogoutPage
