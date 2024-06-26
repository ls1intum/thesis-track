export enum ThesisState {
  proposal = 'PROPOSAL',
  active = 'ACTIVE',
  submitted = 'SUBMITTED',
  graded = 'GRADED',
  finished = 'FINISHED',
}

export const ThesisStateColor: Record<ThesisState, string> = {
  [ThesisState.proposal]: '#45aaf2',
  [ThesisState.active]: '#26de81',
  [ThesisState.submitted]: '#fc5c65',
  [ThesisState.graded]: '#fed330',
  [ThesisState.finished]: '#a55eea',
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
