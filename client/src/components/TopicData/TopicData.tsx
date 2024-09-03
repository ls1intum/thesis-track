import { ITopic } from '../../requests/responses/topic'
import { Grid, Stack, Text } from '@mantine/core'
import LabeledItem from '../LabeledItem/LabeledItem'
import { formatDate, formatThesisType, pluralize } from '../../utils/format'
import DocumentEditor from '../DocumentEditor/DocumentEditor'
import React from 'react'
import AvatarUserList from '../AvatarUserList/AvatarUserList'

interface ITopicDataProps {
  topic: ITopic
}

const TopicData = (props: ITopicDataProps) => {
  const { topic } = props

  return (
    <Stack gap='md'>
      <Grid>
        <Grid.Col span={{ md: 3 }}>
          <LabeledItem
            label={pluralize('Supervisor', topic.supervisors.length)}
            value={<AvatarUserList users={topic.supervisors} />}
          />
        </Grid.Col>
        <Grid.Col span={{ md: 3 }}>
          <LabeledItem
            label={pluralize('Advisor', topic.advisors.length)}
            value={<AvatarUserList users={topic.advisors} />}
          />
        </Grid.Col>
        <Grid.Col span={{ md: 3 }}>
          <LabeledItem
            label={pluralize('Thesis Type', topic.thesisTypes?.length || 0)}
            value={
              <Stack gap={2}>
                {topic.thesisTypes ? (
                  topic.thesisTypes.map((type) => (
                    <Text key={type} size='sm'>
                      {formatThesisType(type)}
                    </Text>
                  ))
                ) : (
                  <Text size='sm'>Any</Text>
                )}
              </Stack>
            }
          />
        </Grid.Col>
        <Grid.Col span={{ md: 3 }}>
          <LabeledItem
            label='Published At'
            value={formatDate(topic.createdAt, { withTime: false })}
          />
        </Grid.Col>
      </Grid>
      <DocumentEditor label='Problem Statement' value={topic.problemStatement} />
      {topic.requirements && <DocumentEditor label='Requirements' value={topic.requirements} />}
      {topic.goals && <DocumentEditor label='Goals' value={topic.goals} />}
      {topic.references && <DocumentEditor label='References' value={topic.references} />}
    </Stack>
  )
}

export default TopicData
