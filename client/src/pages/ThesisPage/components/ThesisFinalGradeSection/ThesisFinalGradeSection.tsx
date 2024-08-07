import { IThesis, ThesisState } from '../../../../requests/responses/thesis'
import { useState } from 'react'
import { Accordion, Button, Stack, Text, Title } from '@mantine/core'
import SubmitFinalGradeModal from './components/SubmitFinalGradeModal/SubmitFinalGradeModal'
import { doRequest } from '../../../../requests/request'
import DocumentEditor from '../../../../components/DocumentEditor/DocumentEditor'
import { checkMinimumThesisState } from '../../../../utils/thesis'
import { useLoadedThesisContext, useThesisUpdateAction } from '../../../../contexts/ThesisProvider/hooks'

const ThesisFinalGradeSection = () => {
  const { thesis, access } = useLoadedThesisContext()

  const [opened, setOpened] = useState(true)
  const [finalGradeModal, setFinalGradeModal] = useState(false)

  const [submitting, onThesisComplete] = useThesisUpdateAction(async () => {
    const response = await doRequest<IThesis>(`/v2/theses/${thesis.thesisId}/complete`, {
      method: 'POST',
      requiresAuth: true,
    })

    if (response.ok) {
      return response.data
    } else {
      throw new Error(`Failed to complete thesis: ${response.status}`)
    }
  }, 'Thesis successfully marked as finished')

  if (!checkMinimumThesisState(thesis, ThesisState.ASSESSED)) {
    return <></>
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
            {thesis.grade ? (
              <Stack>
                <Title order={3}>Final Grade</Title>
                <Text>{thesis.grade.finalGrade}</Text>
                <Title order={3}>Feedback</Title>
                <DocumentEditor value={thesis.grade.feedback} />
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
            opened={finalGradeModal}
            onClose={() => setFinalGradeModal(false)}
          />
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  )
}

export default ThesisFinalGradeSection
