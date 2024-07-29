export interface IUser {
  userId: string
  universityId: string
  matriculationNumber: string | null
  email: string | null
  firstName: string | null
  lastName: string | null
  gender: string | null
  nationality: string | null
  isExchangeStudent: boolean | null
  focusTopics: string[] | null
  researchAreas: string[] | null
  studyDegree: string | null
  studyProgram: string | null
  projects: string | null
  interests: string | null
  specialSkills: string | null
  enrolledAt: string | null
  updatedAt: string
  joinedAt: string
  groups: string[]
  hasCv: boolean
  hasDegreeReport: boolean
  hasExaminationReport: boolean
}

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