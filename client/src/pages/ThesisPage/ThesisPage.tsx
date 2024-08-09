import { usePageTitle } from '../../hooks/theme'
import ThesisConfigSection from './components/ThesisConfigSection/ThesisConfigSection'
import ThesisInfoSection from './components/ThesisInfoSection/ThesisInfoSection'
import ThesisProposalSection from './components/ThesisProposalSection/ThesisProposalSection'
import ThesisWritingSection from './components/ThesisWritingSection/ThesisWritingSection'
import ThesisAssessmentSection from './components/ThesisAssessmentSection/ThesisAssessmentSection'
import ThesisFinalGradeSection from './components/ThesisFinalGradeSection/ThesisFinalGradeSection'
import { useParams } from 'react-router-dom'
import ContentContainer from '../../app/layout/ContentContainer/ContentContainer'
import { Space } from '@mantine/core'
import ThesisHeader from './components/ThesisHeader/ThesisHeader'
import ThesisProvider from '../../contexts/ThesisProvider/ThesisProvider'
import ThesisAdvisorCommentsSection from './components/ThesisAdvisorCommentsSection/ThesisAdvisorCommentsSection'

const ThesisPage = () => {
  const { thesisId } = useParams<{ thesisId: string }>()

  usePageTitle('Thesis')

  return (
    <ThesisProvider thesisId={thesisId} requireLoadedThesis>
      <ContentContainer>
        <ThesisHeader />
        <ThesisConfigSection />
        <Space my='md' />
        <ThesisAdvisorCommentsSection />
        <Space my='md' />
        <ThesisInfoSection />
        <Space my='md' />
        <ThesisProposalSection />
        <Space my='md' />
        <ThesisWritingSection />
        <Space my='md' />
        <ThesisAssessmentSection />
        <Space my='md' />
        <ThesisFinalGradeSection />
      </ContentContainer>
    </ThesisProvider>
  )
}

export default ThesisPage
