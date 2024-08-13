import { ILightUser } from './user'

export interface ITopic {
  topicId: string
  title: string
  problemDescription: string
  goals: string
  references: string
  closedAt: string | null
  updatedAt: string
  createdAt: string
  createdBy: ILightUser
  advisors: ILightUser[]
  supervisors: ILightUser[]
}
