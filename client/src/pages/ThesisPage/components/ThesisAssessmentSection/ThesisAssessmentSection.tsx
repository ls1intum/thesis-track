import { ThesisState } from '../../../../requests/responses/thesis'
import { useState } from 'react'
import { Accordion, Button, Stack, Text, Title } from '@mantine/core'
import SubmitAssessmentModal from './components/SubmitAssessmentModal/SubmitAssessmentModal'
import DocumentEditor from '../../../../components/DocumentEditor/DocumentEditor'
import { checkMinimumThesisState } from '../../../../utils/thesis'
import { useLoadedThesisContext } from '../../../../contexts/ThesisProvider/hooks'

const ThesisAssessmentSection = () => {
  const { thesis, access } = useLoadedThesisContext()

  const [opened, setOpened] = useState(true)

  const [assessmentModal, setAssessmentModal] = useState(false)

  if (!access.advisor || !checkMinimumThesisState(thesis, ThesisState.SUBMITTED)) {
    return <></>
  }

  return (
    <Accordion
      variant='separated'
      value={opened ? 'open' : ''}
      onChange={(value) => setOpened(value === 'open')}
    >
      <Accordion.Item value='open'>
        <Accordion.Control>Assessment (Not visible to student)</Accordion.Control>
        <Accordion.Panel>
          <Stack gap='md'>
            {thesis.assessment ? (
              <Stack>
                <Title order={3}>Summary</Title>
                <DocumentEditor value={thesis.assessment.summary} />
                <Title order={3}>Positives</Title>
                <DocumentEditor value={thesis.assessment.positives} />
                <Title order={3}>Negatives</Title>
                <DocumentEditor value={thesis.assessment.negatives} />
                <Title order={3}>Grade Suggestion</Title>
                <Text>{thesis.assessment.gradeSuggestion}</Text>
              </Stack>
            ) : (
              <Text ta='center'>No assessment added yet</Text>
            )}
            {access.advisor && thesis.state === ThesisState.SUBMITTED && (
              <Button ml='auto' onClick={() => setAssessmentModal(true)}>
                Add Assessment
              </Button>
            )}
          </Stack>
          <SubmitAssessmentModal
            opened={assessmentModal}
            onClose={() => setAssessmentModal(false)}
          />
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  )
}

export default ThesisAssessmentSection
