import HeroSection from './components/HeroSection/HeroSection'
import TopicsProvider from '../../providers/TopicsProvider/TopicsProvider'
import TopicsTable from '../../components/TopicsTable/TopicsTable'
import { Button, Group, Space, Title } from '@mantine/core'
import React from 'react'
import { Link } from 'react-router-dom'
import PublishedTheses from './components/PublishedTheses/PublishedTheses'
import { usePageTitle } from '../../hooks/theme'
import PublicArea from '../../app/layout/PublicArea/PublicArea'

const LandingPage = () => {
  usePageTitle('Find or Propose a Thesis Topic')

  return (
    <div>
      <HeroSection />
      <PublicArea>
        <TopicsProvider limit={10}>
          <Title order={2} mb='sm'>
            Open Topics
          </Title>
          <TopicsTable
            columns={['title', 'types', 'advisor', 'actions']}
            noBorder
            extraColumns={{
              actions: {
                accessor: 'actions',
                title: 'Actions',
                textAlign: 'center',
                noWrap: true,
                width: 120,
                render: (topic) => (
                  <Group
                    preventGrowOverflow={false}
                    justify='center'
                    onClick={(e) => e.stopPropagation()}
                  >
                    {!topic.closedAt && (
                      <Button
                        component={Link}
                        to={`/submit-application/${topic.topicId}`}
                        size='xs'
                      >
                        Apply
                      </Button>
                    )}
                  </Group>
                ),
              },
            }}
          />
        </TopicsProvider>
        <Space my='md' />
        <PublishedTheses />
      </PublicArea>
    </div>
  )
}

export default LandingPage
