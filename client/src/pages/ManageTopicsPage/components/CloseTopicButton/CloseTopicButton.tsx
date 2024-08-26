import { ITopic } from '../../../../requests/responses/topic'
import { Trash } from 'phosphor-react'
import React from 'react'
import { useTopicsContext } from '../../../../contexts/TopicsProvider/hooks'
import { doRequest } from '../../../../requests/request'
import { showSimpleError, showSimpleSuccess } from '../../../../utils/notification'
import { getApiResponseErrorMessage } from '../../../../requests/handler'
import ConfirmationButton from '../../../../components/ConfirmationButton/ConfirmationButton'

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
    <ConfirmationButton
      onClick={onClose}
      size={size}
      confirmationTitle='Close Topic'
      confirmationText='Are you sure you want to close this topic? This will reject all applications for it.'
    >
      <Trash />
    </ConfirmationButton>
  )
}

export default CloseTopicButton
