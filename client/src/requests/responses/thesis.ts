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
