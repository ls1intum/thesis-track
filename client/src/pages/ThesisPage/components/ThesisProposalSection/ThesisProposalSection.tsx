import { IThesis, ThesisState } from '../../../../requests/responses/thesis'
import { useState } from 'react'
import { Accordion, Button, Group, Stack, Text } from '@mantine/core'
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
            {thesis.proposal ? (
              <AuthenticatedFilePreview
                url={`/v2/theses/${thesis.thesisId}/proposal`}
                filename={`proposal-${thesis.thesisId}`}
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
                  Upload New Proposal (Needs Approval)
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
