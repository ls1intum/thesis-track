export interface LegacyStudent {
  id: string
  tumId?: string
  matriculationNumber?: string
  isExchangeStudent: boolean
  firstName?: string
  lastName?: string
  gender?: string
  nationality?: string
  email?: string
  suggestedAsCoach: boolean
  suggestedAsTutor: boolean
  blockedByPm: boolean
  reasonForBlockedByPm: string
}
