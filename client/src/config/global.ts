import { IGlobalConfig } from './types'

const getEnvironmentVariable = <T = string>(key: string, useJson = false): T | undefined => {
  const value = process.env[key] || window.RUNTIME_ENVIRONMENT_VARIABLES?.[key];

  if (!value) {
    return undefined
  }

  try {
    return useJson ? JSON.parse(value) as T : value as T
  } catch {
    return undefined
  }
}

export const GLOBAL_CONFIG: IGlobalConfig = {
  title: getEnvironmentVariable('APPLICATION_TITLE') || 'Thesis Track',

  focus_topics: getEnvironmentVariable<Record<string, string>>('FOCUS_TOPICS', true) || {
    COMPETENCIES: 'Competencies',
    TEAM_BASED_LEARNING: 'Team-based Learning',
    AUTOMATIC_ASSESSMENT: 'Automatic Assessment',
    LEARNING_PLATFORMS: 'Learning Platforms',
    MACHINE_LEARNING: 'Machine Learning',
    DEI: 'Diversity, Equity & Inclusion',
    LEARNING_ANALYTICS: 'Learning Analytics',
    ADAPTIVE_LEARNING: 'Adaptive Learning',
    K12_SCHOOLS: 'K12 / Schools',
    SECURITY: 'Security',
    INFRASTRUCTURE: 'Infrastructure',
    AGILE_DEVELOPMENT: 'Agile Development',
    MOBILE_DEVELOPMENT: 'Mobile Development',
    CONTINUOUS: 'Continuous *',
    MODELING: 'Modeling',
    INNOVATION: 'Innovation',
    PROJECT_COURSES: 'Project Courses',
    DISTRIBUTED_SYSTEMS: 'Distributed Systems',
    DEPLOYMENT: 'Deployment',
    DEV_OPS: 'DevOps',
    INTERACTION_DESIGN: 'Interaction Design',
    USER_INVOLVEMENT: 'User Involvement',
    USER_EXPERIENCE: 'User Experience',
    CREATIVITY: 'Creativity',
    USER_MODEL: 'User Model',
    INTERACTIVE_TECHNOLOGY: 'Interactive Technology',
    MOCK_UPS: 'Mock-ups',
    PROTOTYPING: 'Prototyping',
    EMBEDDED_SYSTEMS: 'Embedded Systems',
    DUCKIETOWN: 'Duckietown',
    AUTONOMOUS_DRIVING: 'Autonomous Driving',
    COMMUNICATION: 'Communication',
    DISTRIBUTED_CONTROL: 'Distributed Control',
    LEARNING_AUTONOMY: 'Learning Autonomy',
    HW_SW_CO_DESIGN: 'HW/SW Co-Design',
  },

  research_areas: getEnvironmentVariable<Record<string, string>>('RESEARCH_AREAS', true) || {
    EDUCATION_TECHNOLOGIES: 'Education Technologies',
    HUMAN_COMPUTER_INTERACTION: 'Human Computer Interaction',
    ROBOTIC: 'Robotic',
    SOFTWARE_ENGINEERING: 'Software Engineering',
  },

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

  server_host: getEnvironmentVariable('SERVER_HOST') || 'http://localhost:8080',

  keycloak: {
    host: getEnvironmentVariable('KEYCLOAK_HOST') || 'http://localhost:8081',
    realm: getEnvironmentVariable('KEYCLOAK_REALM_NAME') || 'thesis-track',
    client_id: getEnvironmentVariable('KEYCLOAK_CLIENT_ID') || 'thesis-track-app',
    university_id_jwt_attribute: getEnvironmentVariable('UNIVERSITY_ID_JWT_ATTRIBUTE') || 'preferred_username',
  },
}
