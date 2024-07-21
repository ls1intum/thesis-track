import { useEffect } from 'react'
import { useAuthenticationContext } from '../../hooks/authentication'

const LogoutPage = () => {
  const auth = useAuthenticationContext()

  useEffect(() => {
    auth.logout('/')
  })

  return <></>
}

export default LogoutPage
