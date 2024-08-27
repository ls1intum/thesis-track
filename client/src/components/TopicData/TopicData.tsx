import { ITopic } from '../../requests/responses/topic'
import { Grid, Stack } from '@mantine/core'
import LabeledItem from '../LabeledItem/LabeledItem'
import { formatDate, formatUser } from '../../utils/format'
import { GLOBAL_CONFIG } from '../../config/global'
import DocumentEditor from '../DocumentEditor/DocumentEditor'
import React from 'react'

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
            label='Supervisor'
            value={topic.supervisors
              .map((supervisor) => formatUser(supervisor, { withUniversityId: false }))
              .join(', ')}
          />
        </Grid.Col>
        <Grid.Col span={{ md: 3 }}>
          <LabeledItem
            label='Advisor'
            value={topic.advisors
              .map((advisor) => formatUser(advisor, { withUniversityId: false }))
              .join(', ')}
          />
        </Grid.Col>
        <Grid.Col span={{ md: 3 }}>
          <LabeledItem
            label='Thesis Types'
            value={
              topic.thesisTypes
                ? topic.thesisTypes.map(
                    (thesisType) => GLOBAL_CONFIG.thesis_types[thesisType] ?? thesisType,
                  )
                : 'Any'
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
      {topic.goals && <DocumentEditor label='Goals' value={topic.goals} />}
      {topic.references && <DocumentEditor label='References' value={topic.references} />}
    </Stack>
  )
}

export default TopicData
