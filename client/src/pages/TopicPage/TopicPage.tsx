import ContentContainer from '../../app/layout/ContentContainer/ContentContainer'
import React from 'react'
import { usePageTitle } from '../../hooks/theme'
import { useNavigate, useParams } from 'react-router-dom'
import { useTopic } from '../../hooks/fetcher'
import NotFound from '../../components/NotFound/NotFound'
import PageLoader from '../../components/PageLoader/PageLoader'
import { Button, Center, Grid, Stack, Title } from '@mantine/core'
import DocumentEditor from '../../components/DocumentEditor/DocumentEditor'
import LabeledItem from '../../components/LabeledItem/LabeledItem'
import { formatDate, formatUser } from '../../utils/format'
import { Link } from '@mantine/tiptap'
import { GLOBAL_CONFIG } from '../../config/global'

const TopicPage = () => {
  const { topicId } = useParams<{ topicId: string }>()

  const navigate = useNavigate()

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
                .map((user) => formatUser(user, { withUniversityId: false }))
                .join(',')}
            />
          </Grid.Col>
          <Grid.Col span={{ md: 3 }}>
            <LabeledItem
              label='Advisor'
              value={topic.advisors
                .map((user) => formatUser(user, { withUniversityId: false }))
                .join(',')}
            />
          </Grid.Col>
          <Grid.Col span={{ md: 3 }}>
            <LabeledItem
              label='Type'
              value={
                topic.requiredDegree
                  ? (GLOBAL_CONFIG.study_degrees[topic.requiredDegree] ?? topic.requiredDegree)
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
        <Button ml='auto' onClick={() => navigate(`/submit-application/apply/${topic.topicId}`)}>
          Apply Now
        </Button>
      </Stack>
    </ContentContainer>
  )
}

export default TopicPage
