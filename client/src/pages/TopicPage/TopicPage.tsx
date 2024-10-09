import React from 'react'
import { usePageTitle } from '../../hooks/theme'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useTopic } from '../../hooks/fetcher'
import NotFound from '../../components/NotFound/NotFound'
import PageLoader from '../../components/PageLoader/PageLoader'
import { Button, Divider, Group, Stack, Title } from '@mantine/core'
import TopicData from '../../components/TopicData/TopicData'
import { useManagementAccess } from '../../hooks/authentication'
import ApplicationsProvider from '../../providers/ApplicationsProvider/ApplicationsProvider'
import ApplicationsTable from '../../components/ApplicationsTable/ApplicationsTable'

const TopicPage = () => {
  const { topicId } = useParams<{ topicId: string }>()

  const navigate = useNavigate()
  const managementAccess = useManagementAccess()

  const topic = useTopic(topicId)

  usePageTitle(topic ? topic.title : 'Topic')

  if (topic === false) {
    return <NotFound />
  }

  if (!topic) {
    return <PageLoader />
  }

  return (
    <Stack>
      <Title>{topic.title}</Title>
      <TopicData topic={topic} />
      <Group>
        {managementAccess && (
          <Button variant='outline' component={Link} to='/topics'>
            Manage Topics
          </Button>
        )}
        <Button ml='auto' component={Link} to={`/submit-application/${topic.topicId}`}>
          Apply Now
        </Button>
      </Group>
      {managementAccess && (
        <Stack>
          <Divider />
          <ApplicationsProvider fetchAll={true} limit={10} defaultTopics={[topic.topicId]}>
            <ApplicationsTable
              onApplicationClick={(application) =>
                navigate(`/applications/${application.applicationId}`)
              }
            />
          </ApplicationsProvider>
        </Stack>
      )}
    </Stack>
  )
}

export default TopicPage
