import {
  IPublishedPresentation,
  IThesis,
  IThesisPresentation,
} from '../../../../requests/responses/thesis'
import { ActionIcon, Button, Checkbox, Group, Input, Modal, Stack, TextInput } from '@mantine/core'
import { useThesisUpdateAction } from '../../../../providers/ThesisProvider/hooks'
import { doRequest } from '../../../../requests/request'
import { ApiError } from '../../../../requests/handler'
import { useEffect, useState } from 'react'
import { randomId } from '@mantine/hooks'
import { isEmail } from '@mantine/form'
import { X } from 'phosphor-react'

interface ISchedulePresentationModalProps {
  presentation: IPublishedPresentation | IThesisPresentation | undefined
  onClose: () => unknown
  onChange?: () => unknown
}

const SchedulePresentationModal = (props: ISchedulePresentationModalProps) => {
  const { presentation, onClose, onChange } = props

  const [inviteChairMembers, setInviteChairMembers] = useState(true)
  const [inviteThesisStudents, setInviteThesisStudents] = useState(true)
  const [emails, setEmails] = useState<Array<{ id: string; value: string }>>([])

  const [scheduling, schedulePresentation] = useThesisUpdateAction(async () => {
    if (!presentation) {
      throw new Error('No presentation opened')
    }

    const response = await doRequest<IThesis>(
      `/v2/theses/${presentation.thesisId}/presentations/${presentation.presentationId}/schedule`,
      {
        method: 'POST',
        requiresAuth: true,
        data: {
          optionalAttendees: emails.map((row) => row.value),
          inviteChairMembers,
          inviteThesisStudents,
        },
      },
    )

    if (response.ok) {
      onClose()
      onChange?.()

      return response.data
    } else {
      throw new ApiError(response)
    }
  }, 'Presentation scheduled successfully')

  useEffect(() => {
    setInviteChairMembers(true)
    setInviteThesisStudents(true)
    setEmails([])
  }, [presentation?.presentationId])

  return (
    <Modal title='Schedule Presentation' opened={!!presentation} onClose={onClose}>
      <Stack>
        <Checkbox
          checked={inviteChairMembers}
          onChange={(e) => setInviteChairMembers(e.target.checked)}
          label='Invite Chair Members'
        />
        <Checkbox
          checked={inviteThesisStudents}
          onChange={(e) => setInviteThesisStudents(e.target.checked)}
          label='Invite Students that are currently writing a thesis'
        />
        <Input.Wrapper label='Email Invites'>
          <Stack gap='sm'>
            {emails.map((row, index) => (
              <Group key={row.id} style={{ width: '100%' }}>
                <TextInput
                  style={{ flexGrow: 1 }}
                  type='email'
                  placeholder='Email'
                  error={isEmail('Invalid Email')(row.value)}
                  value={row.value}
                  onChange={(e) => {
                    emails[index].value = e.target.value
                    setEmails([...emails])
                  }}
                />
                <ActionIcon
                  onClick={() => setEmails((prev) => prev.filter((item) => item.id !== row.id))}
                >
                  <X />
                </ActionIcon>
              </Group>
            ))}
            <Group>
              <Button
                variant='outline'
                ml='auto'
                onClick={() => setEmails((prev) => [...prev, { id: randomId(), value: '' }])}
              >
                + Add Email
              </Button>
            </Group>
          </Stack>
        </Input.Wrapper>
        <Button
          fullWidth
          disabled={emails.some((row) => isEmail('true')(row.value))}
          loading={scheduling}
          onClick={() => schedulePresentation()}
        >
          Schedule Presentation
        </Button>
      </Stack>
    </Modal>
  )
}

export default SchedulePresentationModal
