import { IGlobalConfig } from './types'

export const GLOBAL_CONFIG: IGlobalConfig = {
  title: 'Thesis Track',

  focus_topics: {
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

  research_areas: {
    EDUCATION_TECHNOLOGIES: 'Education Technologies',
    HUMAN_COMPUTER_INTERACTION: 'Human Computer Interaction',
    ROBOTIC: 'Robotic',
    SOFTWARE_ENGINEERING: 'Software Engineering',
  },

  genders: {
    MALE: 'Male',
    FEMALE: 'Female',
    OTHER: 'Other',
    PREFER_NOT_TO_SAY: 'Prefer not to say',
  },

  study_degrees: {
    BACHELOR: 'Bachelor',
    MASTER: 'Master',
  },

  study_programs: {
    COMPUTER_SCIENCE: 'Computer Science',
    INFORMATION_SYSTEMS: 'Information Systems',
    GAMES_ENGINEERING: 'Games Engineering',
    MANAGEMENT_AND_TECHNOLOGY: 'Management and Technology',
    OTHER: 'Other',
  },

  api_server: process.env.API_SERVER_HOST || 'http://localhost:8080',

  keycloak: {
    host: process.env.KEYCLOAK_HOST || 'http://localhost:8081',
    realm: process.env.KEYCLOAK_REALM_NAME || 'thesis-track',
    client_id: process.env.KEYCLOAK_CLIENT_ID || 'thesis-track-client',
    get_unique_id: (decodedJwt) => decodedJwt.preferred_username,
  },
}
