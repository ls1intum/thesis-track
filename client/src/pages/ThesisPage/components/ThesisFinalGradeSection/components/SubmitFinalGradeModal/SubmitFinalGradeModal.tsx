import { IThesis } from '../../../../../../requests/responses/thesis'
import { Button, Modal, Stack, TextInput } from '@mantine/core'
import { doRequest } from '../../../../../../requests/request'
import { useEffect, useState } from 'react'
import DocumentEditor from '../../../../../../components/DocumentEditor/DocumentEditor'
import {
  useLoadedThesisContext,
  useThesisUpdateAction,
} from '../../../../../../providers/ThesisProvider/hooks'
import { ApiError } from '../../../../../../requests/handler'
import ThesisVisibilitySelect from '../../../ThesisVisibilitySelect/ThesisVisibilitySelect'

interface ISubmitFinalGradeModalProps {
  opened: boolean
  onClose: () => unknown
}

const SubmitFinalGradeModal = (props: ISubmitFinalGradeModalProps) => {
  const { opened, onClose } = props

  const { thesis } = useLoadedThesisContext()

  const [finalGrade, setFinalGrade] = useState('')
  const [feedback, setFeedback] = useState('')
  const [visibility, setVisibility] = useState(thesis.visibility)

  useEffect(() => {
    setVisibility(visibility)
  }, [thesis.visibility])

  const isEmpty = !finalGrade || !feedback

  const [submitting, onGradeSubmit] = useThesisUpdateAction(async () => {
    const response = await doRequest<IThesis>(`/v2/theses/${thesis.thesisId}/grade`, {
      method: 'POST',
      requiresAuth: true,
      data: {
        finalGrade,
        finalFeedback: feedback,
        visibility: visibility,
      },
    })

    if (response.ok) {
      onClose()

      return response.data
    } else {
      throw new ApiError(response)
    }
  }, 'Final Grade submitted successfully')

  return (
    <Modal opened={opened} onClose={onClose} size='xl' title='Submit Final Grade'>
      <Stack gap='md'>
        <ThesisVisibilitySelect
          required
          label='Thesis Visibility'
          value={visibility}
          onChange={(e) => e && setVisibility(e)}
        />
        <TextInput
          required
          label='Final Grade'
          value={finalGrade}
          onChange={(e) => setFinalGrade(e.target.value)}
        />
        <DocumentEditor
          required
          label='Feedback (Visible to student)'
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          editMode={true}
        />
        <Button loading={submitting} onClick={onGradeSubmit} disabled={isEmpty}>
          Submit Grade
        </Button>
      </Stack>
    </Modal>
  )
}

export default SubmitFinalGradeModal
