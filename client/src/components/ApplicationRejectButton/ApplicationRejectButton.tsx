import { doRequest } from '../../requests/request'
import { ApplicationState, IApplication } from '../../requests/responses/application'
import { showSimpleError, showSimpleSuccess } from '../../utils/notification'
import { Button, Checkbox, Modal, Radio, Stack, Text } from '@mantine/core'
import React, { useEffect, useState } from 'react'
import { ButtonProps } from '@mantine/core/lib/components/Button/Button'
import { useApplicationsContextUpdater } from '../../contexts/ApplicationsProvider/hooks'
import { getApiResponseErrorMessage } from '../../requests/handler'
import { isNotEmpty, useForm } from '@mantine/form'

interface IApplicationRejectButtonProps extends ButtonProps {
  application: IApplication
  onUpdate: (application: IApplication) => unknown
}

interface IFormValues {
  notifyUser: boolean
  reason: string | null
}

const ApplicationRejectButton = (props: IApplicationRejectButtonProps) => {
  const { application, onUpdate, ...buttonProps } = props

  const updateApplicationContext = useApplicationsContextUpdater()

  const [confirmationModal, setConfirmationModal] = useState(false)
  const [loading, setLoading] = useState(false)

  const form = useForm<IFormValues>({
    mode: 'controlled',
    initialValues: {
      notifyUser: true,
      reason: application.topic ? 'FAILED_TOPIC_REQUIREMENTS' : 'TITLE_NOT_INTERESTING',
    },
    validateInputOnBlur: true,
    validate: {
      reason: isNotEmpty('Reason is required'),
    },
  })

  useEffect(() => {
    form.reset()
  }, [confirmationModal])

  if (application.state !== ApplicationState.NOT_ASSESSED) {
    return <></>
  }

  const onReject = async (values: IFormValues) => {
    setLoading(true)

    try {
      const response = await doRequest<IApplication[]>(
        `/v2/applications/${application.applicationId}/reject`,
        {
          method: 'PUT',
          requiresAuth: true,
          data: {
            reason: values.reason,
            notifyUser: values.notifyUser,
          },
        },
      )

      if (response.ok) {
        showSimpleSuccess('Application rejected successfully')

        for (const item of response.data) {
          updateApplicationContext(item)
        }

        const currentApplication = response.data.find(
          (item) => item.applicationId === application.applicationId,
        )

        if (currentApplication) {
          onUpdate(currentApplication)
        }

        setConfirmationModal(false)
      } else {
        showSimpleError(getApiResponseErrorMessage(response))
      }
    } finally {
      setLoading(false)
    }
  }

  const reasons: Array<{ value: string; label: string }> = [
    application.topic
      ? {
          value: 'FAILED_TOPIC_REQUIREMENTS',
          label: 'Topic requirements not met',
        }
      : {
          value: 'TITLE_NOT_INTERESTING',
          label: 'Suggested topic is not interesting',
        },
    {
      value: 'NO_CAPACITY',
      label: 'No capacity at the moment',
    },
    {
      value: 'FAILED_STUDENT_REQUIREMENTS',
      label: 'General requirements not met (This will reject all applications of this student!)',
    },
  ]

  return (
    <Button
      {...buttonProps}
      variant='outline'
      loading={loading}
      color='red'
      onClick={() => setConfirmationModal(true)}
    >
      <Modal
        title='Reject Application'
        opened={confirmationModal}
        onClick={(e) => e.stopPropagation()}
        onClose={() => setConfirmationModal(false)}
      >
        <form>
          <Stack>
            <Text>Please specify a reason why you want to reject the student</Text>
            <Radio.Group label='Reason' required {...form.getInputProps('reason')}>
              <Stack gap='cs'>
                {reasons.map((reason) => (
                  <Radio key={reason.value} value={reason.value} label={reason.label} />
                ))}
              </Stack>
            </Radio.Group>
            <Checkbox
              label='Notify Student'
              required
              {...form.getInputProps('notifyUser', { type: 'checkbox' })}
            />
            <Button
              onClick={() => onReject(form.getValues())}
              loading={loading}
              disabled={!form.isValid()}
              fullWidth
            >
              Reject Application
            </Button>
          </Stack>
        </form>
      </Modal>
      Reject
    </Button>
  )
}

export default ApplicationRejectButton
