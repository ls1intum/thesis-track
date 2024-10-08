import { Group, Stack, Text } from '@mantine/core'
import { usePageTitle } from '../../../../hooks/theme'
import { useLoggedInUser, useManagementAccess } from '../../../../hooks/authentication'
import ThesesTable from '../../../../components/ThesesTable/ThesesTable'
import ThesesProvider from '../../../../providers/ThesesProvider/ThesesProvider'
import React, { useEffect, useState } from 'react'
import { doRequest } from '../../../../requests/request'
import PageLoader from '../../../../components/PageLoader/PageLoader'
import NotificationToggleSwitch from './components/NotificationToggleSwitch/NotificationToggleSwitch'

const NotificationSettings = () => {
  usePageTitle('Notification Settings')

  const user = useLoggedInUser()
  const managementAccess = useManagementAccess()

  const [settings, setSettings] = useState<Array<{ name: string; email: string }>>()

  useEffect(() => {
    setSettings(undefined)

    return doRequest<Array<{ name: string; email: string }>>(
      '/v2/user-info/notifications',
      {
        method: 'GET',
        requiresAuth: true,
      },
      (res) => {
        if (res.ok) {
          setSettings(res.data)
        } else {
          setSettings([])
        }
      },
    )
  }, [user.userId])

  if (!settings) {
    return <PageLoader />
  }

  return (
    <Stack>
      {managementAccess && (
        <Stack>
          <Group>
            <Stack gap={2}>
              <Text size='sm'>New Applications</Text>
              <Text size='xs' c='dimmed'>
                Receive a summary email on every new application
              </Text>
            </Stack>
            <NotificationToggleSwitch
              name='new-applications'
              settings={settings}
              setSettings={setSettings}
              ml='auto'
            />
          </Group>
          <Group>
            <Stack gap={2}>
              <Text size='sm'>Application Review Reminder</Text>
              <Text size='xs' c='dimmed'>
                Receive a weekly reminder email if you have unreviewed applications
              </Text>
            </Stack>
            <NotificationToggleSwitch
              name='unreviewed-application-reminder'
              settings={settings}
              setSettings={setSettings}
              ml='auto'
            />
          </Group>
        </Stack>
      )}
      <Group>
        <Stack gap={2}>
          <Text size='sm'>Presentation Invitations</Text>
          <Text size='xs' c='dimmed'>
            Get invitations to public thesis presentations when scheduled
          </Text>
        </Stack>
        <NotificationToggleSwitch
          name='presentation-invitations'
          settings={settings}
          setSettings={setSettings}
          ml='auto'
        />
      </Group>
      <Group>
        <Stack gap={2}>
          <Text size='sm'>Thesis Comments</Text>
          <Text size='xs' c='dimmed'>
            Receive an email for every comment that is added to a thesis assigned to you
          </Text>
        </Stack>
        <NotificationToggleSwitch
          name='thesis-comments'
          settings={settings}
          setSettings={setSettings}
          ml='auto'
        />
      </Group>
      <ThesesProvider>
        <ThesesTable
          columns={['title', 'type', 'students', 'advisors', 'supervisors', 'actions']}
          extraColumns={{
            actions: {
              accessor: 'actions',
              title: 'Notifications',
              textAlign: 'center',
              noWrap: true,
              width: 120,
              render: (thesis) => (
                <Group
                  preventGrowOverflow={false}
                  justify='center'
                  onClick={(e) => e.stopPropagation()}
                >
                  <NotificationToggleSwitch
                    name={`thesis-${thesis.thesisId}`}
                    settings={settings}
                    setSettings={setSettings}
                  />
                </Group>
              ),
            },
          }}
        />
      </ThesesProvider>
    </Stack>
  )
}

export default NotificationSettings
