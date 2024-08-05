import { ThesisState } from '../requests/responses/thesis'
import { ApplicationState } from '../requests/responses/application'

export const ThesisStateColor: Record<ThesisState, string> = {
  [ThesisState.PROPOSAL]: '#45aaf2',
  [ThesisState.WRITING]: '#26de81',
  [ThesisState.SUBMITTED]: '#fc5c65',
  [ThesisState.ASSESSED]: '#fed330',
  [ThesisState.GRADED]: '#fed330',
  [ThesisState.FINISHED]: '#a55eea',
  [ThesisState.DROPPED_OUT]: '#a55eea',
}

export const ApplicationStateColor: Record<ApplicationState, string> = {
  [ApplicationState.ACCEPTED]: '#26de81',
  [ApplicationState.REJECTED]: '#fc5c65',
  [ApplicationState.NOT_ASSESSED]: '#6c6c6c',
}
