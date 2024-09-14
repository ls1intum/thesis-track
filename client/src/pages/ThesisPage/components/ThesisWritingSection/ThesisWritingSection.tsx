import { IThesis, ThesisState } from '../../../../requests/responses/thesis'
import { useState } from 'react'
import { Accordion, Button, Center, Divider, Grid, Group, Stack, Text } from '@mantine/core'
import ConfirmationButton from '../../../../components/ConfirmationButton/ConfirmationButton'
import { doRequest } from '../../../../requests/request'
import { checkMinimumThesisState } from '../../../../utils/thesis'
import {
  useLoadedThesisContext,
  useThesisUpdateAction,
} from '../../../../contexts/ThesisProvider/hooks'
import AuthenticatedFilePreview from '../../../../components/AuthenticatedFilePreview/AuthenticatedFilePreview'
import UploadFileModal from '../../../../components/UploadFileModal/UploadFileModal'
import { showSimpleError, showSimpleSuccess } from '../../../../utils/notification'
import ThesisCommentsForm from '../ThesisCommentsForm/ThesisCommentsForm'
import ThesisCommentsProvider from '../../../../contexts/ThesisCommentsProvider/ThesisCommentsProvider'
import ThesisCommentsList from '../ThesisCommentsList/ThesisCommentsList'
import { ApiError, getApiResponseErrorMessage } from '../../../../requests/handler'
import ThesisPresentationsTable from './components/ThesisPresentationsTable/ThesisPresentationsTable'
import { formatThesisFilename } from '../../../../utils/format'
import ReplacePresentationModal from './components/ReplacePresentationModal/ReplacePresentationModal'

const ThesisWritingSection = () => {
  const { thesis, access, updateThesis } = useLoadedThesisContext()

  const [uploadThesisModal, setUploadThesisModal] = useState(false)
  const [uploadPresentationModal, setUploadPresentationModal] = useState(false)
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

  const onThesisUpload = async (file: File) => {
    const formData = new FormData()

    formData.append('thesis', file)

    const response = await doRequest<IThesis>(`/v2/theses/${thesis.thesisId}/thesis`, {
      method: 'PUT',
      requiresAuth: true,
      formData: formData,
    })

    if (response.ok) {
      showSimpleSuccess('Thesis uploaded successfully')

      updateThesis(response.data)
    } else {
      showSimpleError(getApiResponseErrorMessage(response))
    }
  }

  const onPresentationUpload = async (file: File) => {
    const formData = new FormData()

    formData.append('presentation', file)

    const response = await doRequest<IThesis>(`/v2/theses/${thesis.thesisId}/presentation`, {
      method: 'PUT',
      requiresAuth: true,
      formData: formData,
    })

    if (response.ok) {
      showSimpleSuccess('Presentation uploaded successfully')

      updateThesis(response.data)
    } else {
      showSimpleError(getApiResponseErrorMessage(response))
    }
  }

  if (!checkMinimumThesisState(thesis, ThesisState.WRITING)) {
    return <></>
  }

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
                    <Grid.Col span={{ lg: 6 }}>
                      <UploadFileModal
                        title='Upload Thesis'
                        opened={uploadThesisModal}
                        onClose={() => setUploadThesisModal(false)}
                        onUpload={onThesisUpload}
                        maxSize={20 * 1024 * 1024}
                      />
                      {thesis.files.thesis ? (
                        <AuthenticatedFilePreview
                          key={thesis.files.thesis}
                          title='Thesis'
                          url={`/v2/theses/${thesis.thesisId}/thesis`}
                          filename={`${formatThesisFilename(thesis, thesis.state === ThesisState.WRITING ? '' : 'final')}.pdf`}
                          height={400}
                        />
                      ) : (
                        <Text ta='center' mb='md'>
                          No thesis uploaded yet
                        </Text>
                      )}
                      {access.student && thesis.state === ThesisState.WRITING && (
                        <Center mt='md'>
                          <Button onClick={() => setUploadThesisModal(true)}>Upload Thesis</Button>
                        </Center>
                      )}
                    </Grid.Col>
                    <Grid.Col span={{ lg: 6 }}>
                      <UploadFileModal
                        title='Upload Presentation'
                        opened={uploadPresentationModal}
                        onClose={() => setUploadPresentationModal(false)}
                        onUpload={onPresentationUpload}
                        maxSize={20 * 1024 * 1024}
                      />
                      {thesis.files.presentation ? (
                        <AuthenticatedFilePreview
                          key={thesis.files.presentation}
                          title='Presentation'
                          url={`/v2/theses/${thesis.thesisId}/presentation`}
                          filename={`${formatThesisFilename(thesis, thesis.state === ThesisState.WRITING ? 'presentation' : 'final-presentation')}.pdf`}
                          height={400}
                        />
                      ) : (
                        <Text ta='center' mb='md'>
                          No presentation uploaded yet
                        </Text>
                      )}
                      {access.student && thesis.state === ThesisState.WRITING && (
                        <Center mt='md'>
                          <Button onClick={() => setUploadPresentationModal(true)}>
                            Upload Presentation
                          </Button>
                        </Center>
                      )}
                    </Grid.Col>
                  </Grid>
                </Stack>
              </Accordion.Panel>
            </Accordion.Item>
            <Accordion.Item value='comments'>
              <Accordion.Control>Comments</Accordion.Control>
              <Accordion.Panel>
                <Stack>
                  <ThesisCommentsProvider thesis={thesis} commentType='THESIS'>
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
                    opened={createPresentationModal}
                    onClose={() => setCreatePresentationModal(false)}
                  />
                  <ThesisPresentationsTable />
                  {access.student && (
                    <Button ml='auto' onClick={() => setCreatePresentationModal(true)}>
                      Create Presentation Draft
                    </Button>
                  )}
                </Stack>
              </Accordion.Panel>
            </Accordion.Item>
          </Accordion>
          <Stack mt='md'>
            {access.student &&
              thesis.state === ThesisState.WRITING &&
              thesis.files.thesis &&
              thesis.files.presentation && (
                <ConfirmationButton
                  confirmationTitle='Final Submission'
                  confirmationText='Are you sure you want to submit your thesis? This action cannot be undone.'
                  ml='auto'
                  onClick={onFinalSubmission}
                  loading={submitting}
                >
                  Mark Submission as final
                </ConfirmationButton>
              )}
          </Stack>
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  )
}

export default ThesisWritingSection
