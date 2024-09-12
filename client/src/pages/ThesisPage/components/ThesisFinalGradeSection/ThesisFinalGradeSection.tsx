import { IThesis, ThesisState } from '../../../../requests/responses/thesis'
import { useState } from 'react'
import { Accordion, Button, Stack, Text } from '@mantine/core'
import SubmitFinalGradeModal from './components/SubmitFinalGradeModal/SubmitFinalGradeModal'
import { doRequest } from '../../../../requests/request'
import DocumentEditor from '../../../../components/DocumentEditor/DocumentEditor'
import { checkMinimumThesisState } from '../../../../utils/thesis'
import {
  useLoadedThesisContext,
  useThesisUpdateAction,
} from '../../../../contexts/ThesisProvider/hooks'
import { ApiError } from '../../../../requests/handler'
import LabeledItem from '../../../../components/LabeledItem/LabeledItem'

const ThesisFinalGradeSection = () => {
  const { thesis, access } = useLoadedThesisContext()

  const [finalGradeModal, setFinalGradeModal] = useState(false)

  const [submitting, onThesisComplete] = useThesisUpdateAction(async () => {
    const response = await doRequest<IThesis>(`/v2/theses/${thesis.thesisId}/complete`, {
      method: 'POST',
      requiresAuth: true,
    })

    if (response.ok) {
      return response.data
    } else {
      throw new ApiError(response)
    }
  }, 'Thesis successfully marked as finished')

  if (!checkMinimumThesisState(thesis, ThesisState.ASSESSED)) {
    return <></>
  }

  return (
    <Accordion variant='separated' defaultValue='open'>
      <Accordion.Item value='open'>
        <Accordion.Control>Final Grade</Accordion.Control>
        <Accordion.Panel>
          <Stack>
            {thesis.grade ? (
              <Stack>
                <LabeledItem label='Grade' value={thesis.grade.finalGrade} />
                <DocumentEditor label='Feedback' value={thesis.grade.feedback} />
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
