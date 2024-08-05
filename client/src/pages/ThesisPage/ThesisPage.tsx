import React from 'react'
import { usePageTitle } from '../../hooks/theme'
import ThesisConfigSection from './components/ThesisConfigSection/ThesisConfigSection'
import ThesisInfoSection from './components/ThesisInfoSection/ThesisInfoSection'
import ThesisProposalSection from './components/ThesisProposalSection/ThesisProposalSection'
import ThesisWritingSection from './components/ThesisWritingSection/ThesisWritingSection'
import ThesisAssessmentSection from './components/ThesisAssessmentSection/ThesisAssessmentSection'
import ThesisFinalGradeSection from './components/ThesisFinalGradeSection/ThesisFinalGradeSection'
import { useThesis } from '../../hooks/fetcher'
import { useParams } from 'react-router-dom'
import NotFound from '../../components/NotFound/NotFound'
import ContentContainer from '../../app/layout/ContentContainer/ContentContainer'
import PageLoader from '../../components/PageLoader/PageLoader'

const ThesisPage = () => {
  const { thesisId } = useParams<{ thesisId: string }>()

  const thesis = useThesis(thesisId)

  usePageTitle(thesis ? thesis.title : 'Thesis')

  if (thesis === false) {
    return <NotFound />
  }

  if (thesis === undefined) {
    return <PageLoader />
  }

  return (
    <ContentContainer>
      <ThesisConfigSection thesis={thesis} />
      <ThesisInfoSection thesis={thesis} />
      <ThesisProposalSection thesis={thesis} />
      <ThesisWritingSection thesis={thesis} />
      <ThesisAssessmentSection thesis={thesis} />
      <ThesisFinalGradeSection thesis={thesis} />
    </ContentContainer>
  )
}

export default ThesisPage
