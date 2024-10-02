import React, { Dispatch, SetStateAction, useState } from 'react'
import { Switch } from '@mantine/core'
import { doRequest } from '../../../../../../requests/request'
import { showSimpleError } from '../../../../../../utils/notification'
import { getApiResponseErrorMessage } from '../../../../../../requests/handler'
import { BoxProps } from '@mantine/core/lib/core'

interface INotificationToggleSwitchProps extends BoxProps {
  name: string
  settings: Array<{ name: string; email: string }>
  setSettings: Dispatch<SetStateAction<Array<{ name: string; email: string }> | undefined>>
}

const NotificationToggleSwitch = (props: INotificationToggleSwitchProps) => {
  const { name, settings, setSettings, ...other } = props

  const [loading, setLoading] = useState(false)

  const isChecked = !settings.some((setting) => setting.name === name && setting.email === 'none')

  const toggleSetting = async () => {
    setLoading(true)

    try {
      const response = await doRequest<Array<{ name: string; email: string }>>(
        '/v2/user-info/notifications',
        {
          method: 'PUT',
          requiresAuth: true,
          data: {
            name,
            email: isChecked ? 'none' : 'all',
          },
        },
      )

      if (response.ok) {
        setSettings(response.data)
      } else {
        showSimpleError(getApiResponseErrorMessage(response))
      }
    } finally {
      setLoading(false)
    }
  }

  return <Switch checked={isChecked} onChange={toggleSetting} disabled={loading} {...other} />
}

export default NotificationToggleSwitch
