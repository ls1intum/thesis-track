import React, { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import AuthenticatedArea from './layout/AuthenticatedArea/AuthenticatedArea'
import PageLoader from '../components/PageLoader/PageLoader'

const NotFoundPage = lazy(() => import('../pages/NotFoundPage/NotFoundPage'))
const PrivacyPage = lazy(() => import('../pages/PrivacyPage/PrivacyPage'))
const ImprintPage = lazy(() => import('../pages/ImprintPage/ImprintPage'))
const AboutPage = lazy(() => import('../pages/AboutPage/AboutPage'))
const ThesisOverviewPage = lazy(() => import('../pages/ThesisOverviewPage/ThesisOverviewPage'))
const DashboardPage = lazy(() => import('../pages/DashboardPage/DashboardPage'))
const LogoutPage = lazy(() => import('../pages/LogoutPage/LogoutPage'))
const SettingsPage = lazy(() => import('../pages/SettingsPage/SettingsPage'))
const ReplaceApplicationPage = lazy(
  () => import('../pages/ReplaceApplicationPage/ReplaceApplicationPage'),
)
const ManageTopicsPage = lazy(() => import('../pages/ManageTopicsPage/ManageTopicsPage'))
const TopicPage = lazy(() => import('../pages/TopicPage/TopicPage'))
const PresentationPage = lazy(() => import('../pages/PresentationPage/PresentationPage'))
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
            path='/management/thesis-applications/:applicationId?'
            element={<Navigate to='/applications' replace />}
          />
          <Route path='/applications/thesis' element={<Navigate to='/' replace />} />
          <Route
            path='/dashboard'
            element={
              <AuthenticatedArea>
                <DashboardPage />
              </AuthenticatedArea>
            }
          />
          <Route
            path='/settings/:tab?'
            element={
              <AuthenticatedArea>
                <SettingsPage />
              </AuthenticatedArea>
            }
          />
          <Route
            path='/submit-application/:topicId?'
            element={
              <AuthenticatedArea>
                <ReplaceApplicationPage />
              </AuthenticatedArea>
            }
          />
          <Route
            path='/edit-application/:applicationId'
            element={
              <AuthenticatedArea>
                <ReplaceApplicationPage />
              </AuthenticatedArea>
            }
          />
          <Route
            path='/presentations/:presentationId'
            element={
              <AuthenticatedArea requireAuthentication={false}>
                <PresentationPage />
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
          <Route path='/about' element={<AboutPage />} />
          <Route path='/imprint' element={<ImprintPage />} />
          <Route path='/privacy' element={<PrivacyPage />} />
          <Route path='/logout' element={<LogoutPage />} />
          <Route path='/' element={<LandingPage />} />
          <Route path='*' element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </Suspense>
  )
}

export default AppRoutes
