import { notifications } from '@mantine/notifications'

export function showSimpleError(message: string) {
  notifications.show({
    color: 'red',
    autoClose: 5000,
    title: 'Error',
    message,
  })
}

export function showSimpleSuccess(message: string) {
  notifications.show({
    color: 'green',
    autoClose: 5000,
    title: 'Success',
    message,
  })
}
