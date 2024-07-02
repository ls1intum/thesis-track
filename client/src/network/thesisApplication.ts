import { notifications } from '@mantine/notifications'
import { axiosInstance, notAuthenticatedAxiosInstance } from './configService'
import { ThesisAdvisor, ThesisApplication } from '../interfaces/thesisApplication'
import { AxiosError } from 'axios'
import { ApplicationStatus } from '../interfaces/application'
import { Pageable } from '../interfaces/pageable'

export const getThesisApplications = async (
  page: number,
  limit: number,
  states?: string[],
  searchQuery?: string,
  sortBy?: string,
  sortOrder?: 'asc' | 'desc',
): Promise<Pageable<ThesisApplication>> => {
  try {
    return (
      await axiosInstance.get(`/api/thesis-applications`, {
        params: {
          page,
          limit,
          states: states?.join(',') ?? Object.keys(ApplicationStatus).join(','),
          searchQuery,
          sortBy,
          sortOrder,
        },
      })
    ).data
  } catch (err) {
    notifications.show({
      color: 'red',
      autoClose: 10000,
      title: 'Error',
      message: `Could not fetch thesis applications.`,
    })
    return {
      content: [],
      totalPages: 0,
      totalElements: 0,
      number: 0,
      size: 0,
      empty: true,
      first: true,
      last: true,
      numberOfElements: 0,
    }
  }
}

export const postThesisApplication = async ({
  application,
  examinationReport,
  cv,
  bachelorReport,
}: {
  application: ThesisApplication
  examinationReport: File
  cv: File
  bachelorReport?: File
}): Promise<ThesisApplication | undefined> => {
  try {
    const formData = new FormData()
    formData.append(
      'thesisApplication',
      new Blob([JSON.stringify(application)], { type: 'application/json' }),
    )
    formData.append('examinationReport', examinationReport)
    formData.append('cv', cv)
    if (bachelorReport) {
      formData.append('bachelorReport', bachelorReport)
    }
    const response = await notAuthenticatedAxiosInstance.post(
      `/api/thesis-applications`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    )
    if (response.status >= 200 && response.status < 300) {
      notifications.show({
        color: 'green',
        autoClose: 5000,
        title: 'Success',
        message: `Your application was successfully submitted!`,
      })
    }
    return response.data
  } catch (err) {
    if ((err as AxiosError)?.response?.status === 400) {
      notifications.show({
        color: 'red',
        autoClose: 10000,
        title: 'Error',
        message: `${((err as AxiosError)?.response?.data as string) ?? ''}`,
      })
    } else {
      notifications.show({
        color: 'red',
        autoClose: 10000,
        title: 'Error',
        message: `Failed to submit the application. Server responded with ${err as string}`,
      })
    }

    return undefined
  }
}

export const postThesisApplicationAssessment = async (
  thesisApplicationId: string,
  assessment: { status: keyof typeof ApplicationStatus; assessmentComment: string },
): Promise<ThesisApplication | undefined> => {
  try {
    return (
      await axiosInstance.post(`/api/thesis-applications/${thesisApplicationId}/assessment`, {
        ...assessment,
      })
    ).data
  } catch (err) {
    notifications.show({
      color: 'red',
      autoClose: 10000,
      title: 'Error',
      message: `Could not assess thesis application.`,
    })
    return undefined
  }
}

export const postThesisApplicatioAcceptance = async (
  thesisApplicationId: string,
  notifyStudent: boolean,
): Promise<ThesisApplication | undefined> => {
  try {
    const response = await axiosInstance.post(
      `/api/thesis-applications/${thesisApplicationId}/accept`,
      {},
      {
        params: {
          notifyStudent,
        },
      },
    )

    if (response) {
      notifications.show({
        color: 'green',
        autoClose: 5000,
        title: 'Success',
        message: notifyStudent
          ? `Sent an acceptance mail successfully.`
          : 'Application status updated successfully',
      })
    }

    return response.data
  } catch (err) {
    notifications.show({
      color: 'red',
      autoClose: 5000,
      title: 'Error',
      message: notifyStudent
        ? `Failed to send an acceptance mail.`
        : 'Failed to update application status',
    })
    return undefined
  }
}

export const postThesisApplicationRejection = async (
  thesisApplicationId: string,
  notifyStudent: boolean,
): Promise<ThesisApplication | undefined> => {
  try {
    const response = await axiosInstance.post(
      `/api/thesis-applications/${thesisApplicationId}/reject`,
      {},
      {
        params: {
          notifyStudent,
        },
      },
    )

    if (response) {
      notifications.show({
        color: 'green',
        autoClose: 5000,
        title: 'Success',
        message: notifyStudent
          ? `Sent a rejection mail successfully.`
          : 'Application status updated successfully',
      })
    }

    return response.data
  } catch (err) {
    notifications.show({
      color: 'red',
      autoClose: 5000,
      title: 'Error',
      message: notifyStudent
        ? `Failed to send a rejection mail.`
        : 'Failed to update application status',
    })
    return undefined
  }
}

export const getThesisAdvisors = async (): Promise<ThesisAdvisor[]> => {
  try {
    return (await axiosInstance.get(`/api/thesis-applications/thesis-advisors`)).data
  } catch (err) {
    notifications.show({
      color: 'red',
      autoClose: 10000,
      title: 'Error',
      message: `Could not fetch thesis advisors.`,
    })
    return []
  }
}

export const putThesisAdvisor = async (
  thesisAdvisor: ThesisAdvisor,
): Promise<ThesisAdvisor | undefined> => {
  try {
    return (await axiosInstance.put(`/api/thesis-applications/thesis-advisors`, thesisAdvisor)).data
  } catch (err) {
    notifications.show({
      color: 'red',
      autoClose: 10000,
      title: 'Error',
      message: `Could not add thesis advisor.`,
    })
    return undefined
  }
}

export const postThesisApplicationThesisAdvisorAssignment = async (
  thesisApplicationId: string,
  thesisAdvisorId: string,
): Promise<ThesisApplication | undefined> => {
  try {
    return (
      await axiosInstance.post(
        `/api/thesis-applications/${thesisApplicationId}/thesis-advisor/${thesisAdvisorId}`,
        {},
      )
    ).data
  } catch (err) {
    notifications.show({
      color: 'red',
      autoClose: 10000,
      title: 'Error',
      message: `Could not assign thesis advisor to thesis application.`,
    })
    return undefined
  }
}

export const getThesisApplicationExaminationFile = async (
  thesisApplicationId: string,
): Promise<Blob | undefined> => {
  try {
    const response = await axiosInstance.get(
      `/api/thesis-applications/${thesisApplicationId}/examination-report`,
      {
        responseType: 'blob',
      },
    )
    if (response) {
      return new Blob([response.data], { type: 'application/pdf' })
    }
    return undefined
  } catch (err) {
    notifications.show({
      color: 'red',
      autoClose: 10000,
      title: 'Error',
      message: `Could not load examination file.`,
    })
    return undefined
  }
}

export const getThesisApplicationCvFile = async (
  thesisApplicationId: string,
): Promise<Blob | undefined> => {
  try {
    const response = await axiosInstance.get(`/api/thesis-applications/${thesisApplicationId}/cv`, {
      responseType: 'blob',
    })
    if (response) {
      return new Blob([response.data], { type: 'application/pdf' })
    }
    return undefined
  } catch (err) {
    notifications.show({
      color: 'red',
      autoClose: 10000,
      title: 'Error',
      message: `Could not load cv file.`,
    })
    return undefined
  }
}

export const getThesisApplicationBachelorReportFile = async (
  thesisApplicationId: string,
): Promise<Blob | undefined> => {
  try {
    const response = await axiosInstance.get(
      `/api/thesis-applications/${thesisApplicationId}/bachelor-report`,
      {
        responseType: 'blob',
      },
    )
    if (response) {
      return new Blob([response.data], { type: 'application/pdf' })
    }
    return undefined
  } catch (err) {
    notifications.show({
      color: 'red',
      autoClose: 10000,
      title: 'Error',
      message: `Could not load bachelor report file.`,
    })
    return undefined
  }
}
