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
  type: string
  visibility: string
  infoText: string
  abstractText: string
  state: ThesisState
  applicationId: string | null
  startDate: string | null
  endDate: string | null
  createdAt: string
  students: ILightUser[]
  advisors: ILightUser[]
  supervisors: ILightUser[]
  files: {
    thesis: string | null
    presentation: string | null
    proposal: string | null
  }
  assessment: null | {
    summary: string
    positives: string
    negatives: string
    gradeSuggestion: string
    createdAt: string
    createdBy: ILightUser
  }
  proposal: null | {
    createdAt: string
    createdBy: ILightUser
    approvedAt: string | null
    approvedBy: ILightUser | null
  }
  grade: null | {
    finalGrade: string
    feedback: string
  }
  presentations: Array<{
    presentationId: string
    type: string
    location: string | null
    streamUrl: string | null
    scheduledAt: string
    createdAt: string
    createdBy: ILightUser
  }>
  states: Array<{
    state: ThesisState
    startedAt: string
    endedAt: string
  }>
}

export interface IThesisComment {
  commentId: string
  message: string
  hasFile: boolean
  createdAt: string
  createdBy: ILightUser
}

export interface IPublishedThesis {
  thesisId: string
  title: string
  type: string
  startDate: string | null
  endDate: string | null
  abstractText: string
  students: ILightUser[]
  advisors: ILightUser[]
  supervisors: ILightUser[]
}
