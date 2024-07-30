import React from 'react'
import { createTheme, MantineProvider } from '@mantine/core'
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

const theme = createTheme({
  colors: {
    'pale-purple': [
      "#f2f0ff",
      "#e0dff2",
      "#bfbdde",
      "#9b98ca",
      "#7d79ba",
      "#6a65b0",
      "#605bac",
      "#504c97",
      "#464388",
      "#3b3979"
    ]
  },
  primaryColor: 'pale-purple',
  primaryShade: 7
});

const App = () => {
  return (
    <MantineProvider defaultColorScheme='auto' theme={theme}>
      <AuthenticationProvider>
        <AppRoutes />
        <Notifications limit={5} />
      </AuthenticationProvider>
    </MantineProvider>
  )
}

export default App
