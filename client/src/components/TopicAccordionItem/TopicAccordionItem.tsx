import { Accordion, Badge, Group, Text } from '@mantine/core'
import TopicData from '../TopicData/TopicData'
import React, { PropsWithChildren } from 'react'
import { ITopic } from '../../requests/responses/topic'

interface ITopicAccordionItemProps {
  topic: ITopic
}

const TopicAccordionItem = (props: PropsWithChildren<ITopicAccordionItemProps>) => {
  const { topic, children } = props

  return (
    <Accordion.Item key={topic.topicId} value={topic.topicId}>
      <Accordion.Control>
        <Group>
          <Text truncate>{topic.title}</Text>
          {topic.closedAt && (
            <Badge ml='auto' mr='sm' color='red'>
              Closed
            </Badge>
          )}
        </Group>
      </Accordion.Control>
      <Accordion.Panel>
        <TopicData topic={topic} />
        {children}
      </Accordion.Panel>
    </Accordion.Item>
  )
}

export default TopicAccordionItem
