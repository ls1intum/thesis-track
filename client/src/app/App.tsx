import React from 'react'
import { Button, createTheme, MantineProvider } from '@mantine/core'
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

import * as buttonClasses from './Buttons.module.css'

const theme = createTheme({
  respectReducedMotion: false,
  colors: {
    'pale-purple': [
      '#f2f0ff',
      '#e0dff2',
      '#bfbdde',
      '#9b98ca',
      '#7d79ba',
      '#6a65b0',
      '#605bac',
      '#504c97',
      '#464388',
      '#3b3979',
    ],
  },
  primaryColor: 'pale-purple',
  primaryShade: 7,
  components: {
    Button: Button.extend({
      classNames: buttonClasses,
    }),
  },
})

const App = () => {
  return (
    <MantineProvider defaultColorScheme='dark' theme={theme}>
      <AuthenticationProvider>
        <AppRoutes />
        <Notifications limit={5} position='top-right' />
      </AuthenticationProvider>
    </MantineProvider>
  )
}

export default App
