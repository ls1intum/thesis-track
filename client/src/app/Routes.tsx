import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import LegacyApplicationReviewPage from '../pages/LegacyApplicationReviewPage/LegacyApplicationReviewPage'
import NotFoundPage from '../pages/NotFoundPage/NotFoundPage'
import {
  ApplicationFormAccessMode,
  LegacyThesisApplicationForm,
} from '../pages/LegacySubmitApplicationPage/LegacyThesisApplicationForm'
import ThesisOverviewPage from '../pages/ThesisOverviewPage/ThesisOverviewPage'
import DashboardPage from '../pages/DashboardPage/DashboardPage'
import LogoutPage from '../pages/LogoutPage/LogoutPage'
import MyInformationPage from '../pages/MyInformationPage/MyInformationPage'
import SubmitApplicationStepOnePage from '../pages/SubmitApplicationPage/SubmitApplicationStepOnePage'
import SubmitApplicationStepTwoPage from '../pages/SubmitApplicationPage/SubmitApplicationStepTwoPage'
import CreateTopicPage from '../pages/CreateTopicPage/CreateTopicPage'
import TopicPage from '../pages/TopicPage/TopicPage'
import ReviewApplicationPage from '../pages/ReviewApplicationPage/ReviewApplicationPage'
import ThesisPage from '../pages/ThesisPage/ThesisPage'
import SubmitProposalPage from '../pages/SubmitProposalPage/SubmitProposalPage'
import SubmitAssessmentPage from '../pages/SubmitAssessmentPage/SubmitAssessmentPage'
import LandingPage from '../pages/LandingPage/LandingPage'
import AuthenticatedArea from './layout/AuthenticatedArea/AuthenticatedArea'

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/dashboard' element={
          <AuthenticatedArea>
            <DashboardPage />
          </AuthenticatedArea>
        } />
        <Route path='/settings/my-information' element={
          <AuthenticatedArea>
            <MyInformationPage />
          </AuthenticatedArea>
        } />
        <Route path='/submit-application/pick-topic' element={
          <AuthenticatedArea>
            <SubmitApplicationStepOnePage />
          </AuthenticatedArea>
        } />
        <Route path='/submit-application/apply/:topic_id?' element={
          <AuthenticatedArea>
            <SubmitApplicationStepTwoPage />
          </AuthenticatedArea>
        } />
        <Route path='/topics/create' element={
          <AuthenticatedArea>
            <CreateTopicPage />
          </AuthenticatedArea>
        } />
        <Route path='/topics/edit/:topic_id' element={
          <AuthenticatedArea>
            <CreateTopicPage />
          </AuthenticatedArea>
        } />
        <Route path='/topics/:topic_id' element={
          <AuthenticatedArea requireAuthentication={false}>
            <TopicPage />
          </AuthenticatedArea>
        } />
        <Route
          path='/applications/thesis'
          element={<LegacyThesisApplicationForm accessMode={ApplicationFormAccessMode.STUDENT} />}
        />
        <Route path='/applications/:application_id?' element={
          <AuthenticatedArea collapseNavigation={true}>
            <ReviewApplicationPage />
          </AuthenticatedArea>
        } />
        <Route path='/theses' element={
          <AuthenticatedArea>
            <ThesisOverviewPage />
          </AuthenticatedArea>
        } />
        <Route path='/theses/:thesis_id' element={
          <AuthenticatedArea>
            <ThesisPage />
          </AuthenticatedArea>
        } />
        <Route path='/theses/:thesis_id/submit-proposal' element={
          <AuthenticatedArea>
            <SubmitProposalPage />
          </AuthenticatedArea>
        } />
        <Route path='/theses/:thesis_id/submit-assessment' element={
          <AuthenticatedArea>
            <SubmitAssessmentPage />
          </AuthenticatedArea>
        } />
        <Route path='/management/thesis-applications' element={
          <AuthenticatedArea>
            <LegacyApplicationReviewPage />
          </AuthenticatedArea>
        } />
        <Route path='/management/thesis-overview/:variant' element={
          <AuthenticatedArea>
            <ThesisOverviewPage />
          </AuthenticatedArea>
        } />
        <Route path='/logout' element={<LogoutPage />} />
        <Route path='/' element={<LandingPage />} />
        <Route path='*' element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRoutes
