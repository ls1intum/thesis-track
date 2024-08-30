export interface ILightUser {
  userId: string
  universityId: string
  avatar: string | null
  matriculationNumber: string | null
  firstName: string | null
  lastName: string | null
  email: string | null
  studyDegree: string | null
  studyProgram: string | null
  joinedAt: string
  groups: string[]
}

export interface IUser extends ILightUser {
  gender: string | null
  nationality: string | null
  projects: string | null
  interests: string | null
  specialSkills: string | null
  enrolledAt: string | null
  updatedAt: string
  hasCv: boolean
  hasDegreeReport: boolean
  hasExaminationReport: boolean
}
