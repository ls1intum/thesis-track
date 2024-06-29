import { MantineProvider } from '@mantine/core'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ApplicationSubmissionPage } from './student/ApplicationSubmission/ApplicationSubmissionPage'
import { Notifications } from '@mantine/notifications'
import { ApplicationFormAccessMode } from './student/form/ThesisApplicationForm'
import { ThesisApplicationForm } from './student/form/ThesisApplicationForm'
import { ManagementConsole } from './management/ManagementConsole'
import { ContextMenuProvider } from 'mantine-contextmenu'
import '../public/favicon.svg'
import { Fallback } from './utilities/Fallback/Fallback'

import '@mantine/core/styles.layer.css'
import '@mantine/dates/styles.layer.css'
import '@mantine/notifications/styles.css'
import '@mantine/tiptap/styles.css'
import '@mantine/dropzone/styles.css'
import 'mantine-contextmenu/styles.layer.css'
import 'mantine-datatable/styles.layer.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
})

export const App = (): JSX.Element => {
  return (
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools initialIsOpen={false} />
      <MantineProvider defaultColorScheme='auto'>
        <ContextMenuProvider>
          <Notifications limit={5} />
          <BrowserRouter>
            <Routes>
              <Route
                path='/management/thesis-applications/:applicationId?'
                element={<ManagementConsole />}
              />
              <Route
                path='/applications/thesis'
                element={
                  <ApplicationSubmissionPage
                    child={<ThesisApplicationForm accessMode={ApplicationFormAccessMode.STUDENT} />}
                  />
                }
              />
              <Route path='/' element={<Navigate replace to='/applications/thesis' />} />
              <Route path='*' element={<Fallback />} />
            </Routes>
          </BrowserRouter>
        </ContextMenuProvider>
      </MantineProvider>
    </QueryClientProvider>
  )
}

export default App
