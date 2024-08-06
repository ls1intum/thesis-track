import { IThesis, ThesisState } from '../../../../requests/responses/thesis'
import { IThesisAccessPermissions } from '../../types'
import { useState } from 'react'
import { Accordion, Button, Stack, Text, Title } from '@mantine/core'
import SubmitFinalGradeModal from './components/SubmitFinalGradeModal/SubmitFinalGradeModal'
import { showSimpleError, showSimpleSuccess } from '../../../../utils/notification'
import { doRequest } from '../../../../requests/request'
import DocumentEditor from '../../../../components/DocumentEditor/DocumentEditor'

interface IThesisFinalGradeSectionProps {
  thesis: IThesis
  access: IThesisAccessPermissions
  onUpdate: (thesis: IThesis) => unknown
}

const ThesisFinalGradeSection = (props: IThesisFinalGradeSectionProps) => {
  const { thesis, access, onUpdate } = props

  const [opened, setOpened] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [finalGradeModal, setFinalGradeModal] = useState(false)

  const onThesisComplete = async () => {
    setSubmitting(true)

    try {
      const response = await doRequest<IThesis>(`/v2/theses/${thesis.thesisId}/complete`, {
        method: 'POST',
        requiresAuth: true,
      })

      if (response.ok) {
        showSimpleSuccess('Thesis successfully marked as finished')

        onUpdate(response.data)
      } else {
        showSimpleError(`Failed to complete thesis: ${response.status}`)
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
        <Accordion.Control>Final Grade</Accordion.Control>
        <Accordion.Panel>
          <Stack>
            {thesis.finalGrade ? (
              <Stack>
                <Title order={3}>Final Grade</Title>
                <Text>{thesis.finalGrade}</Text>
                {thesis.finalFeedback && (
                  <>
                    <Title order={3}>Feedback</Title>
                    <DocumentEditor value={thesis.finalFeedback} />
                  </>
                )}
              </Stack>
            ) : (
              <Text ta='center'>No grade added yet</Text>
            )}
            {access.supervisor && thesis.state === ThesisState.ASSESSED && (
              <Button ml='auto' onClick={() => setFinalGradeModal(true)}>
                Add Final Grade
              </Button>
            )}
            {access.supervisor && thesis.state === ThesisState.GRADED && (
              <Button ml='auto' onClick={onThesisComplete} loading={submitting}>
                Mark thesis as finished
              </Button>
            )}
          </Stack>
          <SubmitFinalGradeModal
            thesis={thesis}
            opened={finalGradeModal}
            onClose={() => setFinalGradeModal(false)}
            onUpdate={onUpdate}
          />
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  )
}

export default ThesisFinalGradeSection
