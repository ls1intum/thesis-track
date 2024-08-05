import { ILightUser } from './user'

export enum ThesisState {
  PROPOSAL = 'PROPOSAL',
  WRITING = 'WRITING',
  SUBMITTED = 'SUBMITTED',
  ASSESSED = 'ASSESSED',
  GRADED = 'GRADED',
  FINISHED = 'FINISHED',
  DROPPED_OUT = 'DROPPED_OUT',
}

export interface IThesis {
  thesisId: string
  title: string
  visibility: string
  infoText: string
  abstractText: string
  state: ThesisState
  applicationId: string | null
  hasThesisFile: boolean
  hasPresentationFile: boolean
  finalGrade: string | null
  startDate: string | null
  endDate: string | null
  createdAt: string
  students: ILightUser[]
  advisors: ILightUser[]
  supervisors: ILightUser[]
  assessment: null
  proposal: null
  states: Array<{
    state: ThesisState
    startedAt: string
    endedAt: string | null
  }>
}
