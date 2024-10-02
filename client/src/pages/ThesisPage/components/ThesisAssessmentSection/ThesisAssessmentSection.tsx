import { ThesisState } from '../../../../requests/responses/thesis'
import { useRef, useState } from 'react'
import { Accordion, Button, Center, Stack, Text, Badge, Group } from '@mantine/core'
import SubmitAssessmentModal from './components/SubmitAssessmentModal/SubmitAssessmentModal'
import DocumentEditor from '../../../../components/DocumentEditor/DocumentEditor'
import { checkMinimumThesisState } from '../../../../utils/thesis'
import { useLoadedThesisContext } from '../../../../contexts/ThesisProvider/hooks'
import LabeledItem from '../../../../components/LabeledItem/LabeledItem'
import generatePDF, { Margin } from 'react-to-pdf'
import { formatThesisFilename } from '../../../../utils/format'

const ThesisAssessmentSection = () => {
  const { thesis, access } = useLoadedThesisContext()

  const targetRef = useRef<HTMLDivElement>(null)

  const [assessmentModal, setAssessmentModal] = useState(false)

  if (!access.advisor || !checkMinimumThesisState(thesis, ThesisState.SUBMITTED)) {
    return <></>
  }

  return (
    <Accordion variant='separated' defaultValue='open'>
      <Accordion.Item value='open'>
        <Accordion.Control>
          <Group gap='xs'>
            <Text>Assessment</Text>
            <Badge color='grey'>Not visible to student</Badge>
          </Group>
        </Accordion.Control>
        <Accordion.Panel>
          <Stack gap='md'>
            {thesis.assessment ? (
              <Stack ref={targetRef}>
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
            {thesis.assessment && (
              <Center>
                <Button
                  variant='outline'
                  onClick={() =>
                    generatePDF(targetRef, {
                      filename: formatThesisFilename(thesis, 'Assessment'),
                      page: {
                        margin: Margin.SMALL,
                      },
                    })
                  }
                >
                  Download as PDF
                </Button>
              </Center>
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
