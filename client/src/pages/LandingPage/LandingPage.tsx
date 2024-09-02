import HeroSection from './components/HeroSection/HeroSection'
import TopicsProvider from '../../contexts/TopicsProvider/TopicsProvider'
import TopicsTable from '../../components/TopicsTable/TopicsTable'
import ContentContainer from '../../app/layout/ContentContainer/ContentContainer'
import { Button, Group, Space, Title } from '@mantine/core'
import React from 'react'
import { Link } from 'react-router-dom'
import PublishedTheses from './components/PublishedTheses/PublishedTheses'
import Footer from './components/Footer/Footer'

const LandingPage = () => {
  return (
    <div>
      <HeroSection />
      <ContentContainer size='md'>
        <TopicsProvider limit={10}>
          <Title order={2} mb='sm'>
            Open Topics
          </Title>
          <TopicsTable
            columns={['title', 'advisor', 'actions']}
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
      </ContentContainer>
      <Footer />
    </div>
  )
}

export default LandingPage
