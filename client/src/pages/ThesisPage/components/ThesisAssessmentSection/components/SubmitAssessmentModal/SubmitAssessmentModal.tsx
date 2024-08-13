import { Button, InputLabel, Modal, Stack, TextInput } from '@mantine/core'
import { useState } from 'react'
import DocumentEditor from '../../../../../../components/DocumentEditor/DocumentEditor'
import { doRequest } from '../../../../../../requests/request'
import { IThesis } from '../../../../../../requests/responses/thesis'
import { useThesisUpdateAction } from '../../../../../../contexts/ThesisProvider/hooks'
import { ApiError } from '../../../../../../requests/handler'

interface ISubmitAssessmentModalProps {
  opened: boolean
  onClose: () => unknown
}

const SubmitAssessmentModal = (props: ISubmitAssessmentModalProps) => {
  const { opened, onClose } = props

  const [summary, setSummary] = useState('')
  const [positives, setPositives] = useState('')
  const [negatives, setNegatives] = useState('')
  const [gradeSuggestion, setGradeSuggestion] = useState('')

  const isEmpty = !summary || !positives || !negatives || !gradeSuggestion

  const [submitting, onSave] = useThesisUpdateAction(async (thesis) => {
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
      onClose()

      return response.data
    } else {
      throw new ApiError(response)
    }
  }, 'Assessment submitted successfully')

  return (
    <Modal opened={opened} onClose={onClose} size='xl' title='Submit Assessment'>
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
