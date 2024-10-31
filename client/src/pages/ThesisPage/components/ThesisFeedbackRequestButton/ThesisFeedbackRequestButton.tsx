import { useEffect, useState } from 'react'
import {
  useLoadedThesisContext,
  useThesisUpdateAction,
} from '../../../../providers/ThesisProvider/hooks'
import {
  Button,
  Checkbox,
  Modal,
  Stack,
  Textarea,
} from '@mantine/core'
import { doRequest } from '../../../../requests/request'
import { IThesis } from '../../../../requests/responses/thesis'
import { ApiError } from '../../../../requests/handler'

interface IThesisFeedbackRequestButtonProps {
  type: string
}

const ThesisFeedbackRequestButton = (props: IThesisFeedbackRequestButtonProps) => {
  const { type } = props

  const { thesis } = useLoadedThesisContext()

  const [opened, setOpened] = useState(false)
  const [changes, setChanges] = useState('')
  const [editChanges, setEditChanges] = useState<
    Array<{
      feedbackId: string
      completed: boolean
    }>
  >([])

  useEffect(() => {
    setChanges('')
    setEditChanges([])
  }, [opened])

  const newChanges = changes.split('\n').filter((x) => x.trim())

  const [loading, onSave] = useThesisUpdateAction(async () => {
    for (const editChange of editChanges) {
      await doRequest<IThesis>(
        `/v2/theses/${thesis.thesisId}/feedback/${editChange.feedbackId}/${editChange.completed ? 'complete' : 'request'}`,
        {
          method: 'PUT',
          requiresAuth: true,
        },
      )
    }

    const response = await doRequest<IThesis>(`/v2/theses/${thesis.thesisId}/feedback`, {
      method: 'POST',
      requiresAuth: true,
      data: {
        type,
        requestedChanges: newChanges.map((newChange) => ({
          feedback: newChange,
          completed: false,
        })),
      },
    })

    if (response.ok) {
      setOpened(false)

      return response.data
    } else {
      throw new ApiError(response)
    }
  }, 'Changes requested successfully')

  return (
    <Button variant='outline' color='red' onClick={() => setOpened(true)}>
      <Modal
        title='Request Changes'
        opened={opened}
        onClose={() => setOpened(false)}
        onClick={(e) => e.stopPropagation()}
        size='xl'
      >
        <Stack>
          {thesis.feedback
            .filter((change) => change.type === type)
            .map((change) => (
              <Checkbox
                key={change.feedbackId}
                label={change.feedback}
                checked={
                  editChanges.find((item) => item.feedbackId === change.feedbackId)?.completed ??
                  !!change.completedAt
                }
                onChange={(e) => {
                  if (e.target.checked === !!change.completedAt) {
                    setEditChanges((prev) =>
                      prev.filter((item) => item.feedbackId !== change.feedbackId),
                    )
                  } else {
                    setEditChanges((prev) => [
                      ...prev,
                      { feedbackId: change.feedbackId, completed: e.target.checked },
                    ])
                  }
                }}
              />
            ))}
          <Textarea
            label='New Change Requests (split multiple requests by lines)'
            rows={10}
            value={changes}
            onChange={(e) => setChanges(e.target.value)}
          />
          <Button
            fullWidth
            loading={loading}
            disabled={editChanges.length === 0 && newChanges.length === 0}
            onClick={onSave}
          >
            Request Changes
          </Button>
        </Stack>
      </Modal>
      Request Changes
    </Button>
  )
}

export default ThesisFeedbackRequestButton
