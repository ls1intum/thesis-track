export interface IUpdateUserInformationPayload {
  matriculationNumber: string
  firstName: string
  lastName: string
  gender: string
  nationality: string
  email: string
  studyDegree: string
  studyProgram: string
  enrolledAt: Date | null
  specialSkills: string
  interests: string
  projects: string
  customData: Record<string, string>
}
