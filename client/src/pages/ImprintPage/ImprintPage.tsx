import ContentContainer from '../../app/layout/ContentContainer/ContentContainer'
import { Title } from '@mantine/core'
import DocumentEditor from '../../components/DocumentEditor/DocumentEditor'
import { GLOBAL_CONFIG } from '../../config/global'

const ImprintPage = () => {
  return (
    <ContentContainer size='md'>
      <Title mb='md'>Imprint</Title>
      <DocumentEditor value={GLOBAL_CONFIG.imprint_text} />
    </ContentContainer>
  )
}

export default ImprintPage
