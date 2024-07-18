import AuthenticatedArea from '../../app/layout/AuthenticatedArea/AuthenticatedArea'
import ContentContainer from '../../app/layout/ContentContainer/ContentContainer'
import React from 'react'
import { usePageTitle } from '../../hooks/theme'
import ThesisConfigSection from './components/ThesisConfigSection/ThesisConfigSection'
import ThesisInfoSection from './components/ThesisInfoSection/ThesisInfoSection'
import ThesisProposalSection from './components/ThesisProposalSection/ThesisProposalSection'
import ThesisWritingSection from './components/ThesisWritingSection/ThesisWritingSection'
import ThesisAssessmentSection from './components/ThesisAssessmentSection/ThesisAssessmentSection'
import ThesisFinalGradeSection from './components/ThesisFinalGradeSection/ThesisFinalGradeSection'

const ThesisPage = () => {
  // TODO: implement component
  usePageTitle('Topic')

  return (
    <AuthenticatedArea>
      <ThesisConfigSection />
      <ThesisInfoSection />
      <ThesisProposalSection />
      <ThesisWritingSection />
      <ThesisAssessmentSection />
      <ThesisFinalGradeSection />
    </AuthenticatedArea>
  )
}

export default ThesisPage
