import AuthenticatedArea from '../../app/layout/AuthenticatedArea/AuthenticatedArea'
import ContentContainer from '../../app/layout/ContentContainer/ContentContainer'
import React from 'react'
import { usePageTitle } from '../../hooks/theme'

const SubmitProposalPage = () => {
  // TODO: implement component
  usePageTitle('Submit Proposal')

  return (
    <AuthenticatedArea>
      <ContentContainer>
        <h1>Submit Proposal</h1>
      </ContentContainer>
    </AuthenticatedArea>
  )
}

export default SubmitProposalPage
