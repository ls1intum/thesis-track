import { DateValue } from '@mantine/dates'

export function semesterToEnrollmentDate(semester: string | number): DateValue {
  if (!semester) {
    return null
  }

  return new Date(Date.now() - (Number(semester) * 1000 * 3600 * 24 * 365) / 2)
}

export function enrollmentDateToSemester(enrollmentDate: string): number {
  const date = new Date(enrollmentDate).getTime()

  return Math.floor((Date.now() - date) / ((1000 * 3600 * 24 * 365) / 2))
}
