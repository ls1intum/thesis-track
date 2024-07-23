const { promises: fsp } = require('fs');

const ALLOWED_ENVIRONMENT_VARIABLES = [
  'APPLICATION_TITLE',
  'FOCUS_TOPICS',
  'RESEARCH_AREAS',
  'GENDERS',
  'STUDY_DEGREES',
  'STUDY_PROGRAMS',
  'API_SERVER_HOST',
  'KEYCLOAK_HOST',
  'KEYCLOAK_REALM_NAME',
  'KEYCLOAK_CLIENT_ID',
  'UNIVERSITY_ID_JWT_FIELD'
];

async function generateConfig() {
  const runtimeEnvironment = {};

  for (const key of ALLOWED_ENVIRONMENT_VARIABLES) {
    if (process.env[key]) {
      runtimeEnvironment[key] = process.env[key];
    }
  }

  await fsp.writeFile('runtime-env.js', `window.RUNTIME_ENVIRONMENT_VARIABLES=${JSON.stringify(runtimeEnvironment)};`, 'utf-8');
}

void generateConfig();