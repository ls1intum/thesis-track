import { ThesisState } from '../../../requests/responses/thesis'

export const ThesisStateColor: Record<ThesisState, string> = {
  [ThesisState.PROPOSAL]: '#45aaf2',
  [ThesisState.WRITING]: '#26de81',
  [ThesisState.SUBMITTED]: '#fc5c65',
  [ThesisState.ASSESSED]: '#fed330',
  [ThesisState.GRADED]: '#fed330',
  [ThesisState.FINISHED]: '#a55eea',
  [ThesisState.DROPPED_OUT]: '#a55eea',
}

export interface IThesisProgressChartDataElement {
  advisor: string
  student: string
  topic: string
  state: ThesisState
  started_at: number
  ended_at: number | null
  timeline: Array<{
    started_at: number
    state: ThesisState
  }>
}
