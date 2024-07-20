import AuthenticatedArea from '../../app/layout/AuthenticatedArea/AuthenticatedArea'
import ContentContainer from '../../app/layout/ContentContainer/ContentContainer'
import React from 'react'
import { usePageTitle } from '../../hooks/theme'

const DashboardPage = () => {
  // TODO: implement component
  usePageTitle('Dashboard')

  return (
    <ContentContainer>
      <h1>Dashboard</h1>
    </ContentContainer>
  )
}

export default DashboardPage
