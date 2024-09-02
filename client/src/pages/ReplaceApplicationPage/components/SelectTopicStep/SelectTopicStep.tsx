import { ITopic } from '../../../../requests/responses/topic'
import { Accordion, Button, Center, Space } from '@mantine/core'
import { useTopicsContext } from '../../../../contexts/TopicsProvider/hooks'
import React from 'react'
import TopicAccordionItem from '../../../../components/TopicAccordionItem/TopicAccordionItem'
import TopicsFilters from '../../../../components/TopicsFilters/TopicsFilters'
import { GLOBAL_CONFIG } from '../../../../config/global'

interface ISelectTopicStepProps {
  onComplete: (topic: ITopic | undefined) => unknown
}

const SelectTopicStep = (props: ISelectTopicStepProps) => {
  const { onComplete } = props

  const { topics } = useTopicsContext()

  return (
    <div>
      <TopicsFilters visible={['type']} />
      <Accordion variant='separated'>
        {topics?.content.map((topic) => (
          <TopicAccordionItem key={topic.topicId} topic={topic}>
            <Space mb='md' />
            <Center>
              <Button onClick={() => onComplete(topic)}>Apply for this Topic</Button>
            </Center>
          </TopicAccordionItem>
        ))}
        {GLOBAL_CONFIG.allow_suggested_topics && (
          <Accordion.Item value='custom'>
            <Accordion.Control>Suggest Topic</Accordion.Control>
            <Accordion.Panel>
              <Center>
                <Button onClick={() => onComplete(undefined)}>Suggest your own topic</Button>
              </Center>
            </Accordion.Panel>
          </Accordion.Item>
        )}
      </Accordion>
    </div>
  )
}

export default SelectTopicStep
