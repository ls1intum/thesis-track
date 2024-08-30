import { ILightUser, IUser } from './user'
import { ITopic } from './topic'

export enum ApplicationState {
  NOT_ASSESSED = 'NOT_ASSESSED',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
}

export interface IApplication {
  applicationId: string
  user: IUser
  topic: ITopic | null
  thesisTitle: string | null
  thesisType: string | null
  motivation: string
  state: ApplicationState
  desiredStartDate: string
  comment: string
  createdAt: string
  reviewedBy: ILightUser | null
  reviewedAt: string
}
