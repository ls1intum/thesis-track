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
import TopicData from '../../components/TopicData/TopicData'

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
        <TopicData topic={topic} />
        <Button ml='auto' onClick={() => navigate(`/submit-application/${topic.topicId}`)}>
          Apply Now
        </Button>
      </Stack>
    </ContentContainer>
  )
}

export default TopicPage
