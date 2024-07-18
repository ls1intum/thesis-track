import AuthenticatedArea from '../../app/layout/AuthenticatedArea/AuthenticatedArea'
import ContentContainer from '../../app/layout/ContentContainer/ContentContainer'
import React from 'react'
import { usePageTitle } from '../../hooks/theme'

const SubmitApplicationStepTwoPage = () => {
  // TODO: implement component
  usePageTitle('Submit Application')

  return (
    <AuthenticatedArea>
      <ContentContainer>
        <h1>Submit Application</h1>
      </ContentContainer>
    </AuthenticatedArea>
  )
}

export default SubmitApplicationStepTwoPage
