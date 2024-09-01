import { ILightUser } from '../requests/responses/user'
import { ThesisState } from '../requests/responses/thesis'
import { ApplicationState } from '../requests/responses/application'

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

interface IFormatUserOptions {
  withUniversityId: boolean
}

export function formatUser(user: ILightUser, options: Partial<IFormatUserOptions> = {}) {
  const { withUniversityId } = {
    withUniversityId: true,
    ...options,
  }

  let text = `${user.firstName} ${user.lastName}`

  if (withUniversityId) {
    text += ` (${user.universityId})`
  }

  return text
}

export function formatUserFilename(user: ILightUser): string {
  return `${user.firstName} ${user.lastName}`.toLowerCase().replace(' ', '-')
}

export function formatUsersFilename(users: ILightUser[]) {
  return users.map((user) => formatUserFilename(user)).join('-')
}

export function formatThesisState(state: ThesisState) {
  const stateMap: Record<ThesisState, string> = {
    [ThesisState.PROPOSAL]: 'Proposal',
    [ThesisState.WRITING]: 'Writing',
    [ThesisState.SUBMITTED]: 'Submitted',
    [ThesisState.ASSESSED]: 'Assessed',
    [ThesisState.GRADED]: 'Graded',
    [ThesisState.FINISHED]: 'Finished',
    [ThesisState.DROPPED_OUT]: 'Dropped out',
  }

  return stateMap[state]
}

export function formatApplicationState(state: ApplicationState) {
  const stateMap: Record<ApplicationState, string> = {
    [ApplicationState.ACCEPTED]: 'Accepted',
    [ApplicationState.REJECTED]: 'Rejected',
    [ApplicationState.NOT_ASSESSED]: 'Not assessed',
  }

  return stateMap[state]
}

export function formatPresentationType(type: string) {
  if (type === 'INTERMEDIATE') {
    return 'Intermediate'
  }

  if (type === 'FINAL') {
    return 'Final'
  }

  return type
}

export function pluralize(word: string, count: number) {
  if (count === 1) {
    return word
  }

  return `${word}s`
}
