import { useEffect } from 'react'
import { useAuthenticationContext } from '../../hooks/authentication'
import PageLoader from '../../components/PageLoader/PageLoader'

const LogoutPage = () => {
  const auth = useAuthenticationContext()

  useEffect(() => {
    auth.logout('/')
  })

  return <PageLoader />
}

export default LogoutPage
