import AuthenticatedArea from '../../app/layout/AuthenticatedArea/AuthenticatedArea'
import ContentContainer from '../../app/layout/ContentContainer/ContentContainer'
import React from 'react'
import { usePageTitle } from '../../hooks/theme'

const CreateTopicPage = () => {
  // TODO: implement component
  usePageTitle('Create Topic')

  return (
    <ContentContainer>
      <h1>Create Topic</h1>
    </ContentContainer>
  )
}

export default CreateTopicPage
