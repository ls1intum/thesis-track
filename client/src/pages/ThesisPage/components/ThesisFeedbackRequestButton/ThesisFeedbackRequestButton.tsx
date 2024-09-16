import { useEffect, useState } from 'react'
import {
  useLoadedThesisContext,
  useThesisUpdateAction,
} from '../../../../contexts/ThesisProvider/hooks'
import { ActionIcon, Button, Checkbox, Group, Modal, Stack, TextInput } from '@mantine/core'
import { doRequest } from '../../../../requests/request'
import { IThesis } from '../../../../requests/responses/thesis'
import { ApiError } from '../../../../requests/handler'
import { randomId } from '@mantine/hooks'
import { X } from 'phosphor-react'

interface IThesisFeedbackRequestButtonProps {
  type: string
}

const ThesisFeedbackRequestButton = (props: IThesisFeedbackRequestButtonProps) => {
  const { type } = props

  const { thesis, access } = useLoadedThesisContext()

  const [opened, setOpened] = useState(false)
  const [newChanges, setNewChanges] = useState<
    Array<{
      id: string
      feedback: string
    }>
  >([])
  const [editChanges, setEditChanges] = useState<
    Array<{
      feedbackId: string
      completed: boolean
    }>
  >([])

  useEffect(() => {
    setNewChanges([{ feedback: '', id: randomId() }])
    setEditChanges([])
  }, [opened])

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
          feedback: newChange.feedback,
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

  if (!access.advisor || !thesis.proposal) {
    return null
  }

  return (
    <Button variant='outline' color='red' onClick={() => setOpened(true)}>
      <Modal
        title='Request Changes'
        opened={opened}
        onClose={() => setOpened(false)}
        onClick={(e) => e.stopPropagation()}
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
          {newChanges.map((change) => (
            <Group key={change.id} style={{ width: '100%' }}>
              <TextInput
                style={{ flexGrow: 1 }}
                value={change.feedback}
                onChange={(e) => {
                  change.feedback = e.target.value
                  setNewChanges([...newChanges])
                }}
              />
              <ActionIcon
                onClick={() =>
                  setNewChanges((prev) => prev.filter((item) => item.id !== change.id))
                }
              >
                <X />
              </ActionIcon>
            </Group>
          ))}
          <Group>
            <Button
              variant='outline'
              ml='auto'
              onClick={() => setNewChanges((prev) => [...prev, { id: randomId(), feedback: '' }])}
            >
              + Add Item
            </Button>
          </Group>
          <Button
            fullWidth
            loading={loading}
            disabled={
              (editChanges.length === 0 && newChanges.length === 0) ||
              newChanges.some((change) => !change.feedback)
            }
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
