import ContentContainer from '../../app/layout/ContentContainer/ContentContainer'
import React from 'react'
import { usePageTitle } from '../../hooks/theme'
import { Link, useParams } from 'react-router-dom'
import { useTopic } from '../../hooks/fetcher'
import NotFound from '../../components/NotFound/NotFound'
import PageLoader from '../../components/PageLoader/PageLoader'
import { Button, Grid, Group, Stack, Title } from '@mantine/core'
import DocumentEditor from '../../components/DocumentEditor/DocumentEditor'
import LabeledItem from '../../components/LabeledItem/LabeledItem'
import { formatDate, formatUser } from '../../utils/format'
import { GLOBAL_CONFIG } from '../../config/global'
import { useUser } from '../../hooks/authentication'

const TopicPage = () => {
  const { topicId } = useParams<{ topicId: string }>()

  const user = useUser()

  const topic = useTopic(topicId)

  usePageTitle('Topic')

  if (topic === false) {
    return <NotFound />
  }

  if (!topic) {
    return <PageLoader />
  }

  return (
    <ContentContainer>
      <Stack gap='md'>
        <Title>{topic.title}</Title>
        <Grid>
          <Grid.Col span={{ md: 3 }}>
            <LabeledItem
              label='Supervisor'
              value={topic.supervisors
                .map((x) => formatUser(x, { withUniversityId: false }))
                .join(', ')}
            />
          </Grid.Col>
          <Grid.Col span={{ md: 3 }}>
            <LabeledItem
              label='Advisor'
              value={topic.advisors
                .map((x) => formatUser(x, { withUniversityId: false }))
                .join(', ')}
            />
          </Grid.Col>
          <Grid.Col span={{ md: 3 }}>
            <LabeledItem
              label='Type'
              value={topic.type ? (GLOBAL_CONFIG.thesis_types[topic.type] ?? topic.type) : 'Any'}
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
        <Group>
          {['admin', 'supervisor', 'advisor'].some((group) => user?.groups.includes(group)) && (
            <Button variant='outline' component={Link} to='/topics'>
              Manage Topics
            </Button>
          )}
          <Button ml='auto' component={Link} to={`/submit-application/apply/${topic.topicId}`}>
            Apply Now
          </Button>
        </Group>
      </Stack>
    </ContentContainer>
  )
}

export default TopicPage
