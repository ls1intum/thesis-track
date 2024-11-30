import { IThesis, ThesisState } from '../../../../requests/responses/thesis'
import { useState } from 'react'
import { Accordion, Button, Center, Grid, Group, Stack, Text, Table } from '@mantine/core'
import ConfirmationButton from '../../../../components/ConfirmationButton/ConfirmationButton'
import { doRequest } from '../../../../requests/request'
import { checkMinimumThesisState, isThesisClosed } from '../../../../utils/thesis'
import {
  useLoadedThesisContext,
  useThesisUpdateAction,
} from '../../../../providers/ThesisProvider/hooks'
import { showSimpleError, showSimpleSuccess } from '../../../../utils/notification'
import ThesisCommentsForm from '../../../../components/ThesisCommentsForm/ThesisCommentsForm'
import ThesisCommentsProvider from '../../../../providers/ThesisCommentsProvider/ThesisCommentsProvider'
import ThesisCommentsList from '../../../../components/ThesisCommentsList/ThesisCommentsList'
import { ApiError, getApiResponseErrorMessage } from '../../../../requests/handler'
import { formatDate, formatThesisFilename } from '../../../../utils/format'
import ReplacePresentationModal from '../../../../components/PresentationsTable/components/ReplacePresentationModal/ReplacePresentationModal'
import PresentationsTable from '../../../../components/PresentationsTable/PresentationsTable'
import { GLOBAL_CONFIG } from '../../../../config/global'
import UploadFileButton from '../../../../components/UploadFileButton/UploadFileButton'
import AuthenticatedFilePreview from '../../../../components/AuthenticatedFilePreview/AuthenticatedFilePreview'
import AuthenticatedFileDownloadButton from '../../../../components/AuthenticatedFileDownloadButton/AuthenticatedFileDownloadButton'
import AuthenticatedFilePreviewButton from '../../../../components/AuthenticatedFilePreviewButton/AuthenticatedFilePreviewButton'
import { DownloadSimple, Eye, UploadSimple } from 'phosphor-react'
import FileHistoryTable from '../FileHistoryTable/FileHistoryTable'

const ThesisWritingSection = () => {
  const { thesis, access, updateThesis } = useLoadedThesisContext()

  const [createPresentationModal, setCreatePresentationModal] = useState(false)

  const [submitting, onFinalSubmission] = useThesisUpdateAction(async () => {
    const response = await doRequest<IThesis>(
      `/v2/theses/${thesis.thesisId}/thesis/final-submission`,
      {
        method: 'PUT',
        requiresAuth: true,
      },
    )

    if (response.ok) {
      return response.data
    } else {
      throw new ApiError(response)
    }
  }, 'Thesis submitted successfully')

  const onFileUpload = async (type: string, file: File) => {
    const formData = new FormData()

    formData.append('type', type)
    formData.append('file', file)

    const response = await doRequest<IThesis>(`/v2/theses/${thesis.thesisId}/files`, {
      method: 'POST',
      requiresAuth: true,
      formData: formData,
    })

    if (response.ok) {
      showSimpleSuccess('File uploaded successfully')

      updateThesis(response.data)
    } else {
      showSimpleError(getApiResponseErrorMessage(response))
    }
  }

  if (!checkMinimumThesisState(thesis, ThesisState.WRITING)) {
    return <></>
  }

  const adjustedThesisFiles: typeof GLOBAL_CONFIG.thesis_files = {
    ...GLOBAL_CONFIG.thesis_files,
    THESIS: {
      label: 'Thesis',
      description: 'Thesis (PDF)',
      accept: 'pdf',
      required: true,
    },
  }

  const thesisFile = thesis.files.find((file) => file.type === 'THESIS')
  const customFiles = Object.fromEntries(
    Object.keys(GLOBAL_CONFIG.thesis_files).map((type) => [
      type,
      thesis.files.find((file) => file.type === type),
    ]),
  )
  const requiredFilesUploaded =
    !!thesisFile &&
    !Object.entries(GLOBAL_CONFIG.thesis_files)
      .filter(([, value]) => value.required)
      .some(([key]) => !customFiles[key])

  return (
    <Accordion variant='separated' defaultValue='open'>
      <Accordion.Item value='open'>
        <Accordion.Control>Thesis</Accordion.Control>
        <Accordion.Panel>
          <Accordion variant='separated' defaultValue='thesis'>
            <Accordion.Item value='thesis'>
              <Accordion.Control>Files</Accordion.Control>
              <Accordion.Panel>
                <Stack>
                  <Grid>
                    <Grid.Col span={{ xl: 6 }}>
                      <Stack>
                        {thesisFile ? (
                          <AuthenticatedFilePreview
                            key={thesisFile.filename}
                            url={`/v2/theses/${thesis.thesisId}/files/${thesisFile.fileId}`}
                            filename={formatThesisFilename(
                              thesis,
                              'Thesis',
                              thesisFile.filename,
                              0,
                            )}
                            type='pdf'
                            aspectRatio={16 / 10}
                            actionButton={
                              ((access.student && thesis.state === ThesisState.WRITING) ||
                                access.advisor) &&
                              !isThesisClosed(thesis) ? (
                                <UploadFileButton
                                  maxSize={20 * 1024 * 1024}
                                  accept='pdf'
                                  onUpload={(file) => onFileUpload('THESIS', file)}
                                >
                                  Upload Thesis
                                </UploadFileButton>
                              ) : undefined
                            }
                          />
                        ) : (
                          <Stack>
                            <Text ta='center'>No thesis uploaded yet</Text>
                            <Center>
                              <UploadFileButton
                                maxSize={20 * 1024 * 1024}
                                accept='pdf'
                                onUpload={(file) => onFileUpload('THESIS', file)}
                              >
                                Upload Thesis
                              </UploadFileButton>
                            </Center>
                          </Stack>
                        )}
                      </Stack>
                    </Grid.Col>
                    <Grid.Col span={{ xl: 6 }}>
                      <Table>
                        <Table.Thead>
                          <Table.Tr>
                            <Table.Th>File</Table.Th>
                            <Table.Th>Uploaded At</Table.Th>
                            <Table.Th ta='center'>Actions</Table.Th>
                          </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                          {Object.entries(GLOBAL_CONFIG.thesis_files).map(([key, value]) => (
                            <Table.Tr key={key}>
                              <Table.Td>
                                <Text>
                                  {value.description}
                                  {value.required && (
                                    <Text component='span' c='red'>
                                      &nbsp;*
                                    </Text>
                                  )}
                                </Text>
                              </Table.Td>
                              <Table.Td>
                                <Text>{formatDate(customFiles[key]?.uploadedAt)}</Text>
                              </Table.Td>
                              <Table.Td>
                                <Center>
                                  <Group gap='xs'>
                                    {customFiles[key] && (
                                      <AuthenticatedFilePreviewButton
                                        url={`/v2/theses/${thesis.thesisId}/files/${customFiles[key].fileId}`}
                                        filename={formatThesisFilename(
                                          thesis,
                                          value.label,
                                          customFiles[key].filename,
                                          0,
                                        )}
                                        type={value.accept}
                                        size='xs'
                                      >
                                        <Eye />
                                      </AuthenticatedFilePreviewButton>
                                    )}
                                    {customFiles[key] && (
                                      <AuthenticatedFileDownloadButton
                                        url={`/v2/theses/${thesis.thesisId}/files/${customFiles[key].fileId}`}
                                        filename={formatThesisFilename(
                                          thesis,
                                          value.label,
                                          customFiles[key].filename,
                                          0,
                                        )}
                                        size='xs'
                                      >
                                        <DownloadSimple />
                                      </AuthenticatedFileDownloadButton>
                                    )}
                                    {((access.student && thesis.state === ThesisState.WRITING) ||
                                      access.advisor ||
                                      (access.student && !value.required)) &&
                                      !isThesisClosed(thesis) && (
                                        <UploadFileButton
                                          onUpload={(file) => onFileUpload(key, file)}
                                          maxSize={20 * 1024 * 1024}
                                          accept={value.accept}
                                          size='xs'
                                        >
                                          <UploadSimple />
                                        </UploadFileButton>
                                      )}
                                  </Group>
                                </Center>
                              </Table.Td>
                            </Table.Tr>
                          ))}
                        </Table.Tbody>
                      </Table>
                    </Grid.Col>
                  </Grid>
                  {access.student && (
                    <FileHistoryTable
                      data={thesis.files
                        .filter((file) => adjustedThesisFiles[file.type])
                        .map((file, index) => ({
                          name:
                            adjustedThesisFiles[file.type].label +
                            ' v' +
                            thesis.files.filter((a, b) => b >= index && a.type === file.type)
                              .length,
                          url: `/v2/theses/${thesis.thesisId}/files/${file.fileId}`,
                          filename: formatThesisFilename(
                            thesis,
                            adjustedThesisFiles[file.type].label,
                            file.filename,
                            thesis.files.filter((a, b) => b >= index && a.type === file.type)
                              .length,
                          ),
                          type: adjustedThesisFiles[file.type].accept,
                          uploadedBy: file.uploadedBy,
                          uploadedAt: file.uploadedAt,
                          onDelete:
                            access.advisor && !isThesisClosed(thesis)
                              ? async () => {
                                  const response = await doRequest<IThesis>(
                                    `/v2/theses/${thesis.thesisId}/files/${file.fileId}`,
                                    {
                                      method: 'DELETE',
                                      requiresAuth: true,
                                    },
                                  )

                                  if (response.ok) {
                                    updateThesis(response.data)
                                  } else {
                                    showSimpleError(getApiResponseErrorMessage(response))
                                  }
                                }
                              : undefined,
                        }))}
                    />
                  )}
                </Stack>
              </Accordion.Panel>
            </Accordion.Item>
            <Accordion.Item value='comments'>
              <Accordion.Control>Comments</Accordion.Control>
              <Accordion.Panel>
                <Stack>
                  <ThesisCommentsProvider limit={10} thesis={thesis} commentType='THESIS'>
                    <ThesisCommentsList />
                    {access.student && <ThesisCommentsForm />}
                  </ThesisCommentsProvider>
                </Stack>
              </Accordion.Panel>
            </Accordion.Item>
            <Accordion.Item value='presentations'>
              <Accordion.Control>Presentations</Accordion.Control>
              <Accordion.Panel>
                <Stack>
                  <ReplacePresentationModal
                    thesis={thesis}
                    opened={createPresentationModal}
                    onClose={() => setCreatePresentationModal(false)}
                  />
                  <PresentationsTable
                    presentations={thesis.presentations}
                    theses={[thesis]}
                    columns={[
                      'state',
                      'type',
                      'location',
                      'streamUrl',
                      'language',
                      'scheduledAt',
                      'actions',
                    ]}
                  />
                  {access.student && !isThesisClosed(thesis) && (
                    <Button ml='auto' onClick={() => setCreatePresentationModal(true)}>
                      Create Presentation Draft
                    </Button>
                  )}
                </Stack>
              </Accordion.Panel>
            </Accordion.Item>
          </Accordion>
          <Stack mt='md'>
            {access.student && thesis.state === ThesisState.WRITING && (
              <ConfirmationButton
                confirmationTitle='Final Submission'
                confirmationText='Are you sure you want to submit your thesis? This action cannot be undone.'
                ml='auto'
                onClick={onFinalSubmission}
                disabled={!requiredFilesUploaded}
                loading={submitting}
              >
                Mark Submission as Final
              </ConfirmationButton>
            )}
          </Stack>
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  )
}

export default ThesisWritingSection
