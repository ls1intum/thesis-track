import { ILightUser } from '../requests/responses/user'

interface IFormatDateOptions {
  withTime: boolean
}

export function formatDate(
  date: string | Date | undefined | null,
  options: Partial<IFormatDateOptions> = {},
): string {
  const { withTime }: IFormatDateOptions = {
    withTime: true,
    ...options,
  }

  if (typeof date === 'undefined' || date === null) {
    return ''
  }

  const item = new Date(date)

  return item.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: withTime ? 'numeric' : undefined,
    minute: withTime ? 'numeric' : undefined,
  })
}

export function formatUser(user: ILightUser) {
  return `${user.firstName} ${user.lastName} (${user.universityId})`
}
