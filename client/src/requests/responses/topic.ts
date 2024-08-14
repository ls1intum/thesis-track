import { ILightUser } from './user'

export interface ITopic {
  topicId: string
  title: string
  problemStatement: string
  goals: string
  references: string
  requiredDegree: string | null
  closedAt: string | null
  updatedAt: string
  createdAt: string
  createdBy: ILightUser
  advisors: ILightUser[]
  supervisors: ILightUser[]
}
