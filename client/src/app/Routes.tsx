import React from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import ThesisManagementConsole from '../pages/ThesisManagementConsole/ThesisManagementConsole'
import NotFound from '../pages/NotFound/NotFound'
import {
  ApplicationFormAccessMode,
  ThesisApplicationForm,
} from '../pages/ThesisApplication/ThesisApplicationForm'
import ThesisOverview from '../pages/ThesisOverview/ThesisOverview'

const AppRoutes = (): JSX.Element => {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path='/management/thesis-applications/:applicationId?'
          element={<ThesisManagementConsole />}
        />
        <Route path='/management/thesis-overview' element={<ThesisOverview />} />
        <Route
          path='/applications/thesis'
          element={<ThesisApplicationForm accessMode={ApplicationFormAccessMode.STUDENT} />}
        />
        <Route path='/' element={<Navigate replace to='/applications/thesis' />} />
        <Route path='*' element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRoutes
