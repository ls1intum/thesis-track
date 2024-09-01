const { promises: fsp } = require('fs')

const ALLOWED_ENVIRONMENT_VARIABLES = [
  'SERVER_HOST',
  'KEYCLOAK_HOST',
  'KEYCLOAK_REALM_NAME',
  'KEYCLOAK_CLIENT_ID',
  'DEFAULT_SUPERVISOR_UUID',
  'APPLICATION_TITLE',
  'CHAIR_NAME',
  'CHAIR_URL',
  'GENDERS',
  'STUDY_DEGREES',
  'STUDY_PROGRAMS',
  'CUSTOM_DATA',
  'PRIVACY',
  'IMPRINT',
  'CALDAV_URL',
]

async function generateConfig() {
  const runtimeEnvironment = {}

  for (const key of ALLOWED_ENVIRONMENT_VARIABLES) {
    if (process.env[key]) {
      runtimeEnvironment[key] = process.env[key]
    }
  }

  await fsp.writeFile(
    'runtime-env.js',
    `window.RUNTIME_ENVIRONMENT_VARIABLES=${JSON.stringify(runtimeEnvironment)};\n`,
    'utf-8',
  )
}

void generateConfig()
