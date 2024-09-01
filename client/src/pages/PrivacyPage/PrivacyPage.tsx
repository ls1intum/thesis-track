import ContentContainer from '../../app/layout/ContentContainer/ContentContainer'
import { Title } from '@mantine/core'
import { GLOBAL_CONFIG } from '../../config/global'
import DocumentEditor from '../../components/DocumentEditor/DocumentEditor'

const PrivacyPage = () => {
  return (
    <ContentContainer size='md'>
      <Title mb='md'>Privacy</Title>
      <DocumentEditor value={GLOBAL_CONFIG.privacy_text} noBorder />
    </ContentContainer>
  )
}

export default PrivacyPage
