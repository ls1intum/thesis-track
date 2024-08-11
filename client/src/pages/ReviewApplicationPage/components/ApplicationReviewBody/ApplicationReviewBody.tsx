import ApplicationData from '../../../../components/ApplicationData/ApplicationData'
import ApplicationReviewForm from '../../../../components/ApplicationReviewForm/ApplicationReviewForm'
import { Divider, Stack } from '@mantine/core'
import React from 'react'
import { IApplication } from '../../../../requests/responses/application'

interface IApplicationReviewBodyProps {
  application: IApplication
  onChange: (application: IApplication) => unknown
}

const ApplicationReviewBody = (props: IApplicationReviewBodyProps) => {
  const { application, onChange } = props

  return (
    <Stack>
      <ApplicationData application={application} />
      <Divider />
      <ApplicationReviewForm
        application={application}
        onUpdate={(newApplication) => onChange(newApplication)}
      />
    </Stack>
  )
}

export default ApplicationReviewBody
