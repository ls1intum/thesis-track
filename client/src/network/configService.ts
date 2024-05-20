import axios from 'axios'

export const serverBaseUrl = `${process.env.REACT_APP_SERVER_HOST ?? 'http://localhost:8080'}`
export const keycloakUrl = `${process.env.REACT_APP_KEYCLOAK_HOST ?? 'http://localhost:8081'}`
export const keycloakRealmName = `${process.env.REACT_APP_KEYCLOAK_REALM_NAME ?? 'thesis-track'}`

export interface Patch {
  op: 'replace' | 'add' | 'remove' | 'copy'
  path: string
  value: string
}

const authenticatedAxiosInstance = axios.create({
  baseURL: serverBaseUrl,
})

authenticatedAxiosInstance.interceptors.request.use((config) => {
  if (!!localStorage.getItem('jwt_token') && localStorage.getItem('jwt_token') !== '') {
    config.headers['Authorization'] = `Bearer ${localStorage.getItem('jwt_token') ?? ''}`
  }
  return config
})

const notAuthenticatedAxiosInstance = axios.create({
  baseURL: serverBaseUrl,
})

notAuthenticatedAxiosInstance.interceptors.request.use((config) => {
  return config
})

export { authenticatedAxiosInstance as axiosInstance, notAuthenticatedAxiosInstance }
