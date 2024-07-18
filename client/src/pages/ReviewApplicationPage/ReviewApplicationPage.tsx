import AuthenticatedArea from '../../app/layout/AuthenticatedArea/AuthenticatedArea'
import ContentContainer from '../../app/layout/ContentContainer/ContentContainer'
import React from 'react'

const ReviewApplicationPage = () => {
  // TODO: implement component
  return (
    <AuthenticatedArea collapseNavigation={true}>
      <ContentContainer>
        <h1>Applications</h1>
      </ContentContainer>
    </AuthenticatedArea>
  )
}

export default ReviewApplicationPage
