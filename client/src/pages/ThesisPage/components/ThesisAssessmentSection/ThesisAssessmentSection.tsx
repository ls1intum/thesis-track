import { ThesisState } from '../../../../requests/responses/thesis'
import { useState } from 'react'
import { Accordion, Button, Stack, Text } from '@mantine/core'
import SubmitAssessmentModal from './components/SubmitAssessmentModal/SubmitAssessmentModal'
import DocumentEditor from '../../../../components/DocumentEditor/DocumentEditor'
import { checkMinimumThesisState } from '../../../../utils/thesis'
import { useLoadedThesisContext } from '../../../../contexts/ThesisProvider/hooks'
import LabeledItem from '../../../../components/LabeledItem/LabeledItem'

const ThesisAssessmentSection = () => {
  const { thesis, access } = useLoadedThesisContext()

  const [assessmentModal, setAssessmentModal] = useState(false)

  if (!access.advisor || !checkMinimumThesisState(thesis, ThesisState.SUBMITTED)) {
    return <></>
  }

  return (
    <Accordion variant='separated' defaultValue='open'>
      <Accordion.Item value='open'>
        <Accordion.Control>Assessment (Not visible to student)</Accordion.Control>
        <Accordion.Panel>
          <Stack gap='md'>
            {thesis.assessment ? (
              <Stack>
                <DocumentEditor label='Summary' value={thesis.assessment.summary} />
                <DocumentEditor label='Positives' value={thesis.assessment.positives} />
                <DocumentEditor label='Negatives' value={thesis.assessment.negatives} />
                <LabeledItem label='Grade Suggestion' value={thesis.assessment.gradeSuggestion} />
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
