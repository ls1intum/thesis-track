import { IApplication } from '../../requests/responses/application'
import { Stack, Group, Divider, Grid, Title } from '@mantine/core'
import AuthenticatedFilePreview from '../AuthenticatedFilePreview/AuthenticatedFilePreview'
import React from 'react'
import { GLOBAL_CONFIG } from '../../config/global'
import { AVAILABLE_COUNTRIES } from '../../config/countries'
import { formatDate, formatUser } from '../../utils/format'
import LabeledItem from '../LabeledItem/LabeledItem'
import DocumentEditor from '../DocumentEditor/DocumentEditor'

interface IApplicationDataProps {
  application: IApplication
}

const ApplicationData = (props: IApplicationDataProps) => {
  const { application } = props

  return (
    <Grid>
      <Grid.Col span={{ md: 8 }} py={0}>
        <Stack>
          <Title>
            {application.user.firstName} {application.user.lastName}
          </Title>
          <LabeledItem label='Thesis Title Suggestion' value={application.thesisTitle} />
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
                value={formatDate(application.user.enrolledAt, { withTime: false })}
              />
            </Grid.Col>
            <Grid.Col span={{ xs: 4, sm: 3, md: 2 }}>
              <LabeledItem
                label='Desired Start Date'
                value={formatDate(application.desiredStartDate, { withTime: false })}
              />
            </Grid.Col>
            <Grid.Col span={{ xs: 4, sm: 3, md: 2 }}>
              <LabeledItem
                label='Submission Date'
                value={formatDate(application.createdAt, { withTime: true })}
              />
            </Grid.Col>
          </Grid>
          <Divider />
          <Grid>
            <Grid.Col span={{ sm: 6 }}>
              <LabeledItem
                label='Research Areas'
                value={application.user.researchAreas
                  ?.map((key) => GLOBAL_CONFIG.research_areas[key] ?? key)
                  .join(', ')}
              />
            </Grid.Col>
            <Grid.Col span={{ sm: 6 }}>
              <LabeledItem
                label='Focus Topics'
                value={application.user.focusTopics
                  ?.map((key) => GLOBAL_CONFIG.focus_topics[key] ?? key)
                  .join(', ')}
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
                  height={300}
                  filename={`cv-${application.user.universityId}`}
                  key={application.applicationId}
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
                  height={300}
                  filename={`examination-report-${application.user.universityId}`}
                  key={application.applicationId}
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
                  height={300}
                  filename={`degree-report-${application.user.universityId}`}
                  key={application.applicationId}
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