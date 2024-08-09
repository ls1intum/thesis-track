import { ApplicationState, IApplication } from '../../requests/responses/application'
import { useApplicationsContext } from '../../contexts/ApplicationsProvider/hooks'
import { isNotEmpty, useForm } from '@mantine/form'
import { GLOBAL_CONFIG } from '../../config/global'
import React, { useEffect, useState } from 'react'
import { useDebouncedValue } from '@mantine/hooks'
import { doRequest } from '../../requests/request'
import { Button, Checkbox, Divider, Group, Stack, Text, Textarea, TextInput } from '@mantine/core'
import UserMultiSelect from '../UserMultiSelect/UserMultiSelect'
import { isNotEmptyUserList } from '../../utils/validation'
import { showSimpleError, showSimpleSuccess } from '../../utils/notification'

interface IApplicationReviewFormProps {
  application: IApplication
  onUpdate: () => unknown
}

const ApplicationReviewForm = (props: IApplicationReviewFormProps) => {
  const { application, onUpdate } = props

  const { updateApplication } = useApplicationsContext()

  const form = useForm<{
    title: string
    comment: string
    advisors: string[]
    supervisors: string[]
    notifyUser: boolean
  }>({
    mode: 'controlled',
    initialValues: {
      title: application?.thesisTitle || '',
      comment: '',
      advisors: [],
      supervisors: GLOBAL_CONFIG.default_supervisors,
      notifyUser: true,
    },
    validateInputOnBlur: true,
    validate: {
      title: isNotEmpty('Title must not be empty'),
      advisors: isNotEmptyUserList('advisor'),
      supervisors: isNotEmptyUserList('supervisor'),
    },
  })

  useEffect(() => {
    form.reset()
    form.setFieldValue('title', application?.thesisTitle || '')
    form.setFieldValue('comment', application?.comment || '')
  }, [application?.applicationId])

  const [loading, setLoading] = useState(false)

  const [debouncedComment] = useDebouncedValue(form.values.comment, 1000)

  useEffect(() => {
    if (application && debouncedComment !== application.comment) {
      doRequest<IApplication>(
        `/v2/applications/${application.applicationId}/comment`,
        {
          method: 'PUT',
          requiresAuth: true,
          data: {
            comment: debouncedComment,
          },
        },
        (res) => {
          if (res.ok) {
            application.comment = res.data.comment

            updateApplication(res.data)
          }
        },
      )
    }
  }, [debouncedComment, application?.applicationId])

  return (
    <form>
      {application?.state === ApplicationState.NOT_ASSESSED && (
        <Stack gap='md'>
          <Divider my='md' />

          <TextInput
            type='text'
            required={true}
            placeholder='Thesis Title'
            label='Thesis Title'
            {...form.getInputProps('title')}
          />

          <UserMultiSelect
            label='Supervisor'
            required={true}
            groups={['supervisor']}
            maxValues={1}
            {...form.getInputProps('supervisors')}
          />
          <UserMultiSelect
            label='Advisor'
            required={true}
            groups={['advisor', 'supervisor']}
            {...form.getInputProps('advisors')}
          />

          <Stack gap='0'>
            <Textarea
              label='Comment'
              placeholder='Comment'
              autosize={true}
              minRows={5}
              {...form.getInputProps('comment')}
            />
            <Text ta='right' fz='xs'>
              {form.values.comment !== application.comment ? 'Saving...' : 'Saved!'}
            </Text>
          </Stack>

          <Checkbox
            label='Notify Student'
            {...form.getInputProps('notifyUser', { type: 'checkbox' })}
          />

          <Group grow>
            {/* REJECT Button */}
            <Button
              variant='outline'
              loading={loading}
              color='red'
              onClick={async () => {
                setLoading(true)

                const response = await doRequest<IApplication>(
                  `/v2/applications/${application.applicationId}/reject`,
                  {
                    method: 'PUT',
                    requiresAuth: true,
                    data: {
                      comment: form.values.comment,
                      notifyUser: form.values.notifyUser,
                    },
                  },
                )

                setLoading(false)

                if (response.ok) {
                  showSimpleSuccess('Application rejected successfully')

                  updateApplication(response.data)
                  onUpdate()
                } else {
                  showSimpleError(`Failed to reject application: ${response.status}`)
                }
              }}
            >
              Reject
            </Button>
            {/* ACCEPT Button */}
            <Button
              variant='outline'
              color='green'
              loading={loading}
              disabled={!form.isValid()}
              onClick={async () => {
                setLoading(true)

                const response = await doRequest<IApplication>(
                  `/v2/applications/${application.applicationId}/accept`,
                  {
                    method: 'PUT',
                    requiresAuth: true,
                    data: {
                      notifyUser: form.values.notifyUser,
                      closeTopic: false,
                      comment: form.values.comment,
                      advisorIds: form.values.advisors,
                      supervisorIds: form.values.supervisors,
                      thesisTitle: form.values.title,
                    },
                  },
                )

                setLoading(false)

                if (response.ok) {
                  showSimpleSuccess('Application accepted successfully')

                  updateApplication(response.data)
                  onUpdate()
                } else {
                  showSimpleError(`Failed to accept application: ${response.status}`)
                }
              }}
            >
              Accept
            </Button>
          </Group>
        </Stack>
      )}
    </form>
  )
}

export default ApplicationReviewForm
