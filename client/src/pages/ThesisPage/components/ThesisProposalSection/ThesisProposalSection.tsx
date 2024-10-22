import { IThesis, ThesisState } from '../../../../requests/responses/thesis'
import { Accordion, Center, Grid, Group, Paper, Stack, Text } from '@mantine/core'
import { doRequest } from '../../../../requests/request'
import { showSimpleError, showSimpleSuccess } from '../../../../utils/notification'
import ConfirmationButton from '../../../../components/ConfirmationButton/ConfirmationButton'
import {
  useLoadedThesisContext,
  useThesisUpdateAction,
} from '../../../../providers/ThesisProvider/hooks'
import { ApiError, getApiResponseErrorMessage } from '../../../../requests/handler'
import LabeledItem from '../../../../components/LabeledItem/LabeledItem'
import { formatThesisFilename, formatUser } from '../../../../utils/format'
import { GLOBAL_CONFIG } from '../../../../config/global'
import { useHighlightedBackgroundColor } from '../../../../hooks/theme'
import ThesisFeedbackRequestButton from '../ThesisFeedbackRequestButton/ThesisFeedbackRequestButton'
import ThesisFeedbackOverview from '../ThesisFeedbackOverview/ThesisFeedbackOverview'
import AuthenticatedFilePreview from '../../../../components/AuthenticatedFilePreview/AuthenticatedFilePreview'
import UploadFileButton from '../../../../components/UploadFileButton/UploadFileButton'
import FileHistoryTable from '../FileHistoryTable/FileHistoryTable'
import { isThesisClosed } from '../../../../utils/thesis'

const ThesisProposalSection = () => {
  const { thesis, access, updateThesis } = useLoadedThesisContext()

  const studentBackgroundColor = useHighlightedBackgroundColor(false)

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

  const proposal = thesis.proposals[0]

  return (
    <Accordion
      variant='separated'
      defaultValue={thesis.state === ThesisState.PROPOSAL ? 'open' : ''}
    >
      <Accordion.Item value='open'>
        <Accordion.Control>Proposal</Accordion.Control>
        <Accordion.Panel>
          <Stack>
            {access.advisor && (
              <Stack gap='sm'>
                {thesis.students.map((student) => (
                  <Paper
                    key={student.userId}
                    p='md'
                    radius='sm'
                    style={{ backgroundColor: studentBackgroundColor }}
                  >
                    <Grid>
                      <Grid.Col span={{ md: 2 }}>
                        <LabeledItem label='Student' value={formatUser(student)} />
                      </Grid.Col>
                      <Grid.Col span={{ md: 2 }}>
                        <LabeledItem
                          label='University ID'
                          value={student.universityId}
                          copyText={student.universityId}
                        />
                      </Grid.Col>
                      {student.matriculationNumber && (
                        <Grid.Col span={{ md: 2 }}>
                          <LabeledItem
                            label='Matriculation Number'
                            value={student.matriculationNumber}
                            copyText={student.matriculationNumber || undefined}
                          />
                        </Grid.Col>
                      )}
                      {student.email && (
                        <Grid.Col span={{ md: 2 }}>
                          <LabeledItem
                            label='E-Mail'
                            value={student.email}
                            copyText={student.email || undefined}
                          />
                        </Grid.Col>
                      )}
                      {student.studyProgram && student.studyDegree && (
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
                      )}
                      {student.customData &&
                        Object.entries(student.customData).map(([key, value]) => (
                          <Grid.Col key={key} span={{ md: 6 }}>
                            <LabeledItem
                              label={GLOBAL_CONFIG.custom_data[key]?.label ?? key}
                              value={value}
                            />
                          </Grid.Col>
                        ))}
                    </Grid>
                  </Paper>
                ))}
              </Stack>
            )}
            {proposal ? (
              <AuthenticatedFilePreview
                url={`/v2/theses/${thesis.thesisId}/proposal/${proposal.proposalId}`}
                filename={formatThesisFilename(
                  thesis,
                  'Proposal',
                  proposal.filename,
                  thesis.proposals.length,
                )}
                type='pdf'
                aspectRatio={16 / 6}
                actionButton={
                  ((access.student && thesis.state === ThesisState.PROPOSAL) || access.advisor) &&
                  !isThesisClosed(thesis) ? (
                    <UploadFileButton
                      onUpload={onUpload}
                      maxSize={20 * 1024 * 1024}
                      accept='pdf'
                      ml='auto'
                    >
                      Upload Proposal
                    </UploadFileButton>
                  ) : undefined
                }
                key={proposal.proposalId}
              />
            ) : (
              <Stack>
                <Text ta='center'>No proposal uploaded yet</Text>
                <Center>
                  <UploadFileButton onUpload={onUpload} maxSize={20 * 1024 * 1024} accept='pdf'>
                    Upload Proposal
                  </UploadFileButton>
                </Center>
              </Stack>
            )}
            <ThesisFeedbackOverview
              type='PROPOSAL'
              allowEdit={thesis.state === ThesisState.PROPOSAL}
            />
            {thesis.proposals.length > 1 && (
              <FileHistoryTable
                data={thesis.proposals.map((row, index) => ({
                  filename: formatThesisFilename(
                    thesis,
                    'Proposal',
                    row.filename,
                    thesis.proposals.length - index,
                  ),
                  url: `/v2/theses/${thesis.thesisId}/proposal/${row.proposalId}`,
                  type: 'pdf',
                  uploadedBy: row.createdBy,
                  uploadedAt: row.createdAt,
                  name: `Proposal v${thesis.proposals.length - index}`,
                }))}
              />
            )}
            <Group ml='auto'>
              {proposal && access.advisor && thesis.state === ThesisState.PROPOSAL && (
                <ThesisFeedbackRequestButton type='PROPOSAL' />
              )}
              {access.advisor && thesis.state === ThesisState.PROPOSAL && (
                <ConfirmationButton
                  confirmationTitle='Accept Proposal'
                  confirmationText='Are you sure you want to accept the proposal?'
                  variant='outline'
                  color='green'
                  loading={accepting}
                  disabled={!proposal}
                  onClick={onAccept}
                >
                  Accept Proposal
                </ConfirmationButton>
              )}
            </Group>
          </Stack>
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  )
}

export default ThesisProposalSection
