import { LegacyStudent } from './student'
import { LegacyApplicationStatus } from './application'

export interface LegacyThesisAdvisor {
  id?: string
  firstName: string
  lastName: string
  email: string
  tumId: string
}

export interface LegacyThesisApplication {
  id: string
  student: LegacyStudent
  studyProgram?: string
  studyDegree?: string
  currentSemester?: string
  start: string
  specialSkills: string
  researchAreas: string[]
  focusTopics: string[]
  motivation: string
  interests: string
  projects: string
  thesisTitle: string
  desiredThesisStart: Date
  examinationReportFilename?: string
  cvFilename?: string
  bachelorReportFilename?: string
  applicationStatus: keyof typeof LegacyApplicationStatus
  assessmentComment?: string
  createdAt?: Date
  thesisAdvisor?: LegacyThesisAdvisor
}
