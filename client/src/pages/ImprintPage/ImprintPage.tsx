import { Title } from '@mantine/core'
import DocumentEditor from '../../components/DocumentEditor/DocumentEditor'
import { GLOBAL_CONFIG } from '../../config/global'
import { usePageTitle } from '../../hooks/theme'
import PublicArea from '../../app/layout/PublicArea/PublicArea'

const ImprintPage = () => {
  usePageTitle('Imprint')

  return (
    <PublicArea withBackButton={true}>
      <Title mb='md'>Imprint</Title>
      <DocumentEditor value={GLOBAL_CONFIG.imprint_text} />
    </PublicArea>
  )
}

export default ImprintPage
