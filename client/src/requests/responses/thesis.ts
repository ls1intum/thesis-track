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

export interface IThesisPresentation {
  thesisId: string
  presentationId: string
  state: string
  type: string
  visibility: string
  location: string | null
  streamUrl: string | null
  language: string
  scheduledAt: string
  createdAt: string
  createdBy: ILightUser
}

export interface IThesis {
  thesisId: string
  title: string
  type: string
  visibility: string
  keywords: string[]
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
  files: Array<{
    fileId: string
    type: string
    filename: string
    uploadName: string
    uploadedAt: string
    uploadedBy: ILightUser
  }>
  assessment: null | {
    summary: string
    positives: string
    negatives: string
    gradeSuggestion: string
    createdAt: string
    createdBy: ILightUser
  }
  proposals: Array<{
    proposalId: string
    filename: string
    createdAt: string
    createdBy: ILightUser
    approvedAt: string | null
    approvedBy: ILightUser | null
  }>
  feedback: Array<{
    feedbackId: string
    type: string
    feedback: string
    requestedBy: ILightUser
    requestedAt: string
    completedAt: string | null
  }>
  grade: null | {
    finalGrade: string
    feedback: string
  }
  presentations: IThesisPresentation[]
  states: Array<{
    state: ThesisState
    startedAt: string
    endedAt: string
  }>
}

export interface IThesisComment {
  commentId: string
  message: string
  filename: string | null
  uploadName: string | null
  createdAt: string
  createdBy: ILightUser
}

export interface IPublishedThesis {
  thesisId: string
  state: ThesisState
  title: string
  type: string
  startDate: string | null
  endDate: string | null
  abstractText: string
  students: ILightUser[]
  advisors: ILightUser[]
  supervisors: ILightUser[]
}

export interface IPublishedPresentation {
  thesisId: string
  presentationId: string
  state: string
  type: string
  visibility: string
  location: string | null
  streamUrl: string | null
  language: string
  scheduledAt: string
  thesis: IPublishedThesis
}

export function isThesis(thesis: any): thesis is IThesis {
  return thesis.thesisId && !!thesis.states
}

export function isThesisPresentation(presentation: any): presentation is IThesisPresentation {
  return presentation.presentationId && !presentation.thesis
}

export function isPublishedPresentation(presentation: any): presentation is IPublishedPresentation {
  return presentation.presentationId && presentation.thesis
}
