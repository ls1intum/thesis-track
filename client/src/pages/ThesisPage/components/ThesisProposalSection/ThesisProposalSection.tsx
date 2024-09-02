import { IThesis, ThesisState } from '../../../../requests/responses/thesis'
import { useState } from 'react'
import { Accordion, Button, Divider, Grid, Group, Stack, Text } from '@mantine/core'
import UploadFileModal from '../../../../components/UploadFileModal/UploadFileModal'
import { doRequest } from '../../../../requests/request'
import { showSimpleError, showSimpleSuccess } from '../../../../utils/notification'
import AuthenticatedFilePreview from '../../../../components/AuthenticatedFilePreview/AuthenticatedFilePreview'
import ConfirmationButton from '../../../../components/ConfirmationButton/ConfirmationButton'
import {
  useLoadedThesisContext,
  useThesisUpdateAction,
} from '../../../../contexts/ThesisProvider/hooks'
import { ApiError, getApiResponseErrorMessage } from '../../../../requests/handler'
import LabeledItem from '../../../../components/LabeledItem/LabeledItem'
import { formatThesisFilename, formatUser, formatUsersFilename } from '../../../../utils/format'
import { GLOBAL_CONFIG } from '../../../../config/global'

const ThesisProposalSection = () => {
  const { thesis, access, updateThesis } = useLoadedThesisContext()

  const [opened, setOpened] = useState(thesis.state === ThesisState.PROPOSAL)

  const [uploadModal, setUploadModal] = useState(false)

  const [accepting, onAccept] = useThesisUpdateAction(async () => {
    const response = await doRequest<IThesis>(`/v2/theses/${thesis.thesisId}/proposal/accept`, {
      method: 'PUT',
      requiresAuth: true,
    })

    if (response.ok) {
      return response.data
    } else {
      throw new ApiError(response)
    }
  }, 'Proposal accepted successfully')

  const onUpload = async (file: File) => {
    const formData = new FormData()

    formData.append('proposal', file)

    const response = await doRequest<IThesis>(`/v2/theses/${thesis.thesisId}/proposal`, {
      method: 'POST',
      requiresAuth: true,
      formData: formData,
    })

    if (response.ok) {
      showSimpleSuccess('Proposal uploaded successfully')

      updateThesis(response.data)
    } else {
      showSimpleError(getApiResponseErrorMessage(response))
    }
  }

  return (
    <Accordion
      variant='separated'
      value={opened ? 'open' : ''}
      onChange={(value) => setOpened(value === 'open')}
    >
      <Accordion.Item value='open'>
        <Accordion.Control>Proposal</Accordion.Control>
        <Accordion.Panel>
          <Stack>
            {access.advisor && (
              <Stack gap='md'>
                {thesis.students.map((student) => (
                  <Grid key={student.userId}>
                    <Grid.Col span={{ md: 2 }}>
                      <LabeledItem
                        label='Student'
                        value={formatUser(student, { withUniversityId: false })}
                      />
                    </Grid.Col>
                    <Grid.Col span={{ md: 2 }}>
                      <LabeledItem
                        label='University ID'
                        value={student.universityId}
                        copyText={student.universityId}
                      />
                    </Grid.Col>
                    <Grid.Col span={{ md: 2 }}>
                      <LabeledItem
                        label='Matriculation Number'
                        value={student.matriculationNumber}
                        copyText={student.matriculationNumber || undefined}
                      />
                    </Grid.Col>
                    <Grid.Col span={{ md: 2 }}>
                      <LabeledItem
                        label='E-Mail'
                        value={student.email}
                        copyText={student.email || undefined}
                      />
                    </Grid.Col>
                    <Grid.Col span={{ md: 2 }}>
                      <LabeledItem
                        label='Study Degree'
                        value={`${
                          GLOBAL_CONFIG.study_programs[student.studyProgram || ''] ??
                          student.studyProgram
                        } ${
                          GLOBAL_CONFIG.study_degrees[student.studyDegree || ''] ??
                          student.studyDegree
                        } `}
                      />
                    </Grid.Col>
                    {student.customData &&
                      Object.entries(student.customData).map(([key, value]) => (
                        <Grid.Col key={key} span={{ md: 6 }}>
                          <LabeledItem
                            label={GLOBAL_CONFIG.custom_data[key] ?? key}
                            value={value}
                          />
                        </Grid.Col>
                      ))}
                    <Grid.Col span={12}>
                      <Divider />
                    </Grid.Col>
                  </Grid>
                ))}
              </Stack>
            )}
            {thesis.proposal ? (
              <AuthenticatedFilePreview
                url={`/v2/theses/${thesis.thesisId}/proposal`}
                filename={`${formatThesisFilename(thesis, 'proposal')}.pdf`}
                height={400}
                key={thesis.files.proposal}
              />
            ) : (
              <Text ta='center'>No proposal uploaded yet</Text>
            )}
            <Group>
              <UploadFileModal
                opened={uploadModal}
                onClose={() => setUploadModal(false)}
                title='Upload Proposal'
                onUpload={onUpload}
                maxSize={20 * 1024 * 1024}
              />
              {access.advisor && thesis.state === ThesisState.PROPOSAL && (
                <ConfirmationButton
                  confirmationTitle='Accept Proposal'
                  confirmationText='Are you sure you want to accept the proposal?'
                  variant='outline'
                  color='green'
                  loading={accepting}
                  disabled={thesis.proposal === null}
                  onClick={onAccept}
                >
                  Accept Proposal
                </ConfirmationButton>
              )}
              {access.student && thesis.state === ThesisState.PROPOSAL && (
                <Button ml='auto' onClick={() => setUploadModal(true)}>
                  Upload Proposal
                </Button>
              )}
              {access.student && thesis.state === ThesisState.WRITING && (
                <Button ml='auto' onClick={() => setUploadModal(true)}>
                  Upload New Proposal (Needs Re-Approval)
                </Button>
              )}
            </Group>
          </Stack>
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  )
}

export default ThesisProposalSection
