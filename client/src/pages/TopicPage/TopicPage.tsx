import ContentContainer from '../../app/layout/ContentContainer/ContentContainer'
import React from 'react'
import { usePageTitle } from '../../hooks/theme'
import { Link, useParams } from 'react-router-dom'
import { useTopic } from '../../hooks/fetcher'
import NotFound from '../../components/NotFound/NotFound'
import PageLoader from '../../components/PageLoader/PageLoader'
import { Button, Group, Stack, Title } from '@mantine/core'
import TopicData from '../../components/TopicData/TopicData'
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
    <ContentContainer size='md'>
      <Stack gap='md'>
        <Title>{topic.title}</Title>
        <TopicData topic={topic} />
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
