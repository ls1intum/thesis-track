import ContentContainer from '../../app/layout/ContentContainer/ContentContainer'
import React from 'react'
import { usePageTitle } from '../../hooks/theme'
import { useNavigate, useParams } from 'react-router-dom'
import { useTopic } from '../../hooks/fetcher'
import NotFound from '../../components/NotFound/NotFound'
import PageLoader from '../../components/PageLoader/PageLoader'
import { Button, Center, Stack, Title } from '@mantine/core'
import DocumentEditor from '../../components/DocumentEditor/DocumentEditor'
import LabeledItem from '../../components/LabeledItem/LabeledItem'
import { formatUser } from '../../utils/format'
import { Link } from '@mantine/tiptap'

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
        <DocumentEditor label='Problem Statement' value={topic.problemStatement} />
        {topic.goals && <DocumentEditor label='Goals' value={topic.goals} />}
        {topic.references && <DocumentEditor label='References' value={topic.references} />}
        <LabeledItem
          label='Supervisor'
          value={topic.supervisors.map((user) => formatUser(user)).join(',')}
        />
        <LabeledItem
          label='Advisor'
          value={topic.advisors.map((user) => formatUser(user)).join(',')}
        />
        <Button ml='auto' onClick={() => navigate(`/submit-application/apply/${topic.topicId}`)}>
          Apply Now
        </Button>
      </Stack>
    </ContentContainer>
  )
}

export default TopicPage
