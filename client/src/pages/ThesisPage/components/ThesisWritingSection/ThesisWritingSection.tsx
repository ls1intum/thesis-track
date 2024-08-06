import { IThesis, ThesisState } from '../../../../requests/responses/thesis'
import { IThesisAccessPermissions } from '../../types'
import { useState } from 'react'
import { Accordion, Group, Stack } from '@mantine/core'
import ConfirmationButton from '../../../../components/ConfirmationButton/ConfirmationButton'
import { doRequest } from '../../../../requests/request'
import { showSimpleError, showSimpleSuccess } from '../../../../utils/notification'

interface IThesisWritingSectionProps {
  thesis: IThesis
  access: IThesisAccessPermissions
  onUpdate: (thesis: IThesis) => unknown
}

const ThesisWritingSection = (props: IThesisWritingSectionProps) => {
  const { thesis, access, onUpdate } = props

  const [opened, setOpened] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const onFinalSubmission = async () => {
    setSubmitting(true)

    try {
      const response = await doRequest<IThesis>(
        `/v2/theses/${thesis.thesisId}/thesis/final-submission`,
        {
          method: 'PUT',
          requiresAuth: true,
        },
      )

      if (response.ok) {
        showSimpleSuccess('Thesis submitted successfully')

        onUpdate(response.data)
      } else {
        showSimpleError(`Failed to submit thesis: ${response.status}`)
      }
    } finally {
      setSubmitting(false)
    }
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
            <Group>
              {access.student && thesis.state === ThesisState.WRITING && (
                <ConfirmationButton
                  confirmationTitle='Final Submission'
                  confirmationText='Are you sure you want to submit your thesis? This action cannot be undone.'
                  ml='auto'
                  onClick={onFinalSubmission}
                  loading={submitting}
                >
                  Final Submission
                </ConfirmationButton>
              )}
            </Group>
          </Stack>
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  )
}

export default ThesisWritingSection
