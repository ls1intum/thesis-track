import { doRequest } from '../../requests/request'
import { ApplicationState, IApplication } from '../../requests/responses/application'
import { showSimpleError, showSimpleSuccess } from '../../utils/notification'
import { Button } from '@mantine/core'
import React, { useState } from 'react'
import { ButtonProps } from '@mantine/core/lib/components/Button/Button'
import { useApplicationsContextUpdater } from '../../contexts/ApplicationsProvider/hooks'

interface IApplicationRejectButtonProps extends ButtonProps {
  application: IApplication
  notifyUser: boolean
  onUpdate: (application: IApplication) => unknown
}

const ApplicationRejectButton = (props: IApplicationRejectButtonProps) => {
  const { application, notifyUser, onUpdate, ...buttonProps } = props

  const updateApplication = useApplicationsContextUpdater()

  const [loading, setLoading] = useState(false)

  const onReject = async () => {
    setLoading(true)

    try {
      const response = await doRequest<IApplication>(
        `/v2/applications/${application.applicationId}/reject`,
        {
          method: 'PUT',
          requiresAuth: true,
          data: {
            notifyUser: notifyUser,
          },
        },
      )

      if (response.ok) {
        showSimpleSuccess('Application rejected successfully')

        updateApplication(response.data)
        onUpdate(response.data)
      } else {
        showSimpleError(`Failed to reject application: ${response.status}`)
      }
    } finally {
      setLoading(false)
    }
  }

  if (application.state !== ApplicationState.NOT_ASSESSED) {
    return <></>
  }

  return (
    <Button {...buttonProps} variant='outline' loading={loading} color='red' onClick={onReject}>
      Reject
    </Button>
  )
}

export default ApplicationRejectButton
