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

export function formatUser(user: ILightUser) {
  return `${user.firstName} ${user.lastName} (${user.universityId})`
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
