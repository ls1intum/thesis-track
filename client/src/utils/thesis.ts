import { IPublishedThesis, IThesis, ThesisState } from '../requests/responses/thesis'
import { ILightUser } from '../requests/responses/user'

export function isThesisClosed(thesis: IThesis | IPublishedThesis) {
  return thesis.state === ThesisState.FINISHED || thesis.state === ThesisState.DROPPED_OUT
}

export function checkMinimumThesisState(thesis: IThesis, state: ThesisState) {
  return thesis.states.some((s) => s.state === state)
}

export function hasStudentAccess(
  thesis: IPublishedThesis | undefined,
  user: ILightUser | undefined,
) {
  if (!thesis) {
    return false
  }

  const users = [...thesis.students, ...thesis.advisors, ...thesis.supervisors]

  return !!(
    users.some((row) => row.userId === user?.userId) ||
    user?.groups.some((name) => name === 'admin')
  )
}

export function hasAdvisorAccess(
  thesis: IPublishedThesis | undefined,
  user: ILightUser | undefined,
) {
  if (!thesis) {
    return false
  }

  const users = [...thesis.advisors, ...thesis.supervisors]

  return !!(
    users.some((row) => row.userId === user?.userId) ||
    user?.groups.some((name) => name === 'admin')
  )
}

export function hasSupervisorAccess(
  thesis: IPublishedThesis | undefined,
  user: ILightUser | undefined,
) {
  return !!(
    thesis?.supervisors.some((row) => row.userId === user?.userId) ||
    user?.groups.some((name) => name === 'admin')
  )
}
