import { IUpdateUserInformationPayload } from './user'

export interface ILegacyCreateApplicationPayload extends IUpdateUserInformationPayload {
  universityId: string
  motivation: string
  thesisTitle: string
  desiredStartDate: Date
}
