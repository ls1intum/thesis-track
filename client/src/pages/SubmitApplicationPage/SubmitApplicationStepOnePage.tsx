import AuthenticatedArea from '../../app/layout/AuthenticatedArea/AuthenticatedArea'
import ContentContainer from '../../app/layout/ContentContainer/ContentContainer'
import React from 'react'
import { usePageTitle } from '../../hooks/theme'

const SubmitApplicationStepOnePage = () => {
  // TODO: implement component
  usePageTitle('Pick Topic')

  return (
    <ContentContainer>
      <h1>Select Topic</h1>
    </ContentContainer>
  )
}

export default SubmitApplicationStepOnePage
