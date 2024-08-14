import { ITopic } from '../../../../requests/responses/topic'
import { Accordion, Button, Center, Space } from '@mantine/core'
import { useTopicsContext } from '../../../../contexts/TopicsProvider/hooks'
import TopicData from '../../../../components/TopicData/TopicData'
import React from 'react'

interface ISelectTopicStepProps {
  onComplete: (topic: ITopic | undefined) => unknown
}

const SelectTopicStep = (props: ISelectTopicStepProps) => {
  const { onComplete } = props

  const { topics } = useTopicsContext()

  return (
    <Accordion defaultValue='custom' variant='separated'>
      <Accordion.Item value='custom'>
        <Accordion.Control>Suggest Topic</Accordion.Control>
        <Accordion.Panel>
          <Center>
            <Button onClick={() => onComplete(undefined)}>Suggest your own topic</Button>
          </Center>
        </Accordion.Panel>
      </Accordion.Item>
      {topics?.content.map((topic) => (
        <Accordion.Item key={topic.topicId} value={topic.topicId}>
          <Accordion.Control>{topic.title}</Accordion.Control>
          <Accordion.Panel>
            <TopicData topic={topic} />
            <Space mb='md' />
            <Center>
              <Button onClick={() => onComplete(topic)}>Apply for this Topic</Button>
            </Center>
          </Accordion.Panel>
        </Accordion.Item>
      ))}
    </Accordion>
  )
}

export default SelectTopicStep
