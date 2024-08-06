import { Button, InputLabel, Modal, Stack, TextInput, Title } from '@mantine/core'
import { useState } from 'react'
import DocumentEditor from '../../../../../../components/DocumentEditor/DocumentEditor'
import { doRequest } from '../../../../../../requests/request'
import { IThesis } from '../../../../../../requests/responses/thesis'
import { showSimpleError, showSimpleSuccess } from '../../../../../../utils/notification'

interface ISubmitAssessmentModalProps {
  thesis: IThesis
  opened: boolean
  onClose: () => unknown
  onUpdate: (thesis: IThesis) => unknown
}

const SubmitAssessmentModal = (props: ISubmitAssessmentModalProps) => {
  const { thesis, opened, onClose, onUpdate } = props

  const [submitting, setSubmitting] = useState(false)
  const [summary, setSummary] = useState('')
  const [positives, setPositives] = useState('')
  const [negatives, setNegatives] = useState('')
  const [gradeSuggestion, setGradeSuggestion] = useState('')

  const isEmpty = !summary || !positives || !negatives || !gradeSuggestion

  const onSave = async () => {
    if (isEmpty) {
      return
    }

    setSubmitting(true)

    try {
      const response = await doRequest<IThesis>(`/v2/theses/${thesis.thesisId}/assessment`, {
        method: 'POST',
        requiresAuth: true,
        data: {
          summary,
          positives,
          negatives,
          gradeSuggestion,
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
    <Modal
      opened={opened}
      onClose={onClose}
      size='xl'
      title='Submit Assessment'
    >
      <Stack gap='md'>
        <Stack gap={0}>
          <InputLabel required>Summary</InputLabel>
          <DocumentEditor value={summary} editMode={true} onChange={setSummary} />
        </Stack>
        <Stack gap={0}>
          <InputLabel required>Positives</InputLabel>
          <DocumentEditor value={positives} editMode={true} onChange={setPositives} />
        </Stack>
        <Stack gap={0}>
          <InputLabel required>Negatives</InputLabel>
          <DocumentEditor value={negatives} editMode={true} onChange={setNegatives} />
        </Stack>
        <TextInput
          label='Grade Suggestion'
          required
          value={gradeSuggestion}
          onChange={(e) => setGradeSuggestion(e.target.value)}
        />
        <Button onClick={onSave} disabled={isEmpty} loading={submitting}>
          Submit Assessment
        </Button>
      </Stack>
    </Modal>
  )
}

export default SubmitAssessmentModal
