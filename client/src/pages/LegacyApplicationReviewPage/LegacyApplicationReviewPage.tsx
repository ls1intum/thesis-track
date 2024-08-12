import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { doRequest } from '../../requests/request'
import { ApplicationState, IApplication } from '../../requests/responses/application'
import ContentContainer from '../../app/layout/ContentContainer/ContentContainer'
import ApplicationsFilters from '../../components/ApplicationsFilters/ApplicationsFilters'
import ApplicationsTable from '../../components/ApplicationsTable/ApplicationsTable'
import ApplicationsProvider from '../../contexts/ApplicationsProvider/ApplicationsProvider'
import { Space, Title } from '@mantine/core'
import ApplicationModal from '../../components/ApplicationModal/ApplicationModal'

const LegacyApplicationReviewPage = () => {
  const navigate = useNavigate()
  const { applicationId } = useParams<{ applicationId: string }>()

  const [openedApplication, setOpenedApplication] = useState<IApplication>()

  useEffect(() => {
    if (applicationId && applicationId !== openedApplication?.applicationId) {
      return doRequest<IApplication>(
        `/v2/applications/${applicationId}`,
        {
          method: 'GET',
          requiresAuth: true,
        },
        (res) => {
          if (res.ok) {
            setOpenedApplication(res.data)
          }
        },
      )
    }
  }, [applicationId, openedApplication])

  return (
    <ContentContainer>
      <ApplicationsProvider
        fetchAll={true}
        limit={20}
        defaultStates={[ApplicationState.NOT_ASSESSED]}
      >
        <Title mb='md'>Review Applications</Title>
        <ApplicationsFilters />
        <Space my='md' />
        <ApplicationsTable
          onApplicationClick={(application) => {
            navigate(`/management/thesis-applications/${application.applicationId}`, {
              replace: true,
            })

            setOpenedApplication(application)
          }}
        />
        <ApplicationModal
          application={openedApplication}
          onClose={() => {
            navigate('/management/thesis-applications', { replace: true })

            setOpenedApplication(undefined)
          }}
          allowReviews={true}
          onUpdate={(newApplication) => {
            setOpenedApplication(newApplication)
          }}
        />
      </ApplicationsProvider>
    </ContentContainer>
  )
}

export default LegacyApplicationReviewPage
