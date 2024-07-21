import { notifications } from '@mantine/notifications'
import { LegacyThesisApplication } from '../interfaces/thesisApplication'
import { LegacyApplicationStatus } from '../interfaces/application'
import { doRequest } from '../../requests/request'

export const postThesisApplicationAssessment = async (
  thesisApplicationId: string,
  assessment: { status: keyof typeof LegacyApplicationStatus; assessmentComment: string },
): Promise<LegacyThesisApplication | undefined> => {
  try {
    const response = await doRequest<LegacyThesisApplication>(
      `/api/thesis-applications/${thesisApplicationId}/assessment`,
      {
        method: 'POST',
        requiresAuth: true,
        data: { ...assessment },
      },
    )

    if (response.ok) {
      return response.data
    }
  } catch (err) {
    console.error(err)
  }

  notifications.show({
    color: 'red',
    autoClose: 10000,
    title: 'Error',
    message: `Could not assess thesis application.`,
  })

  return undefined
}

export const postThesisApplicatioAcceptance = async (
  thesisApplicationId: string,
  notifyStudent: boolean,
): Promise<LegacyThesisApplication | undefined> => {
  try {
    const response = await doRequest<LegacyThesisApplication>(
      `/api/thesis-applications/${thesisApplicationId}/accept`,
      {
        method: 'POST',
        requiresAuth: true,
        params: {
          notifyStudent,
        },
      },
    )

    if (response.ok) {
      notifications.show({
        color: 'green',
        autoClose: 5000,
        title: 'Success',
        message: notifyStudent
          ? `Sent an acceptance mail successfully.`
          : 'Application status updated successfully',
      })

      return response.data
    }
  } catch (err) {
    console.error(err)
  }

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

export const postThesisApplicationRejection = async (
  thesisApplicationId: string,
  notifyStudent: boolean,
): Promise<LegacyThesisApplication | undefined> => {
  try {
    const response = await doRequest<LegacyThesisApplication>(
      `/api/thesis-applications/${thesisApplicationId}/reject`,
      {
        method: 'POST',
        requiresAuth: true,
        params: {
          notifyStudent,
        },
      },
    )

    if (response.ok) {
      notifications.show({
        color: 'green',
        autoClose: 5000,
        title: 'Success',
        message: notifyStudent
          ? `Sent a rejection mail successfully.`
          : 'Application status updated successfully',
      })

      return response.data
    }
  } catch (err) {
    console.error(err)
  }

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

export const postThesisApplicationThesisAdvisorAssignment = async (
  thesisApplicationId: string,
  thesisAdvisorId: string,
): Promise<LegacyThesisApplication | undefined> => {
  try {
    const response = await doRequest<LegacyThesisApplication>(
      `/api/thesis-applications/${thesisApplicationId}/thesis-advisor/${thesisAdvisorId}`,
      {
        method: 'POST',
        requiresAuth: true,
      },
    )

    if (response.ok) {
      return response.data
    }
  } catch (err) {
    console.warn(err)
  }

  notifications.show({
    color: 'red',
    autoClose: 10000,
    title: 'Error',
    message: `Could not assign thesis advisor to thesis application.`,
  })

  return undefined
}

export const getThesisApplicationExaminationFile = async (
  thesisApplicationId: string,
): Promise<Blob | undefined> => {
  try {
    const response = await doRequest<Blob>(
      `/api/thesis-applications/${thesisApplicationId}/examination-report`,
      {
        method: 'GET',
        requiresAuth: true,
        responseType: 'blob',
      },
    )

    if (response.ok) {
      return new Blob([response.data], { type: 'application/pdf' })
    }
  } catch (err) {
    console.log(err)
  }

  notifications.show({
    color: 'red',
    autoClose: 10000,
    title: 'Error',
    message: `Could not load examination file.`,
  })

  return undefined
}

export const getThesisApplicationCvFile = async (
  thesisApplicationId: string,
): Promise<Blob | undefined> => {
  try {
    const response = await doRequest<Blob>(`/api/thesis-applications/${thesisApplicationId}/cv`, {
      method: 'GET',
      requiresAuth: true,
      responseType: 'blob',
    })

    if (response.ok) {
      return new Blob([response.data], { type: 'application/pdf' })
    }
  } catch (err) {
    console.error(err)
  }

  notifications.show({
    color: 'red',
    autoClose: 10000,
    title: 'Error',
    message: `Could not load cv file.`,
  })

  return undefined
}

export const getThesisApplicationBachelorReportFile = async (
  thesisApplicationId: string,
): Promise<Blob | undefined> => {
  try {
    const response = await doRequest<Blob>(
      `/api/thesis-applications/${thesisApplicationId}/bachelor-report`,
      {
        method: 'GET',
        requiresAuth: true,
        responseType: 'blob',
      },
    )

    if (response.ok) {
      return new Blob([response.data], { type: 'application/pdf' })
    }
  } catch (err) {
    console.error(err)
  }

  notifications.show({
    color: 'red',
    autoClose: 10000,
    title: 'Error',
    message: `Could not load bachelor report file.`,
  })

  return undefined
}
