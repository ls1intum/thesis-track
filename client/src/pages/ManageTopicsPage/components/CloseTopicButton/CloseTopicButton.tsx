import { ITopic } from '../../../../requests/responses/topic'
import { Trash } from 'phosphor-react'
import { ActionIcon, Button } from '@mantine/core'
import React from 'react'
import { useTopicsContext } from '../../../../contexts/TopicsProvider/hooks'
import { doRequest } from '../../../../requests/request'
import { showSimpleError, showSimpleSuccess } from '../../../../utils/notification'
import { getApiResponseErrorMessage } from '../../../../requests/handler'

interface ICloseTopicButtonProps {
  topic: ITopic
  size?: string
}

const CloseTopicButton = (props: ICloseTopicButtonProps) => {
  const { topic, size } = props

  const { updateTopic } = useTopicsContext()

  const onClose = async () => {
    const response = await doRequest<ITopic>(`/v2/topics/${topic.topicId}`, {
      method: 'DELETE',
      requiresAuth: true,
    })

    if (response.ok) {
      updateTopic(response.data)

      showSimpleSuccess('Topic closed successfully')
    } else {
      showSimpleError(getApiResponseErrorMessage(response))
    }
  }

  if (topic.closedAt) {
    return null
  }

  return (
    <ActionIcon onClick={onClose} size={size}>
      <Trash />
    </ActionIcon>
  )
}

export default CloseTopicButton
