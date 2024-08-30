import ContentContainer from '../../app/layout/ContentContainer/ContentContainer'
import React from 'react'
import { usePageTitle } from '../../hooks/theme'
import { Alert, Title } from '@mantine/core'
import UserInformationForm from '../../components/UserInformationForm/UserInformationForm'
import { Info } from 'phosphor-react'
import { showSimpleSuccess } from '../../utils/notification'

const MyInformationPage = () => {
  usePageTitle('My Information')

  return (
    <ContentContainer>
      <Title mb='md'>My Information</Title>
      <Alert variant='light' color='blue' title='Update Avatar' icon={<Info />} mb='md'>
        We use{' '}
        <a href='https://www.gravatar.com/' target='_blank' rel='noreferrer'>
          gravatar.com
        </a>{' '}
        for avatars. If you want to add or change your avatar, please do it on the linked site.
      </Alert>
      <UserInformationForm
        requireCompletion={false}
        onComplete={() => showSimpleSuccess('You successfully updated your profile')}
      />
    </ContentContainer>
  )
}

export default MyInformationPage
