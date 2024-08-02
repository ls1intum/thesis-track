import { ApplicationState, IApplication } from '../../../../requests/responses/application'
import {
  Button,
  Checkbox,
  Modal,
  Stack,
  Text,
  Group,
  Divider,
  TextInput,
  Textarea,
  Grid,
} from '@mantine/core'
import { isNotEmpty, useForm } from '@mantine/form'
import UserMultiSelect from '../../../../components/UserMultiSelect/UserMultiSelect'
import AuthenticatedFilePreview from '../../../../components/AuthenticatedFilePreview/AuthenticatedFilePreview'
import { doRequest } from '../../../../requests/request'
import { notifications } from '@mantine/notifications'
import React, { ReactNode, useEffect, useState } from 'react'
import { GLOBAL_CONFIG } from '../../../../config/global'
import { AVAILABLE_COUNTRIES } from '../../../../config/countries'
import { useDebouncedValue } from '@mantine/hooks'
import { formatDate, formatUser } from '../../../../utils/format'

interface ILegacyApplicationReviewModalProps {
  application: IApplication | undefined
  onClose: () => unknown
  onUpdate: (application: IApplication) => unknown
}

const LabeledItem = (props: { label: string; value: ReactNode }) => {
  const { label, value } = props

  return (
    <Stack gap='xs'>
      <Text c='dimmed' fz='xs' fw={700}>
        {label}
      </Text>
      {typeof value === 'string' || typeof value === 'number' ? (
        <Text fz='sm' lineClamp={20}>
          {value}
        </Text>
      ) : (
        value
      )}
    </Stack>
  )
}

const LegacyApplicationReviewModal = (props: ILegacyApplicationReviewModalProps) => {
  const { application, onClose, onUpdate } = props

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

            onUpdate(res.data)
          }
        },
      )
    }
  }, [debouncedComment, application?.applicationId])

  return (
    <Modal centered size='100vw' opened={!!application} onClose={onClose}>
      <form>
        {application && (
          <Stack gap='md'>
            <Grid grow>
              <Grid.Col span={{ xs: 4, sm: 3, md: 2 }}>
                <LabeledItem label='First Name' value={application.user.firstName} />
              </Grid.Col>
              <Grid.Col span={{ xs: 4, sm: 3, md: 2 }}>
                <LabeledItem label='Last Name' value={application.user.lastName} />
              </Grid.Col>
              <Grid.Col span={{ xs: 4, sm: 3, md: 2 }}>
                <LabeledItem label='Email' value={application.user.email} />
              </Grid.Col>
              <Grid.Col span={{ xs: 4, sm: 3, md: 2 }}>
                <LabeledItem
                  label='Gender'
                  value={
                    GLOBAL_CONFIG.genders[application.user.gender || ''] ?? application.user.gender
                  }
                />
              </Grid.Col>
              <Grid.Col span={{ xs: 4, sm: 3, md: 2 }}>
                <LabeledItem
                  label='Nationality'
                  value={
                    AVAILABLE_COUNTRIES[application.user.nationality || ''] ??
                    application.user.nationality
                  }
                />
              </Grid.Col>
              <Grid.Col span={{ xs: 4, sm: 3, md: 2 }}></Grid.Col>
            </Grid>
            <Grid grow>
              <Grid.Col span={{ xs: 4, sm: 3, md: 2 }}>
                <LabeledItem label='University ID' value={application.user.universityId} />
              </Grid.Col>
              <Grid.Col span={{ xs: 4, sm: 3, md: 2 }}>
                <LabeledItem
                  label='Matriculation Number'
                  value={application.user.matriculationNumber}
                />
              </Grid.Col>
              <Grid.Col span={{ xs: 4, sm: 3, md: 2 }}>
                <LabeledItem
                  label='Study Degree'
                  value={
                    GLOBAL_CONFIG.study_degrees[application.user.studyDegree || ''] ??
                    application.user.studyDegree
                  }
                />
              </Grid.Col>
              <Grid.Col span={{ xs: 4, sm: 3, md: 2 }}>
                <LabeledItem
                  label='Study Program'
                  value={
                    GLOBAL_CONFIG.study_programs[application.user.studyProgram || ''] ??
                    application.user.studyProgram
                  }
                />
              </Grid.Col>
              <Grid.Col span={{ xs: 4, sm: 3, md: 2 }}>
                <LabeledItem
                  label='Enrollment Date'
                  value={formatDate(application.user.enrolledAt, { includeHours: false })}
                />
              </Grid.Col>
              <Grid.Col span={{ xs: 4, sm: 3, md: 2 }}></Grid.Col>
            </Grid>
            <LabeledItem label='Thesis Title Suggestion' value={application.thesisTitle} />
            <LabeledItem label='Motivation' value={application.motivation} />
            <LabeledItem label='Interests' value={application.user.interests} />
            <LabeledItem label='Projects' value={application.user.projects} />
            <LabeledItem label='Special Skills' value={application.user.specialSkills} />
            <Grid grow>
              <Grid.Col span={{ sm: 4 }}>
                <LabeledItem
                  label='Desired Start Date'
                  value={formatDate(application.desiredStartDate, { includeHours: false })}
                />
              </Grid.Col>
              <Grid.Col span={{ sm: 4 }}>
                <LabeledItem
                  label='Research Areas'
                  value={application.user.researchAreas
                    ?.map((key) => GLOBAL_CONFIG.research_areas[key] ?? key)
                    .join(', ')}
                />
              </Grid.Col>
              <Grid.Col span={{ sm: 4 }}>
                <LabeledItem
                  label='Focus Topics'
                  value={application.user.focusTopics
                    ?.map((key) => GLOBAL_CONFIG.focus_topics[key] ?? key)
                    .join(', ')}
                />
              </Grid.Col>
            </Grid>
            <Grid grow>
              {application.user.hasCv && (
                <Grid.Col span={{ md: 6, xl: 4 }}>
                  <LabeledItem
                    label='CV'
                    value={
                      <AuthenticatedFilePreview
                        url={`/v1/users/${application.user.userId}/cv`}
                        height={400}
                        filename={`cv-${application.user.universityId}.pdf`}
                      />
                    }
                  />
                </Grid.Col>
              )}
              {application.user.hasExaminationReport && (
                <Grid.Col span={{ md: 6, xl: 4 }}>
                  <LabeledItem
                    label='Examination Report'
                    value={
                      <AuthenticatedFilePreview
                        url={`/v1/users/${application.user.userId}/examination-report`}
                        height={400}
                        filename={`examination-report-${application.user.universityId}.pdf`}
                      />
                    }
                  />
                </Grid.Col>
              )}
              {application.user.hasDegreeReport && (
                <Grid.Col span={{ md: 6, xl: 4 }}>
                  <LabeledItem
                    label='Degree Report'
                    value={
                      <AuthenticatedFilePreview
                        url={`/v1/users/${application.user.userId}/degree-report`}
                        height={400}
                        filename={`degree-report-${application.user.universityId}.pdf`}
                      />
                    }
                  />
                </Grid.Col>
              )}
            </Grid>
            {(application.reviewedBy || application.reviewedAt || application.comment) && (
              <Divider mt='sm' />
            )}
            <Group grow>
              {application.reviewedBy && (
                <LabeledItem label='Reviewer' value={formatUser(application.reviewedBy)} />
              )}
              {application.reviewedAt && (
                <LabeledItem
                  label='Reviewed At'
                  value={formatDate(application.reviewedAt, { includeHours: true })}
                />
              )}
              {application.comment && (
                <LabeledItem label='Review Comment' value={application.comment} />
              )}
            </Group>
          </Stack>
        )}

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
