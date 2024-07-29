import { ApplicationState, IApplication } from '../../../../requests/responses/application'
import {
  Button,
  Checkbox,
  Modal,
  Stack,
  Textarea,
  Text,
  Group,
  Space,
  Title,
  Center,
  Divider,
} from '@mantine/core'
import { useForm } from '@mantine/form'
import UserMultiSelect from '../../../../components/UserMultiSelect/UserMultiSelect'
import AuthenticatedIframe from '../../../../components/AuthenticatedIframe/AuthenticatedIframe'
import { ApiResponse, doRequest } from '../../../../requests/request'
import { notifications } from '@mantine/notifications'
import React, { ReactElement, useState } from 'react'
import { GLOBAL_CONFIG } from '../../../../config/global'

interface ILegacyApplicationReviewModalProps {
  application: IApplication | undefined
  onClose: () => unknown
  onUpdate: (application: IApplication) => unknown
}

const LabeledItem = (props: {
  label: string
  value: string | number | null | undefined | ReactElement
}) => {
  const { label, value } = props

  return (
    <Stack gap='xs'>
      <Text c='dimmed' fz='xs' fw={700}>
        {label}
      </Text>
      {value && (typeof value === 'string' || typeof value === 'number') && (
        <Text fz='sm' lineClamp={20}>
          {value}
        </Text>
      )}
      {value && typeof value === 'object' && <>{value}</>}
    </Stack>
  )
}

const LegacyApplicationReviewModal = (props: ILegacyApplicationReviewModalProps) => {
  const { application, onClose, onUpdate } = props

  const form = useForm<{
    comment: string
    advisors: string[]
    supervisors: string[]
    notifyUser: boolean
  }>({
    mode: 'controlled',
    initialValues: {
      comment: '',
      advisors: [],
      supervisors: [],
      notifyUser: true,
    },
    validateInputOnBlur: true,
    validate: {
      advisors: (value) => {
        if (value.length === 0) {
          return 'Advisor is required'
        }
      },
      supervisors: (value) => {
        if (value.length === 0) {
          return 'Supervisor is required'
        }
      },
    },
  })

  const [loading, setLoading] = useState(false)

  return (
    <Modal centered size='90%' opened={!!application} onClose={onClose}>
      <Center>
        <Title>Review Application</Title>
      </Center>
      <Space h='md' />
      <form>
        {application && (
          <Stack gap='md'>
            <Group grow preventGrowOverflow>
              {application.user.hasCv && (
                <LabeledItem
                  label='CV'
                  value={
                    <AuthenticatedIframe
                      url={`/v1/users/${application.user.userId}/cv`}
                      height={300}
                      frameBorder={0}
                    />
                  }
                />
              )}
              {application.user.hasExaminationReport && (
                <LabeledItem
                  label='Examination Report'
                  value={
                    <AuthenticatedIframe
                      url={`/v1/users/${application.user.userId}/examination-report`}
                      height={300}
                      frameBorder={0}
                    />
                  }
                />
              )}
              {application.user.hasDegreeReport && (
                <LabeledItem
                  label='Degree Report'
                  value={
                    <AuthenticatedIframe
                      url={`/v1/users/${application.user.userId}/degree-report`}
                      height={300}
                      frameBorder={0}
                    />
                  }
                />
              )}
            </Group>
            <Group grow preventGrowOverflow>
              <LabeledItem label='First Name' value={application.user.firstName} />
              <LabeledItem label='Last Name' value={application.user.lastName} />
              <LabeledItem label='Email' value={application.user.email} />
              <LabeledItem label='Gender' value={application.user.gender} />
              <LabeledItem label='Nationality' value={application.user.nationality} />
            </Group>
            <Group grow preventGrowOverflow>
              <LabeledItem label='University ID' value={application.user.universityId} />
              <LabeledItem
                label='Matriculation Number'
                value={application.user.matriculationNumber}
              />
              <LabeledItem
                label='Study Degree'
                value={
                  GLOBAL_CONFIG.study_degrees[application.user.studyDegree || ''] ??
                  application.user.studyDegree
                }
              />
              <LabeledItem
                label='Study Program'
                value={
                  GLOBAL_CONFIG.study_programs[application.user.studyProgram || ''] ??
                  application.user.studyProgram
                }
              />
              <LabeledItem label='Enrollment Date' value={application.user.enrolledAt} />
            </Group>
            <LabeledItem label='Thesis Title Suggestion' value={application.thesisTitle} />
            <LabeledItem label='Motivation' value={application.motivation} />
            <LabeledItem label='Special Skills' value={application.user.specialSkills} />
            <LabeledItem label='Interests' value={application.user.interests} />
            <LabeledItem label='Projects' value={application.user.projects} />
            <Group grow>
              <LabeledItem label='Desired Start Date' value={application.desiredStartDate} />
              <LabeledItem
                label='Research Areas'
                value={application.user.researchAreas
                  ?.map((key) => GLOBAL_CONFIG.research_areas[key] ?? key)
                  .join(', ')}
              />
              <LabeledItem
                label='Focus Topics'
                value={application.user.focusTopics
                  ?.map((key) => GLOBAL_CONFIG.focus_topics[key] ?? key)
                  .join(', ')}
              />
            </Group>
          </Stack>
        )}

        {application?.state === ApplicationState.NOT_ASSESSED && (
          <Stack gap='md'>
            <Divider my='md' />
            <UserMultiSelect
              label='Supervisor'
              groups={['supervisor']}
              multiSelect={false}
              {...form.getInputProps('supervisors')}
            />
            <UserMultiSelect
              label='Advisor'
              groups={['advisor', 'supervisor']}
              multiSelect={true}
              {...form.getInputProps('advisors')}
            />

            <Textarea
              autosize
              minRows={5}
              label='Comment'
              placeholder='Comment'
              {...form.getInputProps('comment')}
            />

            <Checkbox
              label='Notify Student'
              {...form.getInputProps('notifyUser', { type: 'checkbox' })}
            />

            <Group grow>
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
                  ).catch<ApiResponse<IApplication>>(() => ({
                    ok: false,
                    data: undefined,
                    status: 500,
                  }))

                  setLoading(false)

                  if (response.ok) {
                    notifications.show({
                      color: 'green',
                      autoClose: 5000,
                      title: 'Success',
                      message: 'Application rejected successfully',
                    })

                    onUpdate(response.data)
                    onClose()
                  } else {
                    notifications.show({
                      color: 'red',
                      autoClose: 5000,
                      title: 'Error',
                      message: 'Failed to reject application',
                    })
                  }
                }}
              >
                Reject
              </Button>
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
                        thesisTitle: application?.thesisTitle || 'Thesis Title',
                      },
                    },
                  ).catch<ApiResponse<IApplication>>(() => ({
                    ok: false,
                    data: undefined,
                    status: 500,
                  }))

                  setLoading(false)

                  if (response.ok) {
                    notifications.show({
                      color: 'green',
                      autoClose: 5000,
                      title: 'Success',
                      message: 'Application accepted successfully',
                    })

                    onUpdate(response.data)
                    onClose()
                  } else {
                    notifications.show({
                      color: 'red',
                      autoClose: 5000,
                      title: 'Error',
                      message: 'Failed to accept application',
                    })
                  }
                }}
              >
                Accept
              </Button>
            </Group>
          </Stack>
        )}
      </form>
    </Modal>
  )
}

export default LegacyApplicationReviewModal
