import { IGlobalConfig } from './types'

const getEnvironmentVariable = <T = string>(key: string, useJson = false): T | undefined => {
  const value = process.env[key] || window.RUNTIME_ENVIRONMENT_VARIABLES?.[key]

  if (!value) {
    return undefined
  }

  try {
    return useJson ? (JSON.parse(value) as T) : (value as T)
  } catch {
    return undefined
  }
}

export const GLOBAL_CONFIG: IGlobalConfig = {
  title: getEnvironmentVariable('APPLICATION_TITLE') || 'ThesisTrack',

  chair_name: getEnvironmentVariable('CHAIR_NAME') || 'ThesisTrack',
  chair_url: getEnvironmentVariable('CHAIR_URL') || window.origin,

  allow_suggested_topics: (getEnvironmentVariable('ALLOW_SUGGESTED_TOPICS') || 'true') === 'true',

  genders: getEnvironmentVariable<Record<string, string>>('GENDERS', true) || {
    MALE: 'Male',
    FEMALE: 'Female',
    OTHER: 'Other',
    PREFER_NOT_TO_SAY: 'Prefer not to say',
  },

  study_degrees: getEnvironmentVariable<Record<string, string>>('STUDY_DEGREES', true) || {
    BACHELOR: 'Bachelor',
    MASTER: 'Master',
  },

  study_programs: getEnvironmentVariable<Record<string, string>>('STUDY_PROGRAMS', true) || {
    COMPUTER_SCIENCE: 'Computer Science',
    INFORMATION_SYSTEMS: 'Information Systems',
    GAMES_ENGINEERING: 'Games Engineering',
    MANAGEMENT_AND_TECHNOLOGY: 'Management and Technology',
    OTHER: 'Other',
  },

  thesis_types: getEnvironmentVariable<Record<string, string>>('THESIS_TYPES', true) || {
    BACHELOR: 'Bachelor Thesis',
    MASTER: 'Master Thesis',
    INTERDISCIPLINARY_PROJECT: 'Interdisciplinary Project',
    GUIDED_RESEARCH: 'Guided Research',
  },

  languages: getEnvironmentVariable<Record<string, string>>('LANGUAGES', true) || {
    ENGLISH: 'English',
    GERMAN: 'German',
  },

  custom_data: getEnvironmentVariable<IGlobalConfig['custom_data']>('CUSTOM_DATA', true) || {
    GITHUB: {
      label: 'Github Username',
      required: false,
    },
  },

  thesis_files: getEnvironmentVariable<IGlobalConfig['thesis_files']>('THESIS_FILES', true) || {
    PRESENTATION: {
      label: 'Presentation',
      accept: 'pdf',
      required: true,
    },
    PRESENTATION_SOURCE: {
      label: 'Presentation Source',
      accept: 'any',
      required: false,
    },
    FEEDBACK_LOG: {
      label: 'Feedback Log',
      accept: 'pdf',
      required: false,
    },
  },

  privacy_text: getEnvironmentVariable('PRIVACY') || '',
  imprint_text: getEnvironmentVariable('IMPRINT') || '',

  default_supervisors: getEnvironmentVariable('DEFAULT_SUPERVISOR_UUID')?.split(';') || [],
  calendar_url: getEnvironmentVariable('CALDAV_URL') || '',
  server_host: getEnvironmentVariable('SERVER_HOST') || 'http://localhost:8080',

  keycloak: {
    host: getEnvironmentVariable('KEYCLOAK_HOST') || 'http://localhost:8081',
    realm: getEnvironmentVariable('KEYCLOAK_REALM_NAME') || 'thesis-track',
    client_id: getEnvironmentVariable('KEYCLOAK_CLIENT_ID') || 'thesis-track-app',
  },
}
