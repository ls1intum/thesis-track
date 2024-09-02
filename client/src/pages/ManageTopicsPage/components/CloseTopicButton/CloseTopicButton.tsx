import { ITopic } from '../../../../requests/responses/topic'
import { X } from 'phosphor-react'
import React, { useEffect, useState } from 'react'
import { useTopicsContext } from '../../../../contexts/TopicsProvider/hooks'
import { doRequest } from '../../../../requests/request'
import { showSimpleError, showSimpleSuccess } from '../../../../utils/notification'
import { getApiResponseErrorMessage } from '../../../../requests/handler'
import { useForm } from '@mantine/form'
import { Button, Checkbox, Modal, Select, Stack, Text } from '@mantine/core'

interface ICloseTopicButtonProps {
  topic: ITopic
  size?: string
}

const CloseTopicButton = (props: ICloseTopicButtonProps) => {
  const { topic, size } = props

  const { updateTopic } = useTopicsContext()

  const [confirmationModal, setConfirmationModal] = useState(false)
  const [loading, setLoading] = useState(false)

  const form = useForm<{
    notifyUser: boolean
    reason: string
  }>({
    mode: 'controlled',
    initialValues: {
      notifyUser: true,
      reason: 'TOPIC_FILLED',
    },
  })

  useEffect(() => {
    form.reset()
  }, [confirmationModal])

  if (topic.closedAt) {
    return null
  }

  return (
    <Button onClick={() => setConfirmationModal(true)} size={size}>
      <Modal
        title='Close Topic'
        opened={confirmationModal}
        onClose={() => setConfirmationModal(false)}
        onClick={(e) => e.stopPropagation()}
      >
        <form
          onSubmit={form.onSubmit(async (values) => {
            setLoading(true)

            try {
              const response = await doRequest<ITopic>(`/v2/topics/${topic.topicId}`, {
                method: 'DELETE',
                requiresAuth: true,
                data: {
                  notifyUser: values.notifyUser,
                  reason: values.reason,
                },
              })

              if (response.ok) {
                updateTopic(response.data)

                showSimpleSuccess('Topic closed successfully')
              } else {
                showSimpleError(getApiResponseErrorMessage(response))
              }
            } finally {
              setLoading(false)
            }
          })}
        >
          <Stack>
            <Text>
              Are you sure you want to close this topic? This will reject all applications for it.
            </Text>
            <Select
              label='Reason'
              required
              data={[
                { value: 'TOPIC_FILLED', label: 'Topic was filled' },
                { value: 'TOPIC_OUTDATED', label: 'Topic is outdated' },
              ]}
              {...form.getInputProps('reason')}
            />
            <Checkbox
              label='Notify Students'
              required
              {...form.getInputProps('notifyUser', { type: 'checkbox' })}
            />
            <Button type='submit' loading={loading} fullWidth>
              Close Topic
            </Button>
          </Stack>
        </form>
      </Modal>
      <X />
    </Button>
  )
}

export default CloseTopicButton
