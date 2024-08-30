import { ApiResponse } from './request'

export function getApiResponseErrorMessage(response: ApiResponse<unknown>) {
  let message

  if (response.ok) {
    message = 'Error thrown on successful response'
  } else if (response.status === 1000) {
    message = 'Failed to send request to the server'
  } else if (response.status === 400) {
    message = 'Server could not parse your request'
  } else if (response.status === 401) {
    message = 'You are not authenticated. Please try refreshing the page'
  } else if (response.status === 403) {
    message = 'You are not authorized to access this resource'
  } else if (response.status === 404) {
    message = 'Requested resource not found'
  } else if (response.status === 404) {
    message = 'Requested resource not found'
  } else if (response.status === 409) {
    message = 'Resource already exists'
  } else if (response.status === 501) {
    message = 'Endpoint not implemented yet'
  } else {
    message = 'Unknown error'
  }

  if (!response.ok && response.error) {
    message += `: ${response.error.message}`
  }

  return message
}

export class ApiError extends Error {
  name = 'ApiError'

  constructor(response: ApiResponse<unknown>) {
    super(getApiResponseErrorMessage(response))
  }
}
