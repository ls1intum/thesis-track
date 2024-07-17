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

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/dashboard' element={<DashboardPage />} />
        <Route path='/logout' element={<LogoutPage />} />
        <Route path='/settings/my-information' element={<MyInformationPage />} />
        <Route path='/submit-application/pick-topic' element={<SubmitApplicationStepOnePage />} />
        <Route
          path='/submit-application/apply/:topic_id?'
          element={<SubmitApplicationStepTwoPage />}
        />
        <Route path='/topics/create' element={<CreateTopicPage />} />
        <Route path='/topics/edit/:topic_id' element={<CreateTopicPage />} />
        <Route path='/topics/:topic_id' element={<TopicPage />} />
        <Route path='/applications/:application_id?' element={<ReviewApplicationPage />} />
        <Route path='/theses' element={<ThesisOverviewPage />} />
        <Route path='/theses/:thesis_id' element={<ThesisPage />} />
        <Route path='/theses/:thesis_id/submit-proposal' element={<SubmitProposalPage />} />
        <Route path='/theses/:thesis_id/submit-assessment' element={<SubmitAssessmentPage />} />
        <Route
          path='/management/thesis-applications/:applicationId?'
          element={<LegacyApplicationReviewPage />}
        />
        <Route path='/management/thesis-overview/:variant' element={<ThesisOverviewPage />} />
        <Route
          path='/applications/thesis'
          element={<LegacyThesisApplicationForm accessMode={ApplicationFormAccessMode.STUDENT} />}
        />
        <Route path='/' element={<LandingPage />} />
        <Route path='*' element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRoutes
