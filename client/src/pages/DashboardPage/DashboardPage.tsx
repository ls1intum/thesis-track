import ContentContainer from '../../app/layout/ContentContainer/ContentContainer'
import React, { useState } from 'react'
import { usePageTitle } from '../../hooks/theme'
import ApplicationsTable from '../../components/ApplicationsTable/ApplicationsTable'
import ThesesTable from '../../components/ThesesTable/ThesesTable'
import ApplicationsProvider from '../../contexts/ApplicationsProvider/ApplicationsProvider'
import ThesesProvider from '../../contexts/ThesesProvider/ThesesProvider'
import { Button, Center, Space, Stack, Title } from '@mantine/core'
import { IApplication } from '../../requests/responses/application'
import ApplicationReviewModal from '../../components/ApplicationReviewModal/ApplicationReviewModal'
import ThesesGanttChart from '../../components/ThesesGanttChart/ThesesGanttChart'
import { useHasGroupAccess } from '../../hooks/authentication'
import { Link } from 'react-router-dom'

const DashboardPage = () => {
  usePageTitle('Dashboard')

  const [application, setApplication] = useState<IApplication>()

  const managementAccess = useHasGroupAccess('admin', 'supervisor', 'advisor')

  return (
    <ContentContainer>
      <Title order={1} mb='md'>
        Dashboard
      </Title>
      <ThesesProvider hideIfEmpty={!managementAccess}>
        <Title order={2}>My Theses</Title>
        {managementAccess && <ThesesGanttChart />}
        <ThesesTable />
        <Space mb='md' />
      </ThesesProvider>
      <ApplicationsProvider
        hideIfEmpty={true}
        emptyComponent={
          !managementAccess ? (
            <Stack>
              <Title order={2} mb='sm'>
                My Applications
              </Title>
              <Center>
                <Button my='md' component={Link} to='/applications/thesis'>
                  New Application
                </Button>
              </Center>
            </Stack>
          ) : undefined
        }
      >
        <Title order={2} mb='sm'>
          My Applications
        </Title>
        <ApplicationsTable
          onApplicationClick={setApplication}
          columns={['state', 'user', 'reviewed_at', 'created_at']}
        />
        <ApplicationReviewModal
          application={application}
          onClose={() => setApplication(undefined)}
          allowReviews={false}
        />
        <Space mb='md' />
      </ApplicationsProvider>
    </ContentContainer>
  )
}

export default DashboardPage
