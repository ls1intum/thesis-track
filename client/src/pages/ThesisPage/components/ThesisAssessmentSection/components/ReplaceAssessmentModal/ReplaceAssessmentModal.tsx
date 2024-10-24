import { Button, Modal, Stack, TextInput } from '@mantine/core'
import { useEffect, useState } from 'react'
import DocumentEditor from '../../../../../../components/DocumentEditor/DocumentEditor'
import { doRequest } from '../../../../../../requests/request'
import { IThesis } from '../../../../../../requests/responses/thesis'
import {
  useLoadedThesisContext,
  useThesisUpdateAction,
} from '../../../../../../providers/ThesisProvider/hooks'
import { ApiError } from '../../../../../../requests/handler'

interface IReplaceAssessmentModalProps {
  opened: boolean
  onClose: () => unknown
}

const ReplaceAssessmentModal = (props: IReplaceAssessmentModalProps) => {
  const { opened, onClose } = props

  const { thesis } = useLoadedThesisContext()

  const [summary, setSummary] = useState('')
  const [positives, setPositives] = useState('')
  const [negatives, setNegatives] = useState('')
  const [gradeSuggestion, setGradeSuggestion] = useState('')

  const isEmpty = !summary || !positives || !negatives || !gradeSuggestion

  const [submitting, onSave] = useThesisUpdateAction(async () => {
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

  useEffect(() => {
    setSummary(thesis.assessment?.summary || '')
    setPositives(thesis.assessment?.positives || '')
    setNegatives(thesis.assessment?.negatives || '')
    setGradeSuggestion(thesis.assessment?.gradeSuggestion || '')
  }, [thesis.assessment])

  return (
    <Modal opened={opened} onClose={onClose} size='xl' title='Submit Assessment'>
      <Stack gap='md'>
        <DocumentEditor
          required
          label='Summary'
          value={summary}
          editMode={true}
          onChange={(e) => setSummary(e.target.value)}
          maxLength={2000}
        />
        <DocumentEditor
          required
          label='Strengths'
          value={positives}
          editMode={true}
          onChange={(e) => setPositives(e.target.value)}
          maxLength={2000}
        />
        <DocumentEditor
          required
          label='Weaknesses'
          value={negatives}
          editMode={true}
          onChange={(e) => setNegatives(e.target.value)}
          maxLength={2000}
        />
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

export default ReplaceAssessmentModal
