import { IApplication } from '../../requests/responses/application'
import { Stack, Group, Divider, Grid, Title, Badge, Accordion } from '@mantine/core'
import AuthenticatedFilePreview from '../AuthenticatedFilePreview/AuthenticatedFilePreview'
import React, { ReactNode } from 'react'
import { GLOBAL_CONFIG } from '../../config/global'
import { AVAILABLE_COUNTRIES } from '../../config/countries'
import { formatApplicationState, formatDate, formatUserFilename } from '../../utils/format'
import LabeledItem from '../LabeledItem/LabeledItem'
import DocumentEditor from '../DocumentEditor/DocumentEditor'
import { ApplicationStateColor } from '../../config/colors'
import TopicAccordionItem from '../TopicAccordionItem/TopicAccordionItem'
import AvatarUser from '../AvatarUser/AvatarUser'
import { enrollmentDateToSemester } from '../../utils/converter'

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
          {application.topic ? (
            <Accordion variant='separated'>
              <TopicAccordionItem topic={application.topic} />
            </Accordion>
          ) : (
            <LabeledItem label='Thesis Title' value={application.thesisTitle} />
          )}
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
              <LabeledItem
                label='Email'
                value={application.user.email}
                copyText={application.user.email || undefined}
              />
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
              <LabeledItem
                label='University ID'
                value={application.user.universityId}
                copyText={application.user.universityId}
              />
            </Grid.Col>
            <Grid.Col span={{ xs: 4, sm: 3 }}>
              <LabeledItem
                label='Matriculation Number'
                value={application.user.matriculationNumber}
                copyText={application.user.matriculationNumber || undefined}
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
                label='Semester'
                value={enrollmentDateToSemester(application.user.enrolledAt || '')}
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
            {application.user.customData &&
              Object.entries(application.user.customData).map(([key, value]) => (
                <Grid.Col key={key} span={{ md: 6 }}>
                  <LabeledItem label={GLOBAL_CONFIG.custom_data[key] ?? key} value={value} />
                </Grid.Col>
              ))}
          </Grid>
          {(application.reviewedBy || application.reviewedAt || application.comment) && (
            <Stack gap='md'>
              <Divider />
              <Group grow>
                {application.reviewedBy && (
                  <LabeledItem
                    label='Reviewer'
                    value={<AvatarUser user={application.reviewedBy} />}
                  />
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
            <AuthenticatedFilePreview
              title='CV'
              url={`/v2/users/${application.user.userId}/cv`}
              height={400}
              filename={`cv-${formatUserFilename(application.user)}`}
              key={application.user.userId}
            />
          )}
          {application.user.hasExaminationReport && (
            <AuthenticatedFilePreview
              title='Examination Report'
              url={`/v2/users/${application.user.userId}/examination-report`}
              height={400}
              filename={`examination-report-${formatUserFilename(application.user)}`}
              key={application.user.userId}
            />
          )}
          {application.user.hasDegreeReport && (
            <AuthenticatedFilePreview
              title='Degree Report'
              url={`/v2/users/${application.user.userId}/degree-report`}
              height={400}
              filename={`degree-report-${formatUserFilename(application.user)}`}
              key={application.user.userId}
            />
          )}
        </Stack>
      </Grid.Col>
    </Grid>
  )
}

export default ApplicationData
