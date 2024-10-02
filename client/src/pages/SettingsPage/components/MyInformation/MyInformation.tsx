import { showSimpleSuccess } from '../../../../utils/notification'
import UserInformationForm from '../../../../components/UserInformationForm/UserInformationForm'
import React from 'react'
import { usePageTitle } from '../../../../hooks/theme'

const MyInformation = () => {
  usePageTitle('My Information')

  return (
    <UserInformationForm
      requireCompletion={false}
      includeAvatar={true}
      onComplete={() => showSimpleSuccess('You successfully updated your profile')}
    />
  )
}

export default MyInformation
