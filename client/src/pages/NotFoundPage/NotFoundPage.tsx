import { usePageTitle } from '../../hooks/theme'
import NotFound from '../../components/NotFound/NotFound'

const NotFoundPage = () => {
  usePageTitle('Not Found')

  return <NotFound />
}

export default NotFoundPage
