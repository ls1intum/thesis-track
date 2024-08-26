import ContentContainer from '../../app/layout/ContentContainer/ContentContainer'
import React from 'react'
import { usePageTitle } from '../../hooks/theme'
import { Title } from '@mantine/core'
import UserInformationForm from '../../components/UserInformationForm/UserInformationForm'

const MyInformationPage = () => {
  usePageTitle('My Information')

  return (
    <ContentContainer>
      <Title mb='md'>My Information</Title>
      <UserInformationForm requireCompletion={false} />
    </ContentContainer>
  )
}

export default MyInformationPage
