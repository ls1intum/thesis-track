import React, { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import AuthenticatedArea from './layout/AuthenticatedArea/AuthenticatedArea'
import PageLoader from '../components/PageLoader/PageLoader'

const LegacyThesisApplicationForm = lazy(
  () => import('../pages/LegacySubmitApplicationPage/LegacyCreateApplicationForm'),
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
    <Suspense fallback={<PageLoader />}>
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
              <AuthenticatedArea requiredGroups={['admin', 'advisor', 'supervisor']}>
                <CreateTopicPage />
              </AuthenticatedArea>
            }
          />
          <Route
            path='/topics/edit/:topic_id'
            element={
              <AuthenticatedArea requiredGroups={['admin', 'advisor', 'supervisor']}>
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
          <Route path='/applications/thesis' element={<LegacyThesisApplicationForm />} />
          <Route
            path='/applications/:application_id?'
            element={
              <AuthenticatedArea
                collapseNavigation={true}
                requiredGroups={['admin', 'advisor', 'supervisor']}
              >
                <ReviewApplicationPage />
              </AuthenticatedArea>
            }
          />
          <Route
            path='/theses'
            element={
              <AuthenticatedArea requiredGroups={['admin', 'supervisor', 'advisor', 'student']}>
                <ThesisOverviewPage />
              </AuthenticatedArea>
            }
          />
          <Route
            path='/theses/:thesisId'
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
            path='/management/thesis-applications/:applicationId?'
            element={
              <AuthenticatedArea requiredGroups={['admin', 'advisor', 'supervisor']}>
                <LegacyApplicationReviewPage />
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
