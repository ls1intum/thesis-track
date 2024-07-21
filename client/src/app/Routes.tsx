import React, { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import AuthenticatedArea from './layout/AuthenticatedArea/AuthenticatedArea'
import { LegacyApplicationFormAccessMode } from '../legacy/interfaces/application'
import { Center, Loader } from '@mantine/core'

const LegacyThesisApplicationForm = lazy(
  () => import('../pages/LegacySubmitApplicationPage/LegacyThesisApplicationForm'),
)
const LegacyApplicationReviewPage = lazy(
  () => import('../pages/LegacyApplicationReviewPage/LegacyApplicationReviewPage'),
)
const NotFoundPage = lazy(() => import('../pages/NotFoundPage/NotFoundPage'))
const ThesisOverviewPage = lazy(() => import('../pages/ThesisOverviewPage/ThesisOverviewPage'))
const DashboardPage = lazy(() => import('../pages/DashboardPage/DashboardPage'))
const LogoutPage = lazy(() => import('../pages/LogoutPage/LogoutPage'))
const MyInformationPage = lazy(() => import('../pages/MyInformationPage/MyInformationPage'))
const SubmitApplicationStepOnePage = lazy(
  () => import('../pages/SubmitApplicationPage/SubmitApplicationStepOnePage'),
)
const SubmitApplicationStepTwoPage = lazy(
  () => import('../pages/SubmitApplicationPage/SubmitApplicationStepTwoPage'),
)
const CreateTopicPage = lazy(() => import('../pages/CreateTopicPage/CreateTopicPage'))
const TopicPage = lazy(() => import('../pages/TopicPage/TopicPage'))
const ReviewApplicationPage = lazy(
  () => import('../pages/ReviewApplicationPage/ReviewApplicationPage'),
)
const ThesisPage = lazy(() => import('../pages/ThesisPage/ThesisPage'))
const SubmitProposalPage = lazy(() => import('../pages/SubmitProposalPage/SubmitProposalPage'))
const SubmitAssessmentPage = lazy(
  () => import('../pages/SubmitAssessmentPage/SubmitAssessmentPage'),
)
const LandingPage = lazy(() => import('../pages/LandingPage/LandingPage'))

const AppRoutes = () => {
  return (
    <Suspense
      fallback={
        <Center styles={{ root: { height: '100vh' } }}>
          <Loader />
        </Center>
      }
    >
      <BrowserRouter>
        <Routes>
          <Route
            path='/dashboard'
            element={
              <AuthenticatedArea>
                <DashboardPage />
              </AuthenticatedArea>
            }
          />
          <Route
            path='/settings/my-information'
            element={
              <AuthenticatedArea>
                <MyInformationPage />
              </AuthenticatedArea>
            }
          />
          <Route
            path='/submit-application/pick-topic'
            element={
              <AuthenticatedArea>
                <SubmitApplicationStepOnePage />
              </AuthenticatedArea>
            }
          />
          <Route
            path='/submit-application/apply/:topic_id?'
            element={
              <AuthenticatedArea>
                <SubmitApplicationStepTwoPage />
              </AuthenticatedArea>
            }
          />
          <Route
            path='/topics/create'
            element={
              <AuthenticatedArea requiredRoles={['admin', 'advisor']}>
                <CreateTopicPage />
              </AuthenticatedArea>
            }
          />
          <Route
            path='/topics/edit/:topic_id'
            element={
              <AuthenticatedArea requiredRoles={['admin', 'advisor']}>
                <CreateTopicPage />
              </AuthenticatedArea>
            }
          />
          <Route
            path='/topics/:topic_id'
            element={
              <AuthenticatedArea requireAuthentication={false}>
                <TopicPage />
              </AuthenticatedArea>
            }
          />
          <Route
            path='/applications/thesis'
            element={
              <LegacyThesisApplicationForm accessMode={LegacyApplicationFormAccessMode.STUDENT} />
            }
          />
          <Route
            path='/applications/:application_id?'
            element={
              <AuthenticatedArea collapseNavigation={true} requiredRoles={['admin', 'advisor']}>
                <ReviewApplicationPage />
              </AuthenticatedArea>
            }
          />
          <Route
            path='/theses'
            element={
              <AuthenticatedArea requiredRoles={['admin']}>
                <ThesisOverviewPage />
              </AuthenticatedArea>
            }
          />
          <Route
            path='/theses/:thesis_id'
            element={
              <AuthenticatedArea>
                <ThesisPage />
              </AuthenticatedArea>
            }
          />
          <Route
            path='/theses/:thesis_id/submit-proposal'
            element={
              <AuthenticatedArea>
                <SubmitProposalPage />
              </AuthenticatedArea>
            }
          />
          <Route
            path='/theses/:thesis_id/submit-assessment'
            element={
              <AuthenticatedArea>
                <SubmitAssessmentPage />
              </AuthenticatedArea>
            }
          />
          <Route
            path='/management/thesis-applications'
            element={
              <AuthenticatedArea requiredRoles={['admin', 'advisor']}>
                <LegacyApplicationReviewPage />
              </AuthenticatedArea>
            }
          />
          <Route
            path='/management/thesis-overview'
            element={
              <AuthenticatedArea requiredRoles={['admin']}>
                <ThesisOverviewPage />
              </AuthenticatedArea>
            }
          />
          <Route path='/logout' element={<LogoutPage />} />
          <Route path='/' element={<LandingPage />} />
          <Route path='*' element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </Suspense>
  )
}

export default AppRoutes
