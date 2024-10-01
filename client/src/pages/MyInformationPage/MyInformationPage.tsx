import ContentContainer from '../../app/layout/ContentContainer/ContentContainer'
import React from 'react'
import { usePageTitle } from '../../hooks/theme'
import { Title } from '@mantine/core'
import UserInformationForm from '../../components/UserInformationForm/UserInformationForm'
import { showSimpleSuccess } from '../../utils/notification'

const MyInformationPage = () => {
  usePageTitle('My Information')

  return (
    <ContentContainer>
      <Title mb='md'>My Information</Title>
      <UserInformationForm
        requireCompletion={false}
        includeAvatar={true}
        onComplete={() => showSimpleSuccess('You successfully updated your profile')}
      />
    </ContentContainer>
  )
}

export default MyInformationPage
