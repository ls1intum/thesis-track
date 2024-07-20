import { notifications } from '@mantine/notifications'
import { LegacyThesisAdvisor, LegacyThesisApplication } from '../interfaces/thesisApplication'
import { LegacyApplicationStatus } from '../interfaces/application'
import { IRequestFunctions } from '../../requests/hooks'

export const postThesisApplicationAssessment = async (
  doRequest: IRequestFunctions['doRequest'],
  thesisApplicationId: string,
  assessment: { status: keyof typeof LegacyApplicationStatus; assessmentComment: string },
): Promise<LegacyThesisApplication | undefined> => {
  try {
    return (
      await doRequest<LegacyThesisApplication>(`/api/thesis-applications/${thesisApplicationId}/assessment`, {
        method: 'POST',
        requiresAuth: true,
        data: {...assessment},
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
  doRequest: IRequestFunctions['doRequest'],
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
          notifyStudent
        }
      }
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
  doRequest: IRequestFunctions['doRequest'],
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
        }
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

export const postThesisApplicationThesisAdvisorAssignment = async (
  doRequest: IRequestFunctions['doRequest'],
  thesisApplicationId: string,
  thesisAdvisorId: string,
): Promise<LegacyThesisApplication | undefined> => {
  try {
    return (
      await doRequest<LegacyThesisApplication>(
        `/api/thesis-applications/${thesisApplicationId}/thesis-advisor/${thesisAdvisorId}`,
        {
          method: 'POST',
          requiresAuth: true
        },
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
  doRequest: IRequestFunctions['doRequest'],
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
  doRequest: IRequestFunctions['doRequest'],
  thesisApplicationId: string,
): Promise<Blob | undefined> => {
  try {
    const response = await doRequest<Blob>(`/api/thesis-applications/${thesisApplicationId}/cv`, {
      method: 'GET',
      requiresAuth: true,
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
  doRequest: IRequestFunctions['doRequest'],
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
