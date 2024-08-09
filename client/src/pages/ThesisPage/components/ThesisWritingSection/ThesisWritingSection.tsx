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

const ThesisWritingSection = () => {
  const { thesis, access, updateThesis } = useLoadedThesisContext()

  const [opened, setOpened] = useState(true)

  const [uploadThesisModal, setUploadThesisModal] = useState(false)
  const [uploadPresentationModal, setUploadPresentationModal] = useState(false)

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
      throw new Error(`Failed to submit thesis: ${response.status}`)
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
      showSimpleError(`Failed to upload thesis: ${response.status}`)
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
      showSimpleError(`Failed to upload presentation: ${response.status}`)
    }
  }

  if (!checkMinimumThesisState(thesis, ThesisState.WRITING)) {
    return <></>
  }

  return (
    <Accordion
      variant='separated'
      value={opened ? 'open' : ''}
      onChange={(value) => setOpened(value === 'open')}
    >
      <Accordion.Item value='open'>
        <Accordion.Control>Thesis</Accordion.Control>
        <Accordion.Panel>
          <Stack>
            <Grid>
              <Grid.Col span={{ lg: 6 }}>
                <UploadFileModal
                  title='Upload Thesis'
                  opened={uploadThesisModal}
                  onClose={() => setUploadThesisModal(false)}
                  onUpload={onThesisUpload}
                />
                {thesis.files.thesis ? (
                  <AuthenticatedFilePreview
                    key={thesis.files.thesis}
                    title='Thesis'
                    url={`/v2/theses/${thesis.thesisId}/thesis`}
                    filename={`thesis-${thesis.thesisId}.pdf`}
                    height={400}
                  />
                ) : (
                  <Text ta='center'>No thesis uploaded yet</Text>
                )}
                {access.student && thesis.state === ThesisState.WRITING && (
                  <Center>
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
                />
                {thesis.files.presentation ? (
                  <AuthenticatedFilePreview
                    key={thesis.files.presentation}
                    title='Presentation'
                    url={`/v2/theses/${thesis.thesisId}/presentation`}
                    filename={`presentation-${thesis.thesisId}.pdf`}
                    height={400}
                  />
                ) : (
                  <Text ta='center'>No presentation uploaded yet</Text>
                )}
                {access.student && thesis.state === ThesisState.WRITING && (
                  <Center>
                    <Button onClick={() => setUploadPresentationModal(true)}>
                      Upload Presentation
                    </Button>
                  </Center>
                )}
              </Grid.Col>
            </Grid>
            <Divider />
            <Stack>
              <ThesisCommentsProvider thesis={thesis} commentType='THESIS'>
                <ThesisCommentsList />
                {access.student && <ThesisCommentsForm />}
              </ThesisCommentsProvider>
            </Stack>
            <Group grow>
              {access.student &&
                thesis.state === ThesisState.WRITING &&
                thesis.files.thesis &&
                thesis.files.presentation && (
                  <Stack>
                    <Divider />
                    <ConfirmationButton
                      confirmationTitle='Final Submission'
                      confirmationText='Are you sure you want to submit your thesis? This action cannot be undone.'
                      ml='auto'
                      onClick={onFinalSubmission}
                      loading={submitting}
                    >
                      Mark Submission as final
                    </ConfirmationButton>
                  </Stack>
                )}
            </Group>
          </Stack>
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  )
}

export default ThesisWritingSection
