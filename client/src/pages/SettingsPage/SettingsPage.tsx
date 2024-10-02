import ContentContainer from '../../app/layout/ContentContainer/ContentContainer'
import React from 'react'
import { Space, Tabs } from '@mantine/core'
import { EnvelopeOpen, User } from 'phosphor-react'
import MyInformation from './components/MyInformation/MyInformation'
import NotificationSettings from './components/NotificationSettings/NotificationSettings'
import { useNavigate, useParams } from 'react-router-dom'

const SettingsPage = () => {
  const { tab } = useParams<{ tab: string }>()

  const navigate = useNavigate()

  const value = tab || 'my-information'

  return (
    <ContentContainer>
      <Tabs value={value} onChange={(newValue) => navigate(`/settings/${newValue}`)}>
        <Tabs.List>
          <Tabs.Tab value='my-information' leftSection={<User />}>
            My Information
          </Tabs.Tab>
          <Tabs.Tab value='notifications' leftSection={<EnvelopeOpen />}>
            Notification Settings
          </Tabs.Tab>
        </Tabs.List>
        <Space my='md' />
        <Tabs.Panel value='my-information'>
          {value === 'my-information' && <MyInformation />}
        </Tabs.Panel>
        <Tabs.Panel value='notifications'>
          {value === 'notifications' && <NotificationSettings />}
        </Tabs.Panel>
      </Tabs>
    </ContentContainer>
  )
}

export default SettingsPage
