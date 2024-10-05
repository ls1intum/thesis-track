import { Title } from '@mantine/core'
import { GLOBAL_CONFIG } from '../../config/global'
import DocumentEditor from '../../components/DocumentEditor/DocumentEditor'
import { usePageTitle } from '../../hooks/theme'
import PublicArea from '../../app/layout/PublicArea/PublicArea'

const PrivacyPage = () => {
  usePageTitle('Privacy')

  return (
    <PublicArea withBackButton={true}>
      <Title mb='md'>Privacy</Title>
      <DocumentEditor value={GLOBAL_CONFIG.privacy_text} />
    </PublicArea>
  )
}

export default PrivacyPage
