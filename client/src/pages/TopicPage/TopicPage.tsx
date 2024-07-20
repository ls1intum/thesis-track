import AuthenticatedArea from '../../app/layout/AuthenticatedArea/AuthenticatedArea'
import ContentContainer from '../../app/layout/ContentContainer/ContentContainer'
import React from 'react'
import { usePageTitle } from '../../hooks/theme'

const TopicPage = () => {
  // TODO: implement component
  usePageTitle('Topic')

  return (
    <ContentContainer>
      <h1>Topic</h1>
    </ContentContainer>
  )
}

export default TopicPage
