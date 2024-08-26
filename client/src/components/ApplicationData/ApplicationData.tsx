import { IApplication } from '../../requests/responses/application'
import { Stack, Group, Divider, Grid, Title, Badge } from '@mantine/core'
import AuthenticatedFilePreview from '../AuthenticatedFilePreview/AuthenticatedFilePreview'
import React, { ReactNode } from 'react'
import { GLOBAL_CONFIG } from '../../config/global'
import { AVAILABLE_COUNTRIES } from '../../config/countries'
import { formatApplicationState, formatDate, formatUser } from '../../utils/format'
import LabeledItem from '../LabeledItem/LabeledItem'
import DocumentEditor from '../DocumentEditor/DocumentEditor'
import { ApplicationStateColor } from '../../config/colors'

interface IApplicationDataProps {
  application: IApplication
  bottomSection?: ReactNode
  rightTitleSection?: ReactNode
}

const ApplicationData = (props: IApplicationDataProps) => {
  const { application, bottomSection, rightTitleSection } = props

  return (
    <Grid>
      <Grid.Col span={{ md: 8 }} py={0}>
        <Stack>
          <Group>
            <Title>
              {application.user.firstName} {application.user.lastName}
            </Title>
            {rightTitleSection}
          </Group>
          <LabeledItem
            label='Thesis Title'
            value={application.topic?.title || application.thesisTitle}
          />
          <LabeledItem
            label='Motivation'
            value={<DocumentEditor value={application.motivation} />}
          />
          <LabeledItem
            label='Interests'
            value={<DocumentEditor value={application.user.interests || ''} />}
          />
          <LabeledItem
            label='Projects'
            value={<DocumentEditor value={application.user.projects || ''} />}
          />
          <LabeledItem
            label='Special Skills'
            value={<DocumentEditor value={application.user.specialSkills || ''} />}
          />
          <Grid>
            <Grid.Col span={{ xs: 4, sm: 3 }}>
              <LabeledItem label='Email' value={application.user.email} />
            </Grid.Col>
            <Grid.Col span={{ xs: 4, sm: 3 }}>
              <LabeledItem
                label='Gender'
                value={
                  GLOBAL_CONFIG.genders[application.user.gender || ''] ?? application.user.gender
                }
              />
            </Grid.Col>
            <Grid.Col span={{ xs: 4, sm: 3 }}>
              <LabeledItem
                label='Nationality'
                value={
                  AVAILABLE_COUNTRIES[application.user.nationality || ''] ??
                  application.user.nationality
                }
              />
            </Grid.Col>
            <Grid.Col span={{ xs: 4, sm: 3 }}>
              <LabeledItem label='University ID' value={application.user.universityId} />
            </Grid.Col>
            <Grid.Col span={{ xs: 4, sm: 3 }}>
              <LabeledItem
                label='Matriculation Number'
                value={application.user.matriculationNumber}
              />
            </Grid.Col>
            <Grid.Col span={{ xs: 4, sm: 3 }}>
              <LabeledItem
                label='Study Degree'
                value={
                  GLOBAL_CONFIG.study_degrees[application.user.studyDegree || ''] ??
                  application.user.studyDegree
                }
              />
            </Grid.Col>
            <Grid.Col span={{ xs: 4, sm: 3 }}>
              <LabeledItem
                label='Study Program'
                value={
                  GLOBAL_CONFIG.study_programs[application.user.studyProgram || ''] ??
                  application.user.studyProgram
                }
              />
            </Grid.Col>
            <Grid.Col span={{ xs: 4, sm: 3 }}>
              <LabeledItem
                label='Enrollment Date'
                value={formatDate(application.user.enrolledAt, { withTime: false })}
              />
            </Grid.Col>
            <Grid.Col span={{ xs: 4, sm: 3 }}>
              <LabeledItem
                label='Desired Start Date'
                value={formatDate(application.desiredStartDate, { withTime: false })}
              />
            </Grid.Col>
            <Grid.Col span={{ xs: 4, sm: 3 }}>
              <LabeledItem
                label='Submission Date'
                value={formatDate(application.createdAt, { withTime: true })}
              />
            </Grid.Col>
            <Grid.Col span={{ xs: 4, sm: 3 }}>
              <LabeledItem
                label='State'
                value={
                  <Badge color={ApplicationStateColor[application.state]}>
                    {formatApplicationState(application.state)}
                  </Badge>
                }
              />
            </Grid.Col>
          </Grid>
          {(application.reviewedBy || application.reviewedAt || application.comment) && (
            <Stack gap='md'>
              <Divider />
              <Group grow>
                {application.reviewedBy && (
                  <LabeledItem label='Reviewer' value={formatUser(application.reviewedBy)} />
                )}
                {application.reviewedAt && (
                  <LabeledItem
                    label='Reviewed At'
                    value={formatDate(application.reviewedAt, { withTime: true })}
                  />
                )}
                {application.comment && (
                  <LabeledItem label='Review Comment' value={application.comment} />
                )}
              </Group>
            </Stack>
          )}
          {bottomSection}
        </Stack>
      </Grid.Col>
      <Grid.Col span={{ md: 4 }}>
        <Stack gap='md'>
          {application.user.hasCv && (
            <LabeledItem
              label='CV'
              value={
                <AuthenticatedFilePreview
                  url={`/v2/users/${application.user.userId}/cv`}
                  height={400}
                  filename={`cv-${application.user.universityId}`}
                  key={application.user.userId}
                />
              }
            />
          )}
          {application.user.hasExaminationReport && (
            <LabeledItem
              label='Examination Report'
              value={
                <AuthenticatedFilePreview
                  url={`/v2/users/${application.user.userId}/examination-report`}
                  height={400}
                  filename={`examination-report-${application.user.universityId}`}
                  key={application.user.userId}
                />
              }
            />
          )}
          {application.user.hasDegreeReport && (
            <LabeledItem
              label='Degree Report'
              value={
                <AuthenticatedFilePreview
                  url={`/v2/users/${application.user.userId}/degree-report`}
                  height={400}
                  filename={`degree-report-${application.user.universityId}`}
                  key={application.user.userId}
                />
              }
            />
          )}
        </Stack>
      </Grid.Col>
    </Grid>
  )
}

export default ApplicationData
