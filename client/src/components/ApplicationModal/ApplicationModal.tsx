import { ApplicationState, IApplication } from '../../requests/responses/application'
import { Button, Divider, Modal, Stack } from '@mantine/core'
import React from 'react'
import ApplicationReviewForm from '../ApplicationReviewForm/ApplicationReviewForm'
import ApplicationData from '../ApplicationData/ApplicationData'
import { Link } from 'react-router-dom'

interface IApplicationModalProps {
  application: IApplication | undefined
  onClose: () => unknown
  allowReviews?: boolean
  allowEdit?: boolean
  onUpdate?: (application: IApplication) => unknown
}

const ApplicationModal = (props: IApplicationModalProps) => {
  const {
    application,
    onUpdate = () => undefined,
    onClose,
    allowReviews = false,
    allowEdit = false,
  } = props

  return (
    <Modal centered size='100vw' opened={!!application} onClose={onClose}>
      <Stack>
        {application && (
          <ApplicationData
            application={application}
            rightTitleSection={
              allowEdit && application.state === ApplicationState.NOT_ASSESSED ? (
                <Button
                  ml='auto'
                  mt='sm'
                  size='sm'
                  component={Link}
                  to={`/edit-application/${application.applicationId}`}
                  variant='outline'
                  color='green'
                >
                  Edit
                </Button>
              ) : undefined
            }
            bottomSection={
              allowReviews ? (
                <Stack>
                  <Divider />
                  <ApplicationReviewForm
                    application={application}
                    onUpdate={(newApplication) => {
                      onUpdate(newApplication)
                      onClose()
                    }}
                  />
                </Stack>
              ) : undefined
            }
          />
        )}
      </Stack>
    </Modal>
  )
}

export default ApplicationModal
