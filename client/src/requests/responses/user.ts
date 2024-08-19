export interface ILightUser {
  userId: string
  universityId: string
  matriculationNumber: string | null
  firstName: string | null
  lastName: string | null
  studyDegree: string | null
  studyProgram: string | null
  joinedAt: string
  groups: string[]
}

export interface IUser extends ILightUser {
  email: string | null
  gender: string | null
  nationality: string | null
  isExchangeStudent: boolean | null
  projects: string | null
  interests: string | null
  specialSkills: string | null
  enrolledAt: string | null
  updatedAt: string
  hasCv: boolean
  hasDegreeReport: boolean
  hasExaminationReport: boolean
}
