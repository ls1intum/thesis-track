import HeroSection from './components/HeroSection/HeroSection'
import TopicsProvider from '../../providers/TopicsProvider/TopicsProvider'
import TopicsTable from '../../components/TopicsTable/TopicsTable'
import { Button, Group, Stack, Title } from '@mantine/core'
import React from 'react'
import { Link } from 'react-router'
import PublishedTheses from './components/PublishedTheses/PublishedTheses'
import { usePageTitle } from '../../hooks/theme'
import PublicArea from '../../app/layout/PublicArea/PublicArea'

const LandingPage = () => {
  usePageTitle('Find a Thesis Topic')

  return (
    <PublicArea hero={<HeroSection />}>
      <Stack>
        <TopicsProvider limit={10}>
          <Stack gap='xs'>
            <Title order={2}>Open Topics</Title>
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
          </Stack>
        </TopicsProvider>
        <PublishedTheses />
      </Stack>
    </PublicArea>
  )
}

export default LandingPage
