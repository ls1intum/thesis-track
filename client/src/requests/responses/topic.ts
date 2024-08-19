import { ILightUser } from './user'

export interface ITopic {
  topicId: string
  title: string
  type: string | null
  problemStatement: string
  goals: string
  references: string
  closedAt: string | null
  updatedAt: string
  createdAt: string
  createdBy: ILightUser
  advisors: ILightUser[]
  supervisors: ILightUser[]
}
