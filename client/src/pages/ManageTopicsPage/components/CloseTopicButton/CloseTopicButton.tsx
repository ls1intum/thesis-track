import { ITopic } from '../../../../requests/responses/topic'
import { Trash } from 'phosphor-react'
import { Button } from '@mantine/core'
import React from 'react'

interface ICloseTopicButtonProps {
  topic: ITopic
}

const CloseTopicButton = (props: ICloseTopicButtonProps) => {
  const {} = props

  return (
    <Button>
      <Trash />
    </Button>
  )
}

export default CloseTopicButton
