import React from 'react'
import { MantineProvider } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import '../../public/favicon.svg'
import AppRoutes from './Routes'
import AuthenticationProvider from '../contexts/AuthenticationContext/AuthenticationProvider'

import '@mantine/core/styles.layer.css'
import '@mantine/dates/styles.layer.css'
import '@mantine/notifications/styles.css'
import '@mantine/tiptap/styles.css'
import '@mantine/dropzone/styles.css'
import 'mantine-datatable/styles.layer.css'

import './styles.scss'

const App = () => {
  return (
    <MantineProvider defaultColorScheme='auto'>
      <AuthenticationProvider>
        <AppRoutes />
        <Notifications limit={5} />
      </AuthenticationProvider>
    </MantineProvider>
  )
}

export default App
