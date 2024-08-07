import { IThesis } from '../../../../../../requests/responses/thesis'
import { Button, InputLabel, Modal, Stack, TextInput } from '@mantine/core'
import { doRequest } from '../../../../../../requests/request'
import { useState } from 'react'
import DocumentEditor from '../../../../../../components/DocumentEditor/DocumentEditor'
import {
  useLoadedThesisContext,
  useThesisUpdateAction,
} from '../../../../../../contexts/ThesisProvider/hooks'

interface ISubmitFinalGradeModalProps {
  opened: boolean
  onClose: () => unknown
}

const SubmitFinalGradeModal = (props: ISubmitFinalGradeModalProps) => {
  const { opened, onClose } = props

  const { thesis } = useLoadedThesisContext()

  const [finalGrade, setFinalGrade] = useState('')
  const [feedback, setFeedback] = useState('')

  const isEmpty = !finalGrade || !feedback

  const [submitting, onGradeSubmit] = useThesisUpdateAction(async () => {
    const response = await doRequest<IThesis>(`/v2/theses/${thesis.thesisId}/grade`, {
      method: 'POST',
      requiresAuth: true,
      data: {
        finalGrade,
        finalFeedback: feedback,
      },
    })

    if (response.ok) {
      onClose()

      return response.data
    } else {
      throw new Error(`Failed to submit assessment: ${response.status}`)
    }
  }, 'Final Grade submitted successfully')

  return (
    <Modal opened={opened} onClose={onClose} size='xl' title='Submit Final Grade'>
      <Stack gap='md'>
        <TextInput
          required
          label='Final Grade'
          value={finalGrade}
          onChange={(e) => setFinalGrade(e.target.value)}
        />
        <InputLabel required>Feedback</InputLabel>
        <DocumentEditor value={feedback} onChange={setFeedback} editMode={true} />
        <Button loading={submitting} onClick={onGradeSubmit} disabled={isEmpty}>
          Submit Grade
        </Button>
      </Stack>
    </Modal>
  )
}

export default SubmitFinalGradeModal
