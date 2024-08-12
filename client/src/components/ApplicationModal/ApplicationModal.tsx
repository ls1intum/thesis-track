import { IApplication } from '../../requests/responses/application'
import { Modal, Stack, Divider } from '@mantine/core'
import React from 'react'
import ApplicationReviewForm from '../ApplicationReviewForm/ApplicationReviewForm'
import ApplicationData from '../ApplicationData/ApplicationData'

interface IApplicationModalProps {
  application: IApplication | undefined
  onClose: () => unknown
  allowReviews: boolean
}

const ApplicationModal = (props: IApplicationModalProps) => {
  const { application, onClose, allowReviews } = props

  return (
    <Modal centered size='100vw' opened={!!application} onClose={onClose}>
      <Stack>
        {application && (
          <ApplicationData
            application={application}
            bottomSection={
              allowReviews ? (
                <Stack>
                  <Divider />
                  <ApplicationReviewForm application={application} onUpdate={onClose} />
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
