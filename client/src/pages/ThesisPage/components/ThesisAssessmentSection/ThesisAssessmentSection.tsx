import { ThesisState } from '../../../../requests/responses/thesis'
import { useState } from 'react'
import { Accordion, Button, Stack, Text, Badge, Group } from '@mantine/core'
import ReplaceAssessmentModal from './components/ReplaceAssessmentModal/ReplaceAssessmentModal'
import DocumentEditor from '../../../../components/DocumentEditor/DocumentEditor'
import { checkMinimumThesisState, isThesisClosed } from '../../../../utils/thesis'
import { useLoadedThesisContext } from '../../../../providers/ThesisProvider/hooks'
import LabeledItem from '../../../../components/LabeledItem/LabeledItem'
import { formatThesisFilename } from '../../../../utils/format'
import AuthenticatedFileDownloadButton from '../../../../components/AuthenticatedFileDownloadButton/AuthenticatedFileDownloadButton'

const ThesisAssessmentSection = () => {
  const { thesis, access } = useLoadedThesisContext()

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
          <Stack>
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
            <Group>
              {thesis.assessment && (
                <AuthenticatedFileDownloadButton
                  url={`/v2/theses/${thesis.thesisId}/assessment`}
                  filename={formatThesisFilename(thesis, 'Assessment', 'assessment.pdf', 0)}
                  variant='outline'
                >
                  Download as PDF
                </AuthenticatedFileDownloadButton>
              )}
              {access.advisor && !isThesisClosed(thesis) && (
                <Button ml='auto' onClick={() => setAssessmentModal(true)}>
                  {thesis.assessment ? 'Edit Assessment' : 'Add Assessment'}
                </Button>
              )}
            </Group>
          </Stack>
          <ReplaceAssessmentModal
            opened={assessmentModal}
            onClose={() => setAssessmentModal(false)}
          />
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  )
}

export default ThesisAssessmentSection
