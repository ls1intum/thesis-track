import { IApplication } from '../../requests/responses/application'
import { Modal, Stack, Divider } from '@mantine/core'
import React from 'react'
import ApplicationReviewForm from '../ApplicationReviewForm/ApplicationReviewForm'
import ApplicationData from '../ApplicationData/ApplicationData'
import { useApplicationsContextUpdater } from '../../contexts/ApplicationsProvider/hooks'

interface IApplicationModalProps {
  application: IApplication | undefined
  onClose: () => unknown
  allowReviews: boolean
  onUpdate?: (application: IApplication) => unknown
}

const ApplicationModal = (props: IApplicationModalProps) => {
  const { application, onUpdate = () => undefined, onClose, allowReviews } = props

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
