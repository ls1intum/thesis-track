import AuthenticatedArea from '../../app/layout/AuthenticatedArea/AuthenticatedArea'
import ContentContainer from '../../app/layout/ContentContainer/ContentContainer'
import React from 'react'
import { usePageTitle } from '../../hooks/theme'

const SubmitAssessmentPage = () => {
  // TODO: implement component
  usePageTitle('Submit Assessment')

  return (
    <AuthenticatedArea>
      <ContentContainer>
        <h1>Submit Assessment</h1>
      </ContentContainer>
    </AuthenticatedArea>
  )
}

export default SubmitAssessmentPage
