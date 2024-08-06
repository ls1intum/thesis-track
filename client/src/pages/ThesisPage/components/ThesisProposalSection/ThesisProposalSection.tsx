import { IThesis, ThesisState } from '../../../../requests/responses/thesis'
import { IThesisAccessPermissions } from '../../types'
import { useState } from 'react'
import { Accordion, Button, Group, Stack, Text } from '@mantine/core'
import UploadFileModal from '../../../../components/UploadFileModal/UploadFileModal'
import { doRequest } from '../../../../requests/request'
import { showSimpleError, showSimpleSuccess } from '../../../../utils/notification'
import AuthenticatedFilePreview from '../../../../components/AuthenticatedFilePreview/AuthenticatedFilePreview'
import ConfirmationButton from '../../../../components/ConfirmationButton/ConfirmationButton'

interface IThesisProposalSectionProps {
  thesis: IThesis
  access: IThesisAccessPermissions
  onUpdate: (thesis: IThesis) => unknown
}

const ThesisProposalSection = (props: IThesisProposalSectionProps) => {
  const { thesis, access, onUpdate } = props

  const [opened, setOpened] = useState(thesis.state === ThesisState.PROPOSAL)

  const [accepting, setAccepting] = useState(false)
  const [uploadModal, setUploadModal] = useState(false)

  const onAccept = async () => {
    setAccepting(true)

    try {
      const response = await doRequest<IThesis>(`/v2/theses/${thesis.thesisId}/proposal/accept`, {
        method: 'PUT',
        requiresAuth: true,
      })

      if (response.ok) {
        showSimpleSuccess('Proposal accepted successfully')

        onUpdate(response.data)
      } else {
        showSimpleError(`Failed to accept proposal: ${response.status}`)
      }
    } finally {
      setAccepting(false)
    }
  }

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

      onUpdate(response.data)
    } else {
      showSimpleError(`Failed to upload proposal: ${response.status}`)
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
            </Group>
          </Stack>
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  )
}

export default ThesisProposalSection
