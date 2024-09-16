import { ApplicationState, IApplication } from '../../requests/responses/application'
import { useApplicationsContextUpdater } from '../../contexts/ApplicationsProvider/hooks'
import { isNotEmpty, useForm } from '@mantine/form'
import { GLOBAL_CONFIG } from '../../config/global'
import React, { useEffect, useState } from 'react'
import { useDebouncedValue } from '@mantine/hooks'
import { doRequest } from '../../requests/request'
import {
  Button,
  Checkbox,
  Divider,
  Group,
  Select,
  Space,
  Stack,
  Text,
  Textarea,
  TextInput,
} from '@mantine/core'
import UserMultiSelect from '../UserMultiSelect/UserMultiSelect'
import { isNotEmptyUserList } from '../../utils/validation'
import { showSimpleError, showSimpleSuccess } from '../../utils/notification'
import { getApiResponseErrorMessage } from '../../requests/handler'
import ApplicationRejectButton from '../ApplicationRejectButton/ApplicationRejectButton'
import { useLoggedInUser } from '../../hooks/authentication'
import AvatarUser from '../AvatarUser/AvatarUser'
import { formatDate } from '../../utils/format'

interface IApplicationReviewFormProps {
  application: IApplication
  onUpdate: (application: IApplication) => unknown
}

interface IApplicationReviewForm {
  applicationId: string | null
  title: string
  type: string | null
  comment: string
  advisors: string[]
  supervisors: string[]
  notifyUser: boolean
  closeTopic: boolean
}

const ApplicationReviewForm = (props: IApplicationReviewFormProps) => {
  const { application, onUpdate } = props

  const user = useLoggedInUser()
  const updateApplicationContext = useApplicationsContextUpdater()

  const form = useForm<IApplicationReviewForm>({
    mode: 'controlled',
    initialValues: {
      applicationId: null,
      title: '',
      type: null,
      comment: '',
      advisors: [],
      supervisors: [],
      notifyUser: true,
      closeTopic: false,
    },
    validateInputOnBlur: true,
    validate: {
      title: isNotEmpty('Thesis title must not be empty'),
      type: isNotEmpty('Thesis type must not be empty'),
      advisors: isNotEmptyUserList('advisor'),
      supervisors: isNotEmptyUserList('supervisor'),
    },
  })

  useEffect(() => {
    if (application) {
      form.setInitialValues({
        applicationId: application.applicationId,
        title: application.topic?.title || application.thesisTitle || '',
        comment: application.comment || '',
        type:
          application.thesisType || GLOBAL_CONFIG.thesis_types[application.user.studyDegree || '']
            ? application.user.studyDegree
            : null,
        advisors: application.topic?.advisors.map((advisor) => advisor.userId) ?? [],
        supervisors:
          application.topic?.supervisors.map((supervisor) => supervisor.userId) ??
          GLOBAL_CONFIG.default_supervisors,
        notifyUser: true,
        closeTopic: false,
      })
    }

    form.reset()
  }, [application?.applicationId])

  const [loading, setLoading] = useState(false)

  const [debouncedComment] = useDebouncedValue(form.values.comment, 1000)

  useEffect(() => {
    if (form.values.applicationId !== application.applicationId) {
      return
    }

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

            onUpdate(res.data)
          } else {
            showSimpleError(getApiResponseErrorMessage(res))
          }
        },
      )
    }
  }, [debouncedComment, application?.applicationId])

  const onSubmit = async (values: IApplicationReviewForm) => {
    setLoading(true)

    try {
      const response = await doRequest<IApplication[]>(
        `/v2/applications/${application.applicationId}/accept`,
        {
          method: 'PUT',
          requiresAuth: true,
          data: {
            thesisTitle: values.title,
            thesisType: values.type,
            advisorIds: values.advisors,
            supervisorIds: values.supervisors,
            notifyUser: values.notifyUser,
            closeTopic: values.closeTopic,
          },
        },
      )

      if (response.ok) {
        showSimpleSuccess('Application accepted successfully')

        for (const item of response.data) {
          updateApplicationContext(item)
        }

        const currentApplication = response.data.find(
          (item) => item.applicationId === application.applicationId,
        )

        if (currentApplication) {
          onUpdate(currentApplication)
        }
      } else {
        showSimpleError(getApiResponseErrorMessage(response))
      }
    } finally {
      setLoading(false)
    }
  }

  const onReviewReasonChange = async (reason: string) => {
    setLoading(true)

    try {
      const response = await doRequest<IApplication>(
        `/v2/applications/${application.applicationId}/review`,
        {
          method: 'PUT',
          requiresAuth: true,
          data: {
            reason,
          },
        },
      )

      if (response.ok) {
        showSimpleSuccess('Application review reason updated successfully')

        updateApplicationContext(response.data)
        onUpdate(response.data)
      } else {
        showSimpleError(getApiResponseErrorMessage(response))
      }
    } finally {
      setLoading(false)
    }
  }

  const reviewers = application.reviewers || []

  if (!reviewers.some((row) => row.user.userId === user.userId)) {
    reviewers.unshift({
      user: user,
      reason: 'NOT_REVIEWED',
      reviewedAt: '',
    })
  }

  return (
    <form onSubmit={form.onSubmit((values) => onSubmit(values))}>
      <Stack gap='sm'>
        {reviewers.map((reviewer) => (
          <Group key={reviewer.user.userId} grow wrap='nowrap'>
            <AvatarUser user={reviewer.user} />
            <Select
              value={reviewer.reason}
              data={[
                { value: 'NOT_REVIEWED', label: 'Not reviewed' },
                { value: 'INTERESTED', label: 'Interested' },
                { value: 'NOT_INTERESTED', label: 'Not interested' },
              ]}
              onChange={(reason) => reason && onReviewReasonChange(reason)}
              disabled={
                reviewer.user.userId !== user.userId || application.state !== 'NOT_ASSESSED'
              }
            />
            <Text truncate>{reviewer.reviewedAt && formatDate(reviewer.reviewedAt)}</Text>
          </Group>
        ))}
        <Stack gap='0'>
          <Textarea
            label='Comment'
            placeholder='Add a comment'
            autosize={true}
            minRows={5}
            {...form.getInputProps('comment')}
          />
          <Text ta='right' fz='xs'>
            {form.values.comment !== application.comment ? 'Saving...' : 'Saved!'}
          </Text>
        </Stack>
      </Stack>
      {application?.state === ApplicationState.NOT_ASSESSED && (
        <Stack gap='sm'>
          <Space />
          <Divider />
          <TextInput
            type='text'
            required={true}
            placeholder='Thesis Title'
            label='Thesis Title'
            {...form.getInputProps('title')}
          />

          <Select
            label='Thesis Type'
            required={true}
            data={Object.entries(GLOBAL_CONFIG.thesis_types).map(([key, value]) => ({
              value: key,
              label: value,
            }))}
            {...form.getInputProps('type')}
          />

          <UserMultiSelect
            label='Supervisor'
            required={true}
            groups={['supervisor']}
            maxValues={1}
            initialUsers={application.topic?.supervisors}
            {...form.getInputProps('supervisors')}
          />
          <UserMultiSelect
            label='Advisor(s)'
            required={true}
            groups={['advisor', 'supervisor']}
            initialUsers={application.topic?.advisors}
            {...form.getInputProps('advisors')}
          />

          <Checkbox
            label='Notify Student'
            {...form.getInputProps('notifyUser', { type: 'checkbox' })}
          />

          {application.topic && (
            <Checkbox
              label='Close Topic (This will reject all applications for this topic)'
              {...form.getInputProps('closeTopic', { type: 'checkbox' })}
            />
          )}

          <Group grow>
            <ApplicationRejectButton
              key={application.applicationId}
              application={application}
              onUpdate={(newApplication) => {
                onUpdate(newApplication)
              }}
            />
            <Button
              type='submit'
              variant='outline'
              color='green'
              loading={loading}
              disabled={!form.isValid()}
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
