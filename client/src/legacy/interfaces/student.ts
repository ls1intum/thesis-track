export enum LegacyStudyDegree {
  BACHELOR = 'Bachelor',
  MASTER = 'Master',
}

export enum LegacyStudyProgram {
  COMPUTER_SCIENCE = 'Computer Science',
  INFORMATION_SYSTEMS = 'Information Systems',
  GAMES_ENGINEERING = 'Games Engineering',
  MANAGEMENT_AND_TECHNOLOGY = 'Management and Technology',
  OTHER = 'Other',
}

export enum LegacyGender {
  MALE = 'Male',
  FEMALE = 'Female',
  OTHER = 'Other',
  PREFER_NOT_TO_SAY = 'Prefer not to say',
}

export interface LegacyStudent {
  id: string
  tumId?: string
  matriculationNumber?: string
  isExchangeStudent: boolean
  firstName?: string
  lastName?: string
  gender?: keyof typeof LegacyGender
  nationality?: string
  email?: string
  suggestedAsCoach: boolean
  suggestedAsTutor: boolean
  blockedByPm: boolean
  reasonForBlockedByPm: string
}
