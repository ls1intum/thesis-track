import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ApplicationState, IApplication } from '../../requests/responses/application'
import { doRequest } from '../../requests/request'
import ApplicationsProvider from '../../contexts/ApplicationsProvider/ApplicationsProvider'
import { Grid, Text, Center } from '@mantine/core'
import ApplicationsSidebar from './components/ApplicationsSidebar/ApplicationsSidebar'
import ApplicationReviewBody from './components/ApplicationReviewBody/ApplicationReviewBody'

const ReviewApplicationPage = () => {
  const navigate = useNavigate()
  const { applicationId } = useParams<{ applicationId: string }>()

  const [application, setApplication] = useState<IApplication>()

  useEffect(() => {
    if (applicationId && applicationId !== application?.applicationId) {
      return doRequest<IApplication>(
        `/v2/applications/${applicationId}`,
        {
          method: 'GET',
          requiresAuth: true,
        },
        (res) => {
          if (res.ok) {
            setApplication(res.data)
          }
        },
      )
    }
  }, [applicationId, application])

  return (
    <ApplicationsProvider
      fetchAll={true}
      limit={20}
      defaultStates={[ApplicationState.NOT_ASSESSED]}
    >
      <Grid p='md'>
        <Grid.Col span={{ md: 3 }}>
          <ApplicationsSidebar
            selected={application}
            onSelect={(newApplication) => {
              navigate(`/applications/${newApplication.applicationId}`, {
                replace: true,
              })

              setApplication(newApplication)
            }}
          />
        </Grid.Col>
        <Grid.Col span={{ md: 9 }}>
          {application ? (
            <ApplicationReviewBody application={application} onChange={setApplication} />
          ) : (
            <Center h='80vh'>
              <Text ta='center' fw='bold'>
                No Application selected
              </Text>
            </Center>
          )}
        </Grid.Col>
      </Grid>
    </ApplicationsProvider>
  )
}

export default ReviewApplicationPage
