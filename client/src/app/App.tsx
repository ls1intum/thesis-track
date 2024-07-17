import React from 'react'
import { createTheme, MantineProvider } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import { ContextMenuProvider } from 'mantine-contextmenu'
import '../../public/favicon.svg'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import AppRoutes from './Routes'
import { GLOBAL_CONFIG } from '../config/global'

import '@mantine/core/styles.layer.css'
import '@mantine/dates/styles.layer.css'
import '@mantine/notifications/styles.css'
import '@mantine/tiptap/styles.css'
import '@mantine/dropzone/styles.css'
import 'mantine-contextmenu/styles.layer.css'
import 'mantine-datatable/styles.layer.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
})

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools initialIsOpen={false} />
      <MantineProvider defaultColorScheme='auto'>
        <ContextMenuProvider>
          <Notifications limit={5} />
          <AppRoutes />
        </ContextMenuProvider>
      </MantineProvider>
    </QueryClientProvider>
  )
}

export default App
