import React, { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import AuthenticatedArea from './layout/AuthenticatedArea/AuthenticatedArea'
import PageLoader from '../components/PageLoader/PageLoader'

const LegacyThesisApplicationForm = lazy(
  () => import('../pages/LegacySubmitApplicationPage/LegacySubmitApplicationPage'),
)
const LegacyApplicationReviewPage = lazy(
  () => import('../pages/LegacyApplicationReviewPage/LegacyApplicationReviewPage'),
)
const NotFoundPage = lazy(() => import('../pages/NotFoundPage/NotFoundPage'))
const ThesisOverviewPage = lazy(() => import('../pages/ThesisOverviewPage/ThesisOverviewPage'))
const DashboardPage = lazy(() => import('../pages/DashboardPage/DashboardPage'))
const LogoutPage = lazy(() => import('../pages/LogoutPage/LogoutPage'))
const MyInformationPage = lazy(() => import('../pages/MyInformationPage/MyInformationPage'))
const SubmitApplicationPage = lazy(
  () => import('../pages/SubmitApplicationPage/SubmitApplicationPage'),
)
const ManageTopicsPage = lazy(() => import('../pages/ManageTopicsPage/ManageTopicsPage'))
const TopicPage = lazy(() => import('../pages/TopicPage/TopicPage'))
const ReviewApplicationPage = lazy(
  () => import('../pages/ReviewApplicationPage/ReviewApplicationPage'),
)
const ThesisPage = lazy(() => import('../pages/ThesisPage/ThesisPage'))
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
            path='/submit-application/:topicId?'
            element={
              <AuthenticatedArea>
                <SubmitApplicationPage />
              </AuthenticatedArea>
            }
          />
          <Route
            path='/topics'
            element={
              <AuthenticatedArea requiredGroups={['admin', 'advisor', 'supervisor']}>
                <ManageTopicsPage />
              </AuthenticatedArea>
            }
          />
          <Route
            path='/topics/:topicId'
            element={
              <AuthenticatedArea requireAuthentication={false}>
                <TopicPage />
              </AuthenticatedArea>
            }
          />
          <Route path='/applications/thesis' element={<LegacyThesisApplicationForm />} />
          <Route
            path='/applications/:applicationId?'
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
              <AuthenticatedArea>
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
