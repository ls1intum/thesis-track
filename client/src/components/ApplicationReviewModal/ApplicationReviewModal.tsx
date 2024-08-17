import { IApplication } from '../../requests/responses/application'
import { Modal, Stack, Group, Divider, Grid } from '@mantine/core'
import AuthenticatedFilePreview from '../AuthenticatedFilePreview/AuthenticatedFilePreview'
import React from 'react'
import { GLOBAL_CONFIG } from '../../config/global'
import { AVAILABLE_COUNTRIES } from '../../config/countries'
import { formatDate, formatUser } from '../../utils/format'
import LabeledItem from '../LabeledItem/LabeledItem'
import ApplicationReviewForm from '../ApplicationReviewForm/ApplicationReviewForm'

interface ILegacyApplicationReviewModalProps {
  application: IApplication | undefined
  onClose: () => unknown
  allowReviews: boolean
}

const ApplicationReviewModal = (props: ILegacyApplicationReviewModalProps) => {
  const { application, onClose, allowReviews } = props

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
                  value={formatDate(application.user.enrolledAt, { withTime: false })}
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
                  value={formatDate(application.desiredStartDate, { withTime: false })}
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
                        url={`/v2/users/${application.user.userId}/cv`}
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
                        url={`/v2/users/${application.user.userId}/examination-report`}
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
                        url={`/v2/users/${application.user.userId}/degree-report`}
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
                  value={formatDate(application.reviewedAt, { withTime: true })}
                />
              )}
              {application.comment && (
                <LabeledItem label='Review Comment' value={application.comment} />
              )}
            </Group>
          </Stack>
        )}

        {allowReviews && application && (
          <ApplicationReviewForm application={application} onUpdate={onClose} />
        )}
      </form>
    </Modal>
  )
}

export default ApplicationReviewModal
