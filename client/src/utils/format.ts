import { ILightUser } from '../requests/responses/user'

interface IFormatDateOptions {
  includeHours: boolean
}

export function formatDate(
  date: string | Date | undefined | null,
  options: Partial<IFormatDateOptions>,
): string {
  const { includeHours }: IFormatDateOptions = {
    includeHours: true,
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
    hour: includeHours ? 'numeric' : undefined,
    minute: includeHours ? 'numeric' : undefined,
  })
}

export function formatUser(user: ILightUser) {
  return `${user.firstName} ${user.lastName} (${user.universityId})`
}
