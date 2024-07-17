import AuthenticatedArea from '../../app/layout/AuthenticatedArea/AuthenticatedArea'
import ContentContainer from '../../app/layout/ContentContainer/ContentContainer'
import React from 'react'

const DashboardPage = () => {
  // TODO: implement component
  return (
    <AuthenticatedArea>
      <ContentContainer>
        <h1>Dashboard</h1>
      </ContentContainer>
    </AuthenticatedArea>
  )
}

export default DashboardPage
