import { IThesis } from '../../../../../../requests/responses/thesis'
import { Button, InputLabel, Modal, Stack, TextInput, Title } from '@mantine/core'
import { doRequest } from '../../../../../../requests/request'
import { showSimpleError, showSimpleSuccess } from '../../../../../../utils/notification'
import { useState } from 'react'
import DocumentEditor from '../../../../../../components/DocumentEditor/DocumentEditor'

interface ISubmitFinalGradeModalProps {
  thesis: IThesis
  opened: boolean
  onClose: () => unknown
  onUpdate: (thesis: IThesis) => unknown
}

const SubmitFinalGradeModal = (props: ISubmitFinalGradeModalProps) => {
  const { thesis, opened, onClose, onUpdate } = props

  const [finalGrade, setFinalGrade] = useState('')
  const [feedback, setFeedback] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const isEmpty = !finalGrade || !feedback

  const onGradeSubmit = async () => {
    if (isEmpty) {
      return
    }

    setSubmitting(true)

    try {
      const response = await doRequest<IThesis>(`/v2/theses/${thesis.thesisId}/grade`, {
        method: 'POST',
        requiresAuth: true,
        data: {
          finalGrade,
          finalFeedback: feedback,
        },
      })

      if (response.ok) {
        showSimpleSuccess('Assessment submitted successfully')

        onUpdate(response.data)
        onClose()
      } else {
        showSimpleError(`Failed to submit assessment: ${response.status}`)
      }
    } finally {
      setSubmitting(false)
    }
  }

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
